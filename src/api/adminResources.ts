import { apiClient } from "./client";
import { ApiResponse } from "@/types/course";

export interface AdminResource {
  id: number;
  course_id: number;
  title: string;
  order?: number | null;
  file_name?: string | null;
  file_size?: number | null;
  file_path?: string | null;
  created_at?: string | null;
}

export interface CreateResourcePayload {
  title: string;
  order: number;
  file_name?: string;
  file_size?: number;
}

export interface UpdateResourcePayload {
  title: string;
  order: number;
}

/** Presigned Bunny Storage upload info minted by Laravel. Never built client-side. */
export interface ResourceUploadCredentials {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  expires_at?: string;
}

type ResourceEnvelope = ApiResponse<{ resource: AdminResource } | AdminResource>;

export const listCourseResources = (courseId: number) =>
  apiClient.get<ApiResponse<AdminResource[] | { resources: AdminResource[] }>>(
    `/admin/courses/${courseId}/resources`
  );

export const createCourseResource = (courseId: number, data: CreateResourcePayload) =>
  apiClient.post<ResourceEnvelope>(`/admin/courses/${courseId}/resources`, data);

export const updateCourseResource = (
  courseId: number,
  resourceId: number,
  data: UpdateResourcePayload
) =>
  apiClient.put<ResourceEnvelope>(
    `/admin/courses/${courseId}/resources/${resourceId}`,
    data
  );

export const deleteCourseResource = (courseId: number, resourceId: number) =>
  apiClient.delete<ApiResponse<null>>(
    `/admin/courses/${courseId}/resources/${resourceId}`
  );

export const getResourceUploadCredentials = (courseId: number, resourceId: number) =>
  apiClient.get<ResourceUploadCredentials | ApiResponse<ResourceUploadCredentials>>(
    `/admin/courses/${courseId}/resources/${resourceId}/upload-credentials`
  );

export const completeResourceUpload = (courseId: number, resourceId: number) =>
  apiClient.post<ResourceEnvelope>(
    `/admin/courses/${courseId}/resources/${resourceId}/complete`,
    {}
  );
