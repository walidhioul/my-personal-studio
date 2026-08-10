import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as resourcesApi from "@/api/adminResources";

export type ResourceUploadPhase =
  | "idle"
  | "starting"
  | "uploading"
  | "verifying"
  | "ready"
  | "error";

export interface ResourceUploadState {
  phase: ResourceUploadPhase;
  percent: number;
  uploaded: number;
  total: number;
  fileName?: string;
  error?: string;
}

const initialState: ResourceUploadState = {
  phase: "idle",
  percent: 0,
  uploaded: 0,
  total: 0,
};

export const MAX_PDF_BYTES = 100 * 1024 * 1024; // 100 MB

export const formatBytes = (bytes: number) => {
  if (!bytes || bytes < 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
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

/**
 * Uploads a PDF straight from the browser to Bunny Storage using the presigned
 * URL minted by Laravel (Browser -> Bunny Storage), then confirms with /complete.
 */
export function useBunnyResourceUpload(onReady?: (resourceId: number) => void) {
  const [uploads, setUploads] = useState<Record<number, ResourceUploadState>>({});
  const filesRef = useRef<Record<number, File>>({});
  const activeRef = useRef<Record<number, XMLHttpRequest>>({});
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

  const patch = useCallback(
    (resourceId: number, next: Partial<ResourceUploadState>) => {
      if (!mountedRef.current) return;
      setUploads((prev) => ({
        ...prev,
        [resourceId]: { ...(prev[resourceId] ?? initialState), ...next },
      }));
    },
    []
  );

  /** Keep the selected PDF in memory so retries never create a new resource. */
  const rememberFile = useCallback((resourceId: number, file: File) => {
    filesRef.current[resourceId] = file;
  }, []);

  const hasFile = useCallback(
    (resourceId: number) => !!filesRef.current[resourceId],
    []
  );

  const startUpload = useCallback(
    async (courseId: number, resourceId: number, file?: File) => {
      if (activeRef.current[resourceId]) return; // prevent duplicate uploads
      const target = file ?? filesRef.current[resourceId];
      if (!target) {
        patch(resourceId, {
          phase: "error",
          error: "Select the PDF again to upload it",
        });
        return;
      }

      const invalid = validatePdf(target);
      if (invalid) {
        patch(resourceId, { phase: "error", error: invalid });
        toast.error(invalid);
        return;
      }

      filesRef.current[resourceId] = target;
      patch(resourceId, {
        phase: "starting",
        percent: 0,
        uploaded: 0,
        total: target.size,
        fileName: target.name,
        error: undefined,
      });

      // 1. Always request FRESH presigned credentials (handles expiry on retry).
      let creds: resourcesApi.ResourceUploadCredentials;
      try {
        const res = await resourcesApi.getResourceUploadCredentials(
          courseId,
          resourceId
        );
        creds = ((res as { data?: resourcesApi.ResourceUploadCredentials })?.data ??
          res) as resourcesApi.ResourceUploadCredentials;
      } catch (e) {
        const message = (e as Error).message || "Could not get upload URL";
        patch(resourceId, { phase: "error", error: message });
        toast.error(message);
        return;
      }

      if (!creds?.url) {
        const message = "Invalid upload URL received";
        patch(resourceId, { phase: "error", error: message });
        toast.error(message);
        return;
      }

      // 2. PUT the PDF directly to Bunny Storage.
      const xhr = new XMLHttpRequest();
      activeRef.current[resourceId] = xhr;
      xhr.open((creds.method || "PUT").toUpperCase(), creds.url, true);
      const headers = creds.headers ?? { "Content-Type": "application/pdf" };
      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        patch(resourceId, {
          phase: "uploading",
          uploaded: event.loaded,
          total: event.total,
          percent: event.total ? (event.loaded / event.total) * 100 : 0,
        });
      };

      xhr.onload = async () => {
        delete activeRef.current[resourceId];
        if (xhr.status < 200 || xhr.status >= 300) {
          const message =
            xhr.status === 401 || xhr.status === 403
              ? "Upload URL expired — retry the upload"
              : `Bunny upload failed (${xhr.status})`;
          patch(resourceId, { phase: "error", error: message });
          toast.error(message);
          return;
        }

        // 3. Verify with the backend — it is the source of truth.
        patch(resourceId, {
          phase: "verifying",
          percent: 100,
          uploaded: target.size,
          total: target.size,
        });
        try {
          await resourcesApi.completeResourceUpload(courseId, resourceId);
          patch(resourceId, { phase: "ready" });
          toast.success("PDF uploaded successfully");
          onReady?.(resourceId);
        } catch (e) {
          const message =
            (e as Error).message || "Could not confirm the upload — retry";
          patch(resourceId, { phase: "error", error: message });
          toast.error(message);
        }
      };

      xhr.onerror = () => {
        delete activeRef.current[resourceId];
        const message = "Network failure during upload";
        patch(resourceId, { phase: "error", error: message });
        toast.error(message);
      };

      xhr.onabort = () => {
        delete activeRef.current[resourceId];
        patch(resourceId, { phase: "error", error: "Upload cancelled" });
      };

      patch(resourceId, { phase: "uploading" });
      xhr.send(target);
    },
    [patch, onReady]
  );

  const cancel = useCallback((resourceId: number) => {
    activeRef.current[resourceId]?.abort();
  }, []);

  const getUpload = useCallback(
    (resourceId: number): ResourceUploadState => uploads[resourceId] ?? initialState,
    [uploads]
  );

  return { uploads, getUpload, startUpload, cancel, rememberFile, hasFile };
}
