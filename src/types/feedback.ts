// src/types/feedback.ts
export interface Feedback {
  id: number;
  user_id: number;
  course_id: number;
  rating: number;
  comment: string | null;
  is_approved: boolean;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  data: Feedback[];
}