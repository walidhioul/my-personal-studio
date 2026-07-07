import { useQuery } from "@tanstack/react-query";
import { getFeedbacks } from "@/api/feedback";

export function useFeedbacks() {
  return useQuery({
    queryKey: ["feedbacks"],
    queryFn: getFeedbacks,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
