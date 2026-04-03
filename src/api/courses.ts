import { apiClient } from "./client";
import { ApiCourse, ApiCourseDetail, ApiResponse } from "@/types/course";

export function getCourses() {
  return apiClient.get<ApiResponse<ApiCourse[]>>("/courses");
}

export function getCourseById(id: string) {
  return apiClient.get<ApiResponse<ApiCourseDetail>>(`/courses/${id}`);
}
