// src/api/feedback.ts
import { FeedbackResponse } from "../types/feedback";
import { BASE_URL } from "../config/api";

export async function getFeedbacks(): Promise<FeedbackResponse> {
  const response = await fetch(`${BASE_URL}/feedbacks`);

  if (!response.ok) {
    throw new Error("Failed to fetch feedbacks");
  }

  const data: FeedbackResponse = await response.json();
  return data;
}