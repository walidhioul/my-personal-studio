import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X } from "lucide-react";
import type { DraftAnswer } from "./types";

export interface AnswerListProps {
  questionId: string;
  answers: DraftAnswer[];
  mode: "single" | "multiple";
  answerErrors: Record<string, string>;
  onChangeText: (answerId: string, text: string) => void;
  onToggleCorrect: (answerId: string, checked: boolean) => void;
  onAdd: () => void;
  onRemove: (answerId: string) => void;
}

/** Answer editor for single & multiple choice questions. */
const AnswerList = ({
  questionId,
  answers,
  mode,
  answerErrors,
  onChangeText,
  onToggleCorrect,
  onAdd,
  onRemove,
}: AnswerListProps) => {
  const correctId = answers.find((a) => a.is_correct)?.tempId ?? "";

  const rows = answers.map((a, i) => (
    <div key={a.tempId} className="space-y-1">
      <div className="flex items-center gap-2">
        {mode === "single" ? (
          <RadioGroupItem
            value={a.tempId}
            id={`correct-${a.tempId}`}
            aria-label={`Mark answer ${i + 1} as correct`}
          />
        ) : (
          <Checkbox
            id={`correct-${a.tempId}`}
            checked={a.is_correct}
            onCheckedChange={(c) => onToggleCorrect(a.tempId, !!c)}
            aria-label={`Mark answer ${i + 1} as correct`}
          />
        )}
        <Input
          value={a.answer_text}
          placeholder={`Answer ${i + 1}`}
          aria-label={`Answer ${i + 1} text`}
          onChange={(e) => onChangeText(a.tempId, e.target.value)}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`Remove answer ${i + 1}`}
          disabled={answers.length <= 2}
          onClick={() => onRemove(a.tempId)}
        >
          <X size={14} />
        </Button>
      </div>
      {answerErrors[a.tempId] && (
        <p className="text-xs text-destructive ml-6">{answerErrors[a.tempId]}</p>
      )}
    </div>
  ));

  return (
    <div className="space-y-2">
      <Label>Answers</Label>
      {mode === "single" ? (
        <RadioGroup
          value={correctId}
          onValueChange={(v) => onToggleCorrect(v, true)}
          className="space-y-2"
          aria-label={`Correct answer for question ${questionId}`}
        >
          {rows}
        </RadioGroup>
      ) : (
        <div className="space-y-2">{rows}</div>
      )}
      <Button type="button" size="sm" variant="outline" onClick={onAdd}>
        <Plus size={14} /> Add Answer
      </Button>
    </div>
  );
};

export default memo(AnswerList);
