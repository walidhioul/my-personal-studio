import { useState } from "react";
import {
  useAdminFeedbacks,
  useApproveFeedback,
  useDeleteFeedback,
} from "@/hooks/useAdminFeedbacks";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteConfirmationDialog from "@/components/admin/evaluation-quiz/DeleteConfirmationDialog";
import { Trash2, Check, Star, Loader2 } from "lucide-react";
import type { AdminFeedback } from "@/api/admin";

const AdminFeedbacks = () => {
  const { data: feedbacks = [], isLoading, isError, error } = useAdminFeedbacks();
  const approveMutation = useApproveFeedback();
  const deleteMutation = useDeleteFeedback();
  const [pendingDelete, setPendingDelete] = useState<AdminFeedback | null>(null);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Feedbacks</h1>
        <p className="text-sm text-muted-foreground">Approve or remove student feedback</p>
      </div>

      {isError ? (
        <div className="border rounded-lg bg-card p-8 text-center text-sm text-destructive">
          {(error as Error)?.message || "Failed to load feedbacks."}
        </div>
      ) : isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No feedback yet.
                  </TableCell>
                </TableRow>
              ) : (
                feedbacks.map((f) => {
                  const approving =
                    approveMutation.isPending && approveMutation.variables === f.id;
                  const deleting =
                    deleteMutation.isPending && deleteMutation.variables === f.id;
                  return (
                    <TableRow key={f.id}>
                      <TableCell>{f.user?.name || `#${f.user_id}`}</TableCell>
                      <TableCell>{f.course?.title || `#${f.course_id}`}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          {f.rating}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{f.comment}</TableCell>
                      <TableCell>
                        <Badge variant={f.is_approved ? "default" : "secondary"}>
                          {f.is_approved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {!f.is_approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label="Approve feedback"
                            disabled={approving}
                            onClick={() => approveMutation.mutate(f.id)}
                          >
                            {approving ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          aria-label="Delete feedback"
                          disabled={deleting}
                          onClick={() => setPendingDelete(f)}
                        >
                          {deleting ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteConfirmationDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete feedback"
        description="Are you sure you want to delete this feedback? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminFeedbacks;
