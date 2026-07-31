import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as admin from "@/api/admin";
import { toast } from "sonner";

export const adminFeedbackKeys = {
  all: ["admin", "feedbacks"] as const,
};

export function useAdminFeedbacks() {
  return useQuery({
    queryKey: adminFeedbackKeys.all,
    queryFn: admin.listAdminFeedbacks,
    select: (r) => r.data ?? [],
    staleTime: 2 * 60 * 1000,
  });
}

export function useApproveFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => admin.approveFeedback(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: adminFeedbackKeys.all });
      const previous = qc.getQueryData(adminFeedbackKeys.all);
      qc.setQueryData(
        adminFeedbackKeys.all,
        (old: { data?: admin.AdminFeedback[] } | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((f) => (f.id === id ? { ...f, is_approved: true } : f)),
          };
        },
      );
      return { previous };
    },
    onError: (e: Error, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(adminFeedbackKeys.all, ctx.previous);
      toast.error(e.message || "Failed to approve feedback");
    },
    onSuccess: (res) => toast.success(res?.message || "Feedback approved"),
    onSettled: () => qc.invalidateQueries({ queryKey: adminFeedbackKeys.all }),
  });
}

export function useDeleteFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => admin.deleteFeedback(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: adminFeedbackKeys.all });
      toast.success(res?.message || "Feedback deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete feedback"),
  });
}
