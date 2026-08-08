import { apiClient } from "./client";
import { ApiResponse } from "@/types/course";

export type AdminFileStatus =
  | "pending_upload"
  | "uploading"
  | "verifying"
  | "ready"
  | "failed";

export interface AdminFile {
  id: number;
  course_id: number;
  title: string;
  description?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  status?: AdminFileStatus | string | null;
  created_at?: string | null;
}

export interface CreateFilePayload {
  title: string;
  description?: string;
  file_name: string;
  file_size?: number;
}

export interface UpdateFilePayload {
  title: string;
  description?: string;
}

/** Temporary Bunny Storage upload info minted by Laravel. Never built client-side. */
export interface FileUploadCredentials {
  /** Absolute Bunny Storage URL to PUT the file to. */
  endpoint?: string;
  url?: string;
  upload_url?: string;
  headers?: Record<string, string>;
  method?: string;
}

type FileEnvelope = ApiResponse<{ file: AdminFile } | AdminFile>;

export const listCourseFiles = (courseId: number) =>
  apiClient.get<ApiResponse<AdminFile[] | { files: AdminFile[] }>>(
    `/admin/courses/${courseId}/files`
  );

export const createCourseFile = (courseId: number, data: CreateFilePayload) =>
  apiClient.post<FileEnvelope>(`/admin/courses/${courseId}/files`, data);

export const getCourseFile = (courseId: number, fileId: number) =>
  apiClient.get<FileEnvelope>(`/admin/courses/${courseId}/files/${fileId}`);

export const updateCourseFile = (
  courseId: number,
  fileId: number,
  data: UpdateFilePayload
) => apiClient.put<FileEnvelope>(`/admin/courses/${courseId}/files/${fileId}`, data);

export const getFileUploadCredentials = (courseId: number, fileId: number) =>
  apiClient.get<FileUploadCredentials | ApiResponse<FileUploadCredentials>>(
    `/admin/courses/${courseId}/files/${fileId}/upload-credentials`
  );
