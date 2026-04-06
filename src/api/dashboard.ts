import { apiClient } from "./client";
import { ApiResponse, DashboardData } from "@/types/course";

export function getDashboardData() {
  return apiClient.get<ApiResponse<DashboardData>>("/dashboard");
}

