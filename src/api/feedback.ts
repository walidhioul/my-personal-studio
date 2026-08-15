import { apiClient } from "./client";
import { FeedbackResponse } from "../types/feedback";
import { ApiResponse } from "@/types/course";

export async function getFeedbacks(): Promise<FeedbackResponse> {
  return apiClient.get<FeedbackResponse>("/feedbacks");
}

export interface SubmitFeedbackPayload {
  rating: number;
  comment: string;
}

export interface SubmittedFeedback {
  id: number;
  user_id: number;
  course_id: number;
  rating: number;
  comment: string;
  is_approved: boolean;
}

export const submitFeedback = (courseId: number | string, data: SubmitFeedbackPayload) =>
  apiClient.post<ApiResponse<SubmittedFeedback>>(`/courses/${courseId}/feedback`, data);