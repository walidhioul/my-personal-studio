import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import type { AdminEvaluationQuiz, QuestionType } from "@/api/evaluationQuizzes";
import { QUESTION_TYPE_LABELS } from "./types";

const EvaluationQuizView = ({ quiz }: { quiz: AdminEvaluationQuiz }) => (
  <div className="space-y-6">
    <section className="space-y-2">
      <h3 className="text-lg font-semibold">{quiz.title}</h3>
      <p className="text-sm text-muted-foreground">{quiz.description}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <Badge variant="secondary">{quiz.type}</Badge>
        <Badge variant="outline">Passing score: {quiz.passing_score}</Badge>
        <Badge variant="outline">{quiz.questions?.length ?? 0} questions</Badge>
      </div>
    </section>

    <div className="space-y-4">
      {[...(quiz.questions ?? [])]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((q, i) => (
          <Card key={q.id ?? i} className="bg-muted/30">
            <CardHeader className="py-3 space-y-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">
                  {i + 1}. {q.question_text}
                </p>
                <Badge variant="outline" className="shrink-0">
                  {QUESTION_TYPE_LABELS[q.type as QuestionType] ?? q.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {[...(q.answers ?? [])]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((a, ai) => (
                  <div
                    key={a.id ?? ai}
                    className={`flex items-center gap-2 text-sm rounded-md px-2 py-1.5 ${
                      a.is_correct ? "bg-primary/10 text-foreground font-medium" : ""
                    }`}
                  >
                    {a.is_correct ? (
                      <CheckCircle2 size={16} className="text-primary shrink-0" />
                    ) : (
                      <Circle size={16} className="text-muted-foreground shrink-0" />
                    )}
                    <span>{a.answer_text}</span>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
    </div>
  </div>
);

export default EvaluationQuizView;
