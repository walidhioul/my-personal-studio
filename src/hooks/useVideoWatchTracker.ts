import { useCallback, useEffect, useRef } from "react";

/**
 * Tracks how much of the currently playing video has been watched and
 * fires `onThreshold` once (per video) when the learner reaches the
 * configured percentage.
 *
 * The Bunny Stream embed speaks the player.js protocol over postMessage,
 * so we subscribe to its `timeupdate` events. If the player never reports
 * progress (blocked messages, older embed), we fall back to counting the
 * time the lesson has been open against its known duration.
 */

const PLAYER_JS_CONTEXT = "player.js";

interface Options {
  videoId: number | undefined;
  duration: number | null | undefined;
  threshold?: number;
  enabled?: boolean;
  onThreshold: (videoId: number) => void;
}

export const useVideoWatchTracker = ({
  videoId,
  duration,
  threshold = 0.8,
  enabled = true,
  onThreshold,
}: Options) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  /* Video IDs already reported — guarantees a single request per video. */
  const reportedRef = useRef<Set<number>>(new Set());

  /* Whether the player is reporting real progress. */
  const receivedProgressRef = useRef(false);

  const onThresholdRef = useRef(onThreshold);
  onThresholdRef.current = onThreshold;

  const report = useCallback((id: number) => {
    if (reportedRef.current.has(id)) return;

    reportedRef.current.add(id);

    onThresholdRef.current(id);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* player.js listener                                                     */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!enabled || !videoId) return;

    receivedProgressRef.current = false;

    const subscribe = () => {
      const frame = iframeRef.current;

      if (!frame?.contentWindow) return;

      ["timeupdate", "ended"].forEach((event) => {
        frame.contentWindow?.postMessage(
          JSON.stringify({
            context: PLAYER_JS_CONTEXT,
            version: "0.0.11",
            method: "addEventListener",
            value: event,
            listener: `lovable-${event}`,
          }),
          "*",
        );
      });
    };

    /* The embed may not be ready on first paint. */
    const subscribeTimers = [0, 500, 1500, 3000].map((delay) =>
      window.setTimeout(subscribe, delay),
    );

    const handleMessage = (message: MessageEvent) => {
      let payload: unknown = message.data;

      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }

      if (
        !payload ||
        typeof payload !== "object" ||
        (payload as { context?: string }).context !== PLAYER_JS_CONTEXT
      ) {
        return;
      }

      const { event, value } = payload as {
        event?: string;
        value?: { seconds?: number; duration?: number };
      };

      if (event === "ended") {
        receivedProgressRef.current = true;
        report(videoId);
        return;
      }

      if (event !== "timeupdate" || !value) return;

      receivedProgressRef.current = true;

      const total = value.duration || duration || 0;
      const seconds = value.seconds ?? 0;

      if (total > 0 && seconds / total >= threshold) {
        report(videoId);
      }
    };

    window.addEventListener("message", handleMessage);

    /* ------------------------------------------------------------------ */
    /* Fallback: elapsed time while the lesson is open                     */
    /* ------------------------------------------------------------------ */

    let elapsed = 0;

    const fallbackTimer = window.setInterval(() => {
      if (receivedProgressRef.current) return;
      if (document.hidden) return;
      if (!duration || duration <= 0) return;

      elapsed += 1;

      if (elapsed / duration >= threshold) {
        report(videoId);
      }
    }, 1000);

    return () => {
      subscribeTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearInterval(fallbackTimer);
      window.removeEventListener("message", handleMessage);
    };
  }, [enabled, videoId, duration, threshold, report]);

  return { iframeRef };
};
