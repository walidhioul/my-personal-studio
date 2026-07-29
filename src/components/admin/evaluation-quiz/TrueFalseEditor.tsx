import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { DraftAnswer } from "./types";

interface Props {
  answers: DraftAnswer[];
  onSelectCorrect: (answerId: string) => void;
}

/** True/False answers are fixed — the admin only picks the correct one. */
const TrueFalseEditor = ({ answers, onSelectCorrect }: Props) => {
  const correctId = answers.find((a) => a.is_correct)?.tempId ?? "";
  return (
    <div className="space-y-2">
      <Label>Correct Answer</Label>
      <RadioGroup value={correctId} onValueChange={onSelectCorrect} className="flex gap-6">
        {answers.map((a) => (
          <div key={a.tempId} className="flex items-center gap-2">
            <RadioGroupItem value={a.tempId} id={`tf-${a.tempId}`} />
            <Label htmlFor={`tf-${a.tempId}`} className="font-normal cursor-pointer">
              {a.answer_text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default TrueFalseEditor;
