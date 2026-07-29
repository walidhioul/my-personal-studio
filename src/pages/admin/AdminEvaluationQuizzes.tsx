import { lazy, Suspense, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search } from "lucide-react";
import EvaluationQuizTable from "@/components/admin/evaluation-quiz/EvaluationQuizTable";
import DeleteConfirmationDialog from "@/components/admin/evaluation-quiz/DeleteConfirmationDialog";
import { toDraft } from "@/components/admin/evaluation-quiz/quizUtils";
import type { DraftQuiz } from "@/components/admin/evaluation-quiz/types";
import {
  useCreateEvaluationQuiz,
  useDeleteEvaluationQuiz,
  useEvaluationQuizzes,
  useUpdateEvaluationQuiz,
} from "@/hooks/useAdminEvaluationQuizzes";
import type { AdminEvaluationQuiz, EvaluationQuizPayload } from "@/api/evaluationQuizzes";

const EvaluationQuizForm = lazy(
  () => import("@/components/admin/evaluation-quiz/EvaluationQuizForm")
);
const EvaluationQuizView = lazy(
  () => import("@/components/admin/evaluation-quiz/EvaluationQuizView")
);

const PAGE_SIZE = 10;

const AdminEvaluationQuizzes = () => {
  const { data: quizzes = [], isLoading, isError, error } = useEvaluationQuizzes();
  const createMutation = useCreateEvaluationQuiz();
  const updateMutation = useUpdateEvaluationQuiz();
  const deleteMutation = useDeleteEvaluationQuiz();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEvaluationQuiz | null>(null);
  const [viewing, setViewing] = useState<AdminEvaluationQuiz | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminEvaluationQuiz | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return quizzes;
    return quizzes.filter(
      (q) =>
        q.title?.toLowerCase().includes(term) || q.description?.toLowerCase().includes(term)
    );
  }, [quizzes, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const initialValue: DraftQuiz | undefined = useMemo(
    () => (editing ? toDraft(editing) : undefined),
    [editing]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (quiz: AdminEvaluationQuiz) => {
    setEditing(quiz);
    setFormOpen(true);
  };

  const handleSubmit = (payload: EvaluationQuizPayload) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
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

      <div className="relative mb-4 max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          className="pl-9"
          placeholder="Search quizzes..."
          aria-label="Search evaluation quizzes"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isError ? (
        <div className="border rounded-lg bg-card p-8 text-center text-sm text-destructive">
          {(error as Error)?.message || "Failed to load evaluation quizzes."}
        </div>
      ) : (
        <EvaluationQuizTable
          quizzes={paginated}
          isLoading={isLoading}
          onView={setViewing}
          onEdit={openEdit}
          onDelete={setPendingDelete}
        />
      )}

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={i + 1 === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Create / Edit */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Evaluation Quiz" : "Add Evaluation Quiz"}
            </DialogTitle>
            <DialogDescription>
              Fill in the general information and build the questions.
            </DialogDescription>
          </DialogHeader>
          {formOpen && (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <EvaluationQuizForm
                initialValue={initialValue}
                submitting={createMutation.isPending || updateMutation.isPending}
                submitLabel={editing ? "Update Quiz" : "Create Quiz"}
                onCancel={() => setFormOpen(false)}
                onSubmit={handleSubmit}
              />
            </Suspense>
          )}
        </DialogContent>
      </Dialog>

      {/* View */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evaluation Quiz Details</DialogTitle>
            <DialogDescription>Read-only view of this quiz.</DialogDescription>
          </DialogHeader>
          {viewing && (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <EvaluationQuizView quiz={viewing} />
            </Suspense>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete evaluation quiz"
        description="Are you sure you want to delete this evaluation quiz?"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminEvaluationQuizzes;
