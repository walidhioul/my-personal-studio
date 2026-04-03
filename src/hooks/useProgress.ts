import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProgress } from "@/api/dashboard";

export function useProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
}
