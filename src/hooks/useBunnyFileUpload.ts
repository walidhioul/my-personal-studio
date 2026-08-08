import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as filesApi from "@/api/adminFiles";

export type FileUploadPhase =
  | "idle"
  | "starting"
  | "uploading"
  | "completed"
  | "error"
  | "cancelled";

export interface FileUploadState {
  phase: FileUploadPhase;
  percent: number;
  uploaded: number;
  total: number;
  speed: number | null;
  eta: number | null;
  fileName?: string;
  error?: string;
}

const initialState: FileUploadState = {
  phase: "idle",
  percent: 0,
  uploaded: 0,
  total: 0,
  speed: null,
  eta: null,
};

export const MAX_PDF_BYTES = 100 * 1024 * 1024; // 100 MB

export const formatBytes = (bytes: number) => {
  if (!bytes || bytes < 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
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
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

export const validatePdf = (file: File): string | null => {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Only PDF files are allowed";
  if (file.size === 0) return "The selected PDF is empty";
  if (file.size > MAX_PDF_BYTES)
    return `File too large — maximum size is ${formatBytes(MAX_PDF_BYTES)}`;
  return null;
};

const resolveEndpoint = (creds: filesApi.FileUploadCredentials) =>
  creds.endpoint || creds.url || creds.upload_url || "";

/**
 * Requests fresh upload credentials from Laravel, then uploads the PDF directly
 * from the browser to Bunny Storage (browser -> Bunny, never through Laravel).
 */
export function useBunnyFileUpload() {
  const [uploads, setUploads] = useState<Record<number, FileUploadState>>({});
  const filesRef = useRef<Record<number, File>>({});
  const activeRef = useRef<Record<number, XMLHttpRequest>>({});
  const sampleRef = useRef<Record<number, { time: number; bytes: number }>>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      Object.values(activeRef.current).forEach((xhr) => {
        try {
          xhr.abort();
        } catch {
          /* noop */
        }
      });
      activeRef.current = {};
    };
  }, []);

  const patch = useCallback((fileId: number, next: Partial<FileUploadState>) => {
    if (!mountedRef.current) return;
    setUploads((prev) => ({
      ...prev,
      [fileId]: { ...(prev[fileId] ?? initialState), ...next },
    }));
  }, []);

  /** Keep the selected file in memory so upload/retry never re-creates a record. */
  const rememberFile = useCallback((fileId: number, file: File) => {
    filesRef.current[fileId] = file;
  }, []);

  const hasFile = useCallback((fileId: number) => !!filesRef.current[fileId], []);

  const startUpload = useCallback(
    async (courseId: number, fileId: number, file?: File) => {
      if (activeRef.current[fileId]) return; // no simultaneous uploads per file
      const target = file ?? filesRef.current[fileId];
      if (!target) {
        patch(fileId, {
          phase: "error",
          error: "Select the PDF again to upload it",
        });
        return;
      }

      const invalid = validatePdf(target);
      if (invalid) {
        patch(fileId, { phase: "error", error: invalid });
        toast.error(invalid);
        return;
      }

      filesRef.current[fileId] = target;
      sampleRef.current[fileId] = { time: Date.now(), bytes: 0 };
      patch(fileId, {
        phase: "starting",
        percent: 0,
        uploaded: 0,
        total: target.size,
        speed: null,
        eta: null,
        fileName: target.name,
        error: undefined,
      });

      let creds: filesApi.FileUploadCredentials;
      try {
        const res = await filesApi.getFileUploadCredentials(courseId, fileId);
        creds = ((res as { data?: filesApi.FileUploadCredentials })?.data ??
          res) as filesApi.FileUploadCredentials;
      } catch (e) {
        const message =
          (e as Error).message || "Could not get upload credentials";
        patch(fileId, { phase: "error", error: message });
        toast.error(message);
        return;
      }

      const endpoint = resolveEndpoint(creds);
      if (!endpoint) {
        const message = "Invalid upload credentials received";
        patch(fileId, { phase: "error", error: message });
        toast.error(message);
        return;
      }

      const xhr = new XMLHttpRequest();
      activeRef.current[fileId] = xhr;
      xhr.open((creds.method || "PUT").toUpperCase(), endpoint, true);
      Object.entries(creds.headers ?? {}).forEach(([k, v]) =>
        xhr.setRequestHeader(k, v)
      );

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const now = Date.now();
        const sample = sampleRef.current[fileId];
        let speed: number | null = null;
        if (sample) {
          const dt = (now - sample.time) / 1000;
          if (dt >= 0.75) {
            const delta = event.loaded - sample.bytes;
            speed = delta > 0 ? delta / dt : 0;
            sampleRef.current[fileId] = { time: now, bytes: event.loaded };
          }
        }
        setUploads((prev) => {
          const current = prev[fileId] ?? initialState;
          const nextSpeed = speed ?? current.speed;
          const remaining = event.total - event.loaded;
          return {
            ...prev,
            [fileId]: {
              ...current,
              phase: "uploading",
              uploaded: event.loaded,
              total: event.total,
              percent: event.total ? (event.loaded / event.total) * 100 : 0,
              speed: nextSpeed,
              eta: nextSpeed && nextSpeed > 0 ? remaining / nextSpeed : current.eta,
            },
          };
        });
      };

      xhr.onload = () => {
        delete activeRef.current[fileId];
        if (xhr.status >= 200 && xhr.status < 300) {
          patch(fileId, {
            phase: "completed",
            percent: 100,
            uploaded: target.size,
            total: target.size,
            speed: null,
            eta: null,
          });
          toast.success("PDF uploaded successfully");
        } else {
          const message =
            xhr.status === 401 || xhr.status === 403
              ? "Upload credentials expired — retry the upload"
              : `Bunny upload failed (${xhr.status})`;
          patch(fileId, { phase: "error", error: message });
          toast.error(message);
        }
      };

      xhr.onerror = () => {
        delete activeRef.current[fileId];
        const message = "Network failure during upload";
        patch(fileId, { phase: "error", error: message });
        toast.error(message);
      };

      xhr.onabort = () => {
        delete activeRef.current[fileId];
        patch(fileId, { phase: "cancelled", speed: null, eta: null });
      };

      patch(fileId, { phase: "uploading" });
      xhr.send(target);
    },
    [patch]
  );

  const cancel = useCallback((fileId: number) => {
    activeRef.current[fileId]?.abort();
  }, []);

  const getUpload = useCallback(
    (fileId: number): FileUploadState => uploads[fileId] ?? initialState,
    [uploads]
  );

  return { uploads, getUpload, startUpload, cancel, rememberFile, hasFile };
}
