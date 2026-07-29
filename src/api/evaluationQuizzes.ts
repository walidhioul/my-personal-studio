import { apiClient } from "./client";

export type QuestionType = "single_choice" | "multiple_choice" | "true_false";

export interface AdminAnswer {
  id?: number;
  question_id?: number;
  answer_text: string;
  is_correct: boolean;
  order: number;
}

export interface AdminQuestion {
  id?: number;
  question_text: string;
  type: QuestionType;
  order: number;
  answers: AdminAnswer[];
}

export interface AdminEvaluationQuiz {
  id: number;
  title: string;
  description: string;
  type: string;
  course_id: number | null;
  passing_score: number;
  created_at?: string;
  questions: AdminQuestion[];
}

/** Payload sent to the backend — never contains ids. */
export interface EvaluationQuizPayload {
  title: string;
  description: string;
  passing_score: number;
  type: string;
  questions: {
    question_text: string;
    type: QuestionType;
    order: number;
    answers: { answer_text: string; is_correct: boolean; order: number }[];
  }[];
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: unknown;
  meta?: unknown;
}

const LIST_URL = "/admin/evaluation-quizzes";
const CREATE_URL = "/admin/evaluation-quizze";

export const listEvaluationQuizzes = () =>
  apiClient.get<ApiEnvelope<AdminEvaluationQuiz[]>>(LIST_URL);

export const getEvaluationQuiz = (id: number) =>
  apiClient.get<ApiEnvelope<AdminEvaluationQuiz>>(`${LIST_URL}/${id}`);

export const createEvaluationQuiz = (payload: EvaluationQuizPayload) =>
  apiClient.post<ApiEnvelope<AdminEvaluationQuiz>>(CREATE_URL, payload);

export const updateEvaluationQuiz = (id: number, payload: EvaluationQuizPayload) =>
  apiClient.put<ApiEnvelope<AdminEvaluationQuiz>>(`${LIST_URL}/${id}`, payload);

export const deleteEvaluationQuiz = (id: number) =>
  apiClient.delete<ApiEnvelope<null>>(`${LIST_URL}/${id}`);
