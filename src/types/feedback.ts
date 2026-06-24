// src/types/feedback.ts
export interface FeedbackCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  picture: string;
  price: number;
  level: string;
}

export interface Feedback {
  id: number;
  user_id: number;
  course_id: number;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  course: FeedbackCourse;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  data: Feedback[];
}