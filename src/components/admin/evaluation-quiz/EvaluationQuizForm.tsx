import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import QuestionCard from "./QuestionCard";
import { DraftQuestion, DraftQuiz, emptyQuiz, makeQuestion } from "./types";
import { QuizErrors, toPayload, validateQuiz } from "./quizUtils";
import type { EvaluationQuizPayload } from "@/api/evaluationQuizzes";

interface Props {
  initialValue?: DraftQuiz;
  submitting?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (payload: EvaluationQuizPayload) => void;
}

const EvaluationQuizForm = ({
  initialValue,
  submitting,
  submitLabel = "Save",
  onCancel,
  onSubmit,
}: Props) => {
  const [quiz, setQuiz] = useState<DraftQuiz>(initialValue ?? emptyQuiz());
  const [errors, setErrors] = useState<QuizErrors>({ byQuestion: {} });

  useEffect(() => {
    setQuiz(initialValue ?? emptyQuiz());
    setErrors({ byQuestion: {} });
  }, [initialValue]);

  const updateQuestion = useCallback((index: number, q: DraftQuestion) => {
    setQuiz((prev) => {
      const questions = [...prev.questions];
      questions[index] = q;
      return { ...prev, questions };
    });
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setQuiz((prev) => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
  }, []);

  const moveQuestion = useCallback((index: number, dir: -1 | 1) => {
    setQuiz((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.questions.length) return prev;
      const questions = [...prev.questions];
      [questions[index], questions[target]] = [questions[target], questions[index]];
      return { ...prev, questions };
    });
  }, []);

  const addQuestion = () =>
    setQuiz((prev) => ({ ...prev, questions: [...prev.questions, makeQuestion()] }));

  const handleSubmit = () => {
    const { valid, errors: next } = validateQuiz(quiz);
    setErrors(next);
    if (!valid) return;
    onSubmit(toPayload(quiz));
  };

  return (
    <div className="space-y-6">
      {/* General information */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">General Information</h3>
        <div className="space-y-1.5">
          <Label htmlFor="quiz-title">Title</Label>
          <Input
            id="quiz-title"
            value={quiz.title}
            placeholder="English Placement Test"
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quiz-description">Description</Label>
          <Textarea
            id="quiz-description"
            value={quiz.description}
            placeholder="Determine student's level"
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="quiz-passing-score">Passing Score</Label>
            <Input
              id="quiz-passing-score"
              type="number"
              min={0}
              max={100}
              value={quiz.passing_score}
              onChange={(e) =>
                setQuiz({
                  ...quiz,
                  passing_score: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
            {errors.passing_score && (
              <p className="text-xs text-destructive">{errors.passing_score}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quiz-type">Type</Label>
            <Input id="quiz-type" value={quiz.type} disabled readOnly />
          </div>
        </div>
      </section>

      {/* Questions builder */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Questions</h3>
          <Button type="button" size="sm" variant="outline" onClick={addQuestion}>
            <Plus size={14} /> Add Question
          </Button>
        </div>
        {errors.questions && <p className="text-xs text-destructive">{errors.questions}</p>}
        <div className="space-y-4">
          {quiz.questions.map((q, i) => (
            <QuestionCard
              key={q.tempId}
              question={q}
              index={i}
              total={quiz.questions.length}
              errors={errors.byQuestion[q.tempId]}
              onChange={(next) => updateQuestion(i, next)}
              onRemove={() => removeQuestion(i)}
              onMove={(dir) => moveQuestion(i, dir)}
            />
          ))}
        </div>
      </section>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default EvaluationQuizForm;
