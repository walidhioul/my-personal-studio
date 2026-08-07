import { useCallback, useEffect, useRef, useState } from "react";
import * as tus from "tus-js-client";
import { toast } from "sonner";
import * as admin from "@/api/admin";

export type UploadPhase = "idle" | "starting" | "uploading" | "completed" | "error";

export interface UploadState {
  phase: UploadPhase;
  percent: number;
  uploaded: number;
  total: number;
  /** bytes / second, null while unknown */
  speed: number | null;
  /** seconds remaining, null while unknown */
  eta: number | null;
  fileName?: string;
  error?: string;
}

const initialState: UploadState = {
  phase: "idle",
  percent: 0,
  uploaded: 0,
  total: 0,
  speed: null,
  eta: null,
};

export const formatBytes = (bytes: number) => {
  if (!bytes || bytes < 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
};

export const formatSpeed = (bps: number | null) =>
  bps == null ? null : `${formatBytes(bps)}/s`;

export const formatEta = (seconds: number | null) => {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  if (m < 60) return `${m}m ${rest}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

/**
 * Bunny Stream direct upload: fetch temporary credentials from Laravel, then
 * run a resumable browser -> Bunny tus upload with progress reporting.
 */
export function useBunnyVideoUpload() {
  const [uploads, setUploads] = useState<Record<number, UploadState>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const targetRef = useRef<{ courseId: number; videoId: number } | null>(null);
  const lastFileRef = useRef<Record<number, File>>({});
  const activeRef = useRef<Record<number, tus.Upload>>({});
  const sampleRef = useRef<Record<number, { time: number; bytes: number }>>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      Object.values(activeRef.current).forEach((u) => {
        try {
          u.abort();
        } catch {
          /* noop */
        }
      });
      activeRef.current = {};
    };
  }, []);

  const patch = useCallback((videoId: number, next: Partial<UploadState>) => {
    if (!mountedRef.current) return;
    setUploads((prev) => ({
      ...prev,
      [videoId]: { ...(prev[videoId] ?? initialState), ...next },
    }));
  }, []);

  const runUpload = useCallback(
    async (courseId: number, videoId: number, file: File) => {
      if (activeRef.current[videoId]) return;

      lastFileRef.current[videoId] = file;
      sampleRef.current[videoId] = { time: Date.now(), bytes: 0 };
      patch(videoId, {
        phase: "starting",
        percent: 0,
        uploaded: 0,
        total: file.size,
        speed: null,
        eta: null,
        fileName: file.name,
        error: undefined,
      });

      try {
        const res = await admin.getVideoUploadCredentials(courseId, videoId);
        const creds = ((res as { data?: admin.VideoUploadCredentials })?.data ??
          res) as admin.VideoUploadCredentials;

        if (!creds?.endpoint || !creds?.headers) {
          throw new Error("Invalid upload credentials received");
        }

        const upload = new tus.Upload(file, {
          endpoint: creds.endpoint,
          // Resumable: retry instead of restarting when the network drops.
          retryDelays: [0, 3000, 5000, 10000, 20000, 30000],
          headers: creds.headers,
          removeFingerprintOnSuccess: true,
          metadata: {
            filetype: file.type,
            title: file.name,
          },
          onProgress: (uploaded, total) => {
            const now = Date.now();
            const sample = sampleRef.current[videoId];
            let speed: number | null = null;
            if (sample) {
              const dt = (now - sample.time) / 1000;
              if (dt >= 0.75) {
                const delta = uploaded - sample.bytes;
                speed = delta > 0 ? delta / dt : 0;
                sampleRef.current[videoId] = { time: now, bytes: uploaded };
              }
            }
            setUploads((prev) => {
              const current = prev[videoId] ?? initialState;
              const nextSpeed = speed ?? current.speed;
              const remaining = total - uploaded;
              return {
                ...prev,
                [videoId]: {
                  ...current,
                  phase: "uploading",
                  uploaded,
                  total,
                  percent: total ? (uploaded / total) * 100 : 0,
                  speed: nextSpeed,
                  eta:
                    nextSpeed && nextSpeed > 0 ? remaining / nextSpeed : current.eta,
                },
              };
            });
          },
          onSuccess: () => {
            delete activeRef.current[videoId];
            patch(videoId, {
              phase: "completed",
              percent: 100,
              uploaded: file.size,
              total: file.size,
              speed: null,
              eta: null,
            });
            toast.success("Upload completed — Bunny is processing the video");
          },
          onError: (error) => {
            delete activeRef.current[videoId];
            patch(videoId, {
              phase: "error",
              error: error?.message || "Upload failed",
            });
            toast.error(error?.message || "Upload failed");
          },
        });

        // Resume an unfinished upload of the same file instead of duplicating it.
        const previous = await upload.findPreviousUploads();
        if (previous.length > 0) {
          upload.resumeFromPreviousUpload(previous[0]);
          toast.info("Resuming previous upload");
        }

        activeRef.current[videoId] = upload;
        upload.start();
        patch(videoId, { phase: "uploading" });
      } catch (e) {
        delete activeRef.current[videoId];
        const message = (e as Error).message || "Could not start upload";
        patch(videoId, { phase: "error", error: message });
        toast.error(message);
      }
    },
    [patch]
  );

  const selectFile = useCallback((courseId: number, videoId: number) => {
    targetRef.current = { courseId, videoId };
    inputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(
    (file: File | undefined) => {
      const target = targetRef.current;
      if (inputRef.current) inputRef.current.value = "";
      if (!file || !target) return;
      void runUpload(target.courseId, target.videoId, file);
    },
    [runUpload]
  );

  const retry = useCallback(
    (courseId: number, videoId: number) => {
      const file = lastFileRef.current[videoId];
      if (!file) {
        selectFile(courseId, videoId);
        return;
      }
      void runUpload(courseId, videoId, file);
    },
    [runUpload, selectFile]
  );

  const getUpload = useCallback(
    (videoId: number): UploadState => uploads[videoId] ?? initialState,
    [uploads]
  );

  return { inputRef, selectFile, handleFileSelected, retry, uploads, getUpload };
}
