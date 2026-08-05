import { useRef, useState } from "react";
import * as tus from "tus-js-client";
import { toast } from "sonner";
import * as admin from "@/api/admin";

/**
 * Step 1 of the Bunny Stream workflow: pick a file, fetch temporary
 * credentials from Laravel, then start a direct browser -> Bunny tus upload.
 * Progress / completion handling is intentionally not implemented yet.
 */
export function useBunnyVideoUpload() {
  const [startingId, setStartingId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const targetRef = useRef<{ courseId: number; videoId: number } | null>(null);

  const selectFile = (courseId: number, videoId: number) => {
    targetRef.current = { courseId, videoId };
    inputRef.current?.click();
  };

  const handleFileSelected = async (file: File | undefined) => {
    const target = targetRef.current;
    if (inputRef.current) inputRef.current.value = "";
    if (!file || !target) return;

    setStartingId(target.videoId);
    try {
      const res = await admin.getVideoUploadCredentials(target.courseId, target.videoId);
      const creds = ((res as { data?: admin.VideoUploadCredentials })?.data ??
        res) as admin.VideoUploadCredentials;

      if (!creds?.endpoint || !creds?.headers) {
        throw new Error("Invalid upload credentials received");
      }

      const upload = new tus.Upload(file, {
        endpoint: creds.endpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: creds.headers,
        metadata: {
          filetype: file.type,
          title: file.name,
        },
        onError: (error) => {
          toast.error(error?.message || "Upload failed to start");
        },
      });

      upload.start();
      toast.success(`Upload started for "${file.name}"`);
    } catch (e) {
      toast.error((e as Error).message || "Could not get upload credentials");
    } finally {
      setStartingId(null);
    }
  };

  return { inputRef, selectFile, handleFileSelected, startingId };
}
