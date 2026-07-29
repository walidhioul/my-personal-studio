import type { QuestionType } from "@/api/evaluationQuizzes";

/** Draft (client-side) shapes — use temporary UUIDs, never sent to the backend. */
export interface DraftAnswer {
  tempId: string;
  answer_text: string;
  is_correct: boolean;
}

export interface DraftQuestion {
  tempId: string;
  question_text: string;
  type: QuestionType;
  answers: DraftAnswer[];
}

export interface DraftQuiz {
  title: string;
  description: string;
  passing_score: number | "";
  type: string;
  questions: DraftQuestion[];
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tmp-${Math.random().toString(36).slice(2)}${Date.now()}`;

export const makeAnswer = (text = "", correct = false): DraftAnswer => ({
  tempId: uid(),
  answer_text: text,
  is_correct: correct,
});

export const makeTrueFalseAnswers = (): DraftAnswer[] => [
  makeAnswer("True", true),
  makeAnswer("False", false),
];

export const makeQuestion = (type: QuestionType = "single_choice"): DraftQuestion => ({
  tempId: uid(),
  question_text: "",
  type,
  answers: type === "true_false" ? makeTrueFalseAnswers() : [makeAnswer(), makeAnswer()],
});

export const emptyQuiz = (): DraftQuiz => ({
  title: "",
  description: "",
  passing_score: "",
  type: "evaluation",
  questions: [makeQuestion()],
});

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  true_false: "True / False",
};
