import type {
  AdminEvaluationQuiz,
  EvaluationQuizPayload,
  QuestionType,
} from "@/api/evaluationQuizzes";
import { DraftQuiz, makeAnswer, uid } from "./types";

export interface QuizErrors {
  title?: string;
  description?: string;
  passing_score?: string;
  questions?: string;
  byQuestion: Record<
    string,
    { question_text?: string; answers?: string; byAnswer: Record<string, string> }
  >;
}

export function validateQuiz(quiz: DraftQuiz): { valid: boolean; errors: QuizErrors } {
  const errors: QuizErrors = { byQuestion: {} };

  if (!quiz.title.trim()) errors.title = "Title is required";
  else if (quiz.title.trim().length > 255) errors.title = "Title must be under 255 characters";

  if (!quiz.description.trim()) errors.description = "Description is required";

  if (quiz.passing_score === "" || Number.isNaN(Number(quiz.passing_score)))
    errors.passing_score = "Passing score is required";
  else if (Number(quiz.passing_score) < 0 || Number(quiz.passing_score) > 100)
    errors.passing_score = "Passing score must be between 0 and 100";

  if (quiz.questions.length === 0) errors.questions = "Add at least one question";

  quiz.questions.forEach((q) => {
    const qErr: QuizErrors["byQuestion"][string] = { byAnswer: {} };

    if (!q.question_text.trim()) qErr.question_text = "Question text is required";

    const correctCount = q.answers.filter((a) => a.is_correct).length;

    q.answers.forEach((a) => {
      if (!a.answer_text.trim()) qErr.byAnswer[a.tempId] = "Answer text is required";
    });

    if (q.type === "true_false") {
      if (q.answers.length !== 2) qErr.answers = "True/False must have exactly two answers";
      else if (correctCount !== 1) qErr.answers = "Select exactly one correct answer";
    } else if (q.type === "single_choice") {
      if (q.answers.length < 2) qErr.answers = "Add at least 2 answers";
      else if (correctCount !== 1) qErr.answers = "Select exactly one correct answer";
    } else {
      if (q.answers.length < 2) qErr.answers = "Add at least 2 answers";
      else if (correctCount < 1) qErr.answers = "Select at least one correct answer";
    }

    if (qErr.question_text || qErr.answers || Object.keys(qErr.byAnswer).length > 0)
      errors.byQuestion[q.tempId] = qErr;
  });

  const valid =
    !errors.title &&
    !errors.description &&
    !errors.passing_score &&
    !errors.questions &&
    Object.keys(errors.byQuestion).length === 0;

  return { valid, errors };
}

/** Strip temp ids and apply positional ordering. */
export function toPayload(quiz: DraftQuiz): EvaluationQuizPayload {
  return {
    title: quiz.title.trim(),
    description: quiz.description.trim(),
    passing_score: Number(quiz.passing_score),
    type: quiz.type || "evaluation",
    questions: quiz.questions.map((q, qi) => ({
      question_text: q.question_text.trim(),
      type: q.type,
      order: qi + 1,
      answers: q.answers.map((a, ai) => ({
        answer_text: a.answer_text.trim(),
        is_correct: a.is_correct,
        order: ai + 1,
      })),
    })),
  };
}

/** Map a backend quiz into an editable draft (real ids are replaced by temp ids in state). */
export function toDraft(quiz: AdminEvaluationQuiz): DraftQuiz {
  return {
    title: quiz.title ?? "",
    description: quiz.description ?? "",
    passing_score: quiz.passing_score ?? "",
    type: quiz.type || "evaluation",
    questions: [...(quiz.questions ?? [])]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((q) => ({
        tempId: uid(),
        question_text: q.question_text ?? "",
        type: (q.type as QuestionType) ?? "single_choice",
        answers: [...(q.answers ?? [])]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((a) => makeAnswer(a.answer_text ?? "", !!a.is_correct)),
      })),
  };
}
