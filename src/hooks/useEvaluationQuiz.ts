import { useQuery } from "@tanstack/react-query";
import { getEvaluationQuizzes } from "@/api/quiz";

export function useEvaluationQuizzes() {
  return useQuery({
    queryKey: ["evaluation-quizzes"],
    queryFn: getEvaluationQuizzes,
    select: (res) => res.data,
    staleTime: 1000 * 60 * 30,
  });
}

