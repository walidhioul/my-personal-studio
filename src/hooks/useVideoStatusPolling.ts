import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as admin from "@/api/admin";

export type VideoStatus = admin.VideoStatus;

export interface VideoStatusState {
  status: VideoStatus;
  /** true while a poll request failed and we are retrying */
  reconnecting: boolean;
  error?: string;
}

const POLL_INTERVAL = 5000;
const isTerminal = (s: VideoStatus) => s === "ready" || s === "failed";

const readStatus = (res: unknown): VideoStatus | null => {
  const payload =
    (res as { data?: admin.AdminVideo })?.data ?? (res as admin.AdminVideo);
  const status = payload?.status;
  return status ? (String(status).toLowerCase() as VideoStatus) : null;
};

/**
 * Polls GET /admin/courses/{courseId}/videos/{videoId} every 5s until the video
 * is `ready` or `failed`. One timer per video, cleaned up on unmount.
 */
export function useVideoStatusPolling() {
  const [statuses, setStatuses] = useState<Record<number, VideoStatusState>>({});
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const mounted = useRef(true);

  const clearTimer = useCallback((videoId: number) => {
    const t = timers.current[videoId];
    if (t) clearTimeout(t);
    delete timers.current[videoId];
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
  }, []);

  const poll = useCallback(
    async (courseId: number, videoId: number) => {
      if (!mounted.current) return;
      try {
        const res = await admin.getAdminVideo(courseId, videoId);
        if (!mounted.current) return;
        const status = readStatus(res) ?? "processing";

        setStatuses((prev) => ({
          ...prev,
          [videoId]: { status, reconnecting: false },
        }));

        if (status === "ready") {
          clearTimer(videoId);
          toast.success("Video is ready for streaming");
          return;
        }
        if (status === "failed") {
          clearTimer(videoId);
          toast.error("Video processing failed");
          return;
        }
      } catch (e) {
        if (!mounted.current) return;
        // Temporary network issue: keep polling, surface a subtle indicator.
        setStatuses((prev) => ({
          ...prev,
          [videoId]: {
            status: prev[videoId]?.status ?? "processing",
            reconnecting: true,
            error: (e as Error).message,
          },
        }));
      }
      timers.current[videoId] = setTimeout(
        () => void poll(courseId, videoId),
        POLL_INTERVAL
      );
    },
    [clearTimer]
  );

  /** Idempotent — never creates a second timer for the same video. */
  const startPolling = useCallback(
    (courseId: number, videoId: number, initial: VideoStatus = "processing") => {
      if (timers.current[videoId]) return;
      if (isTerminal(initial)) return;
      setStatuses((prev) => ({
        ...prev,
        [videoId]: { status: initial, reconnecting: false },
      }));
      timers.current[videoId] = setTimeout(
        () => void poll(courseId, videoId),
        POLL_INTERVAL
      );
    },
    [poll]
  );

  const stopPolling = useCallback(
    (videoId: number) => clearTimer(videoId),
    [clearTimer]
  );

  const reset = useCallback(
    (videoId: number) => {
      clearTimer(videoId);
      setStatuses((prev) => {
        const next = { ...prev };
        delete next[videoId];
        return next;
      });
    },
    [clearTimer]
  );

  const getStatus = useCallback(
    (videoId: number): VideoStatusState | undefined => statuses[videoId],
    [statuses]
  );

  return { statuses, getStatus, startPolling, stopPolling, reset };
}
