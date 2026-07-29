import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { QuestionType } from "@/api/evaluationQuizzes";
import { QUESTION_TYPE_LABELS } from "./types";

interface Props {
  id: string;
  value: QuestionType;
  onChange: (value: QuestionType) => void;
}

const QuestionTypeSelector = ({ id, value, onChange }: Props) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>Question Type</Label>
    <Select value={value} onValueChange={(v) => onChange(v as QuestionType)}>
      <SelectTrigger id={id} aria-label="Question type">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
          <SelectItem key={t} value={t}>
            {QUESTION_TYPE_LABELS[t]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default QuestionTypeSelector;
