import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/evaluationQuizzes";
import { toast } from "sonner";

export const evaluationQuizKeys = {
  all: ["admin", "evaluation-quizzes"] as const,
  detail: (id: number) => ["admin", "evaluation-quizzes", id] as const,
};

export function useEvaluationQuizzes() {
  return useQuery({
    queryKey: evaluationQuizKeys.all,
    queryFn: api.listEvaluationQuizzes,
    select: (r) => r.data ?? [],
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEvaluationQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.EvaluationQuizPayload) => api.createEvaluationQuiz(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: evaluationQuizKeys.all });
      toast.success(res?.message || "Evaluation quiz created successfully");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create evaluation quiz"),
  });
}

export function useUpdateEvaluationQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: api.EvaluationQuizPayload }) =>
      api.updateEvaluationQuiz(id, payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: evaluationQuizKeys.all });
      toast.success(res?.message || "Evaluation quiz updated successfully");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update evaluation quiz"),
  });
}

export function useDeleteEvaluationQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteEvaluationQuiz(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: evaluationQuizKeys.all });
      toast.success(res?.message || "Evaluation quiz deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete evaluation quiz"),
  });
}
