import { useQuery } from "@tanstack/react-query";
import { getCourses, getCourseById } from "@/api/courses";

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}
