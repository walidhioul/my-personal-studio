import { apiClient } from "./client";
import { FeedbackResponse } from "../types/feedback";

export async function getFeedbacks(): Promise<FeedbackResponse> {
  return apiClient.get<FeedbackResponse>("/feedbacks");
}
