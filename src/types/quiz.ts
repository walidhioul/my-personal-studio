export interface QuizAnswer {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
  order: number;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  type: "multiple_choice" | "true_false" | "short_answer" | string;
  order: number;
  answers: QuizAnswer[];
}

export interface EvaluationQuiz {
  id: number;
  title: string;
  type: string;
  course_id: number | null;
  description: string;
  passing_score: number;
  questions: QuizQuestion[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PlacementResultPayload {
  quiz_id: number;
  user_id: number | string;
  score: number;
  level: string;
}
