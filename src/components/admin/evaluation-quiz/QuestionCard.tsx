import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import QuestionTypeSelector from "./QuestionTypeSelector";
import SingleChoiceEditor from "./SingleChoiceEditor";
import MultipleChoiceEditor from "./MultipleChoiceEditor";
import TrueFalseEditor from "./TrueFalseEditor";
import type { DraftQuestion } from "./types";
import { makeAnswer, makeTrueFalseAnswers } from "./types";
import type { QuestionType } from "@/api/evaluationQuizzes";

interface Props {
  question: DraftQuestion;
  index: number;
  total: number;
  errors?: { question_text?: string; answers?: string; byAnswer: Record<string, string> };
  onChange: (question: DraftQuestion) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}

const QuestionCard = ({ question, index, total, errors, onChange, onRemove, onMove }: Props) => {
  const patch = useCallback(
    (partial: Partial<DraftQuestion>) => onChange({ ...question, ...partial }),
    [question, onChange]
  );

  const handleTypeChange = (type: QuestionType) => {
    if (type === question.type) return;
    if (type === "true_false") {
      patch({ type, answers: makeTrueFalseAnswers() });
      return;
    }
    const base =
      question.type === "true_false"
        ? [makeAnswer(), makeAnswer()]
        : question.answers.map((a) => ({ ...a }));
    // single choice keeps at most one correct answer
    if (type === "single_choice") {
      let seen = false;
      base.forEach((a) => {
        if (a.is_correct && !seen) seen = true;
        else a.is_correct = false;
      });
    }
    patch({ type, answers: base });
  };

  const changeText = (answerId: string, text: string) =>
    patch({
      answers: question.answers.map((a) =>
        a.tempId === answerId ? { ...a, answer_text: text } : a
      ),
    });

  const toggleCorrect = (answerId: string, checked: boolean) =>
    patch({
      answers: question.answers.map((a) =>
        question.type === "multiple_choice"
          ? a.tempId === answerId
            ? { ...a, is_correct: checked }
            : a
          : { ...a, is_correct: a.tempId === answerId }
      ),
    });

  const addAnswer = () => patch({ answers: [...question.answers, makeAnswer()] });

  const removeAnswer = (answerId: string) =>
    patch({ answers: question.answers.filter((a) => a.tempId !== answerId) });

  return (
    <Card className="bg-muted/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
        <h4 className="text-sm font-semibold">Question {index + 1}</h4>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={`Move question ${index + 1} up`}
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowUp size={14} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={`Move question ${index + 1} down`}
            disabled={index === total - 1}
            onClick={() => onMove(1)}
          >
            <ArrowDown size={14} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-destructive"
            aria-label={`Delete question ${index + 1}`}
            onClick={onRemove}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={`qtext-${question.tempId}`}>Question Text</Label>
          <Textarea
            id={`qtext-${question.tempId}`}
            value={question.question_text}
            placeholder="Enter the question"
            onChange={(e) => patch({ question_text: e.target.value })}
          />
          {errors?.question_text && (
            <p className="text-xs text-destructive">{errors.question_text}</p>
          )}
        </div>

        <QuestionTypeSelector
          id={`qtype-${question.tempId}`}
          value={question.type}
          onChange={handleTypeChange}
        />

        {question.type === "true_false" ? (
          <TrueFalseEditor
            answers={question.answers}
            onSelectCorrect={(id) => toggleCorrect(id, true)}
          />
        ) : question.type === "single_choice" ? (
          <SingleChoiceEditor
            questionId={question.tempId}
            answers={question.answers}
            answerErrors={errors?.byAnswer ?? {}}
            onChangeText={changeText}
            onToggleCorrect={toggleCorrect}
            onAdd={addAnswer}
            onRemove={removeAnswer}
          />
        ) : (
          <MultipleChoiceEditor
            questionId={question.tempId}
            answers={question.answers}
            answerErrors={errors?.byAnswer ?? {}}
            onChangeText={changeText}
            onToggleCorrect={toggleCorrect}
            onAdd={addAnswer}
            onRemove={removeAnswer}
          />
        )}

        {errors?.answers && <p className="text-xs text-destructive">{errors.answers}</p>}
      </CardContent>
    </Card>
  );
};

export default memo(QuestionCard);
