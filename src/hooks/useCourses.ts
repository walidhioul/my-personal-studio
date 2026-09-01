import { useQuery } from "@tanstack/react-query";
import { getCourses, getCourseById } from "@/api/courses";

export const courseKeys = {
  all: ["courses"] as const,
  detail: (id: string) => ["courses", id] as const,
};

export function useCourses() {
  return useQuery({
    queryKey: courseKeys.all,
    queryFn: getCourses,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => getCourseById(id),
    select: (res) => res.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
