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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  useEvaluationQuizzes,
  useCreateEvaluationQuiz,
  useUpdateEvaluationQuiz,
  useDeleteEvaluationQuiz,
} from "@/hooks/useAdminEvaluationQuizzes";
import type {
  EvaluationQuizPayload,
  AdminEvaluationQuiz,
} from "@/api/evaluationQuizzes";

const EvaluationQuizForm = lazy(
  () => import("@/components/admin/evaluation-quiz/EvaluationQuizForm")
);

const AdminEvaluationQuizzes = () => {
  const { data: quizzes = [], isLoading } = useEvaluationQuizzes();
  const createMutation = useCreateEvaluationQuiz();
  const updateMutation = useUpdateEvaluationQuiz();
  const deleteMutation = useDeleteEvaluationQuiz();

  const [formOpen, setFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<AdminEvaluationQuiz | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState<AdminEvaluationQuiz | null>(null);

  const openCreate = () => {
    setEditingQuiz(null);
    setFormOpen(true);
  };

  const openEdit = (quiz: AdminEvaluationQuiz) => {
    setEditingQuiz(quiz);
    setFormOpen(true);
  };

  const handleSubmit = (payload: EvaluationQuizPayload) => {
    if (editingQuiz) {
      updateMutation.mutate(
        { id: editingQuiz.id, payload },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditingQuiz(null);
          },
        }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  };

  const confirmDelete = () => {
    if (!deletingQuiz) return;
    deleteMutation.mutate(deletingQuiz.id, { onSuccess: () => setDeletingQuiz(null) });
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

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Passing score</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell>{quiz.type}</TableCell>
                <TableCell>{quiz.passing_score}</TableCell>
                <TableCell>{quiz.questions.length}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => openEdit(quiz)}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setDeletingQuiz(quiz)}>
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingQuiz(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? "Edit Evaluation Quiz" : "Add Evaluation Quiz"}</DialogTitle>
            <DialogDescription>
              Fill in the general information and build the questions.
            </DialogDescription>
          </DialogHeader>
          {formOpen && (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <EvaluationQuizForm
                initialValues={editingQuiz ?? undefined}
                submitting={createMutation.isPending || updateMutation.isPending}
                submitLabel={editingQuiz ? "Save Changes" : "Create Quiz"}
                onCancel={() => {
                  setFormOpen(false);
                  setEditingQuiz(null);
                }}
                onSubmit={handleSubmit}
              />
            </Suspense>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingQuiz} onOpenChange={(open) => !open && setDeletingQuiz(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingQuiz?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the quiz and all its questions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEvaluationQuizzes;