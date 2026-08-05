import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as admin from "@/api/admin";
import { toast } from "sonner";

export const adminVideoKeys = {
  all: ["admin", "videos"] as const,
  byCourse: (courseId: number) => ["admin", "videos", courseId] as const,
};

/** Pass a courseId to scope the list to a single course, or "all" for every video. */
export function useAdminVideos(courseId: number | "all") {
  return useQuery({
    queryKey: courseId === "all" ? adminVideoKeys.all : adminVideoKeys.byCourse(courseId),
    queryFn: () =>
      courseId === "all" ? admin.listAllVideos() : admin.listCourseVideos(courseId),
    select: (r) => r.data ?? [],
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminCoursesList() {
  return useQuery({
    queryKey: ["admin", "courses"],
    queryFn: admin.listAdminCourses,
    select: (r) => r.data ?? [],
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: number;
      data: admin.CreateVideoPayload;
    }) => admin.createVideo(courseId, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: adminVideoKeys.all });
      toast.success(res?.message || "Video created — pending upload");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create video"),
  });
}
