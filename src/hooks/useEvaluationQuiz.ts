import { useQuery } from "@tanstack/react-query";
import { fetchEvaluationQuizzes } from "@/api/quiz";

export function useEvaluationQuizzes() {
  return useQuery({
    queryKey: ["evaluation-quizzes"],
    queryFn: fetchEvaluationQuizzes,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
