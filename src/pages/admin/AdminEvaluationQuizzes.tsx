import { lazy, Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import {
  useCreateEvaluationQuiz,
  useUpdateEvaluationQuiz,
} from "@/hooks/useAdminEvaluationQuizzes";
import type { EvaluationQuizPayload } from "@/api/evaluationQuizzes";

const EvaluationQuizForm = lazy(
  () => import("@/components/admin/evaluation-quiz/EvaluationQuizForm")
);

const AdminEvaluationQuizzes = () => {
  const createMutation = useCreateEvaluationQuiz();
  const updateMutation = useUpdateEvaluationQuiz();

  const [formOpen, setFormOpen] = useState(false);

  const openCreate = () => {
    setFormOpen(true);
  };

  const handleSubmit = (payload: EvaluationQuizPayload) => {
    createMutation.mutate(payload, { onSuccess: () => setFormOpen(false) });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Evaluation Quizzes</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage evaluation quizzes, questions and answers
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Evaluation Quiz
        </Button>
      </div>

      {/* Create */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Evaluation Quiz</DialogTitle>
            <DialogDescription>
              Fill in the general information and build the questions.
            </DialogDescription>
          </DialogHeader>
          {formOpen && (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <EvaluationQuizForm
                submitting={createMutation.isPending || updateMutation.isPending}
                submitLabel="Create Quiz"
                onCancel={() => setFormOpen(false)}
                onSubmit={handleSubmit}
              />
            </Suspense>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEvaluationQuizzes;
