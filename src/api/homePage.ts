import { apiClient } from "./client";
import { ApiResponse } from "@/types/course";
import { HomePageData } from "@/types/homePage";

export function getHomePageData() {
  return apiClient.get<ApiResponse<HomePageData>>("/home-page-data");
}
