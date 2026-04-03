import { apiClient } from "./client";
import { ApiResponse, DashboardData } from "@/types/course";

export function getDashboardData() {
  return apiClient.get<ApiResponse<DashboardData>>("/dashboard");
}

export function updateProgress(data: { course_id: number; lesson_id: number }) {
  return apiClient.post<ApiResponse<{ progress: number }>>("/progress", data);
}
