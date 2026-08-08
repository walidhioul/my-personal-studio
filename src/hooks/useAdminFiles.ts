import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as files from "@/api/adminFiles";

export const adminFileKeys = {
  byCourse: (courseId: number) => ["admin", "files", courseId] as const,
};

const unwrapList = (res: unknown): files.AdminFile[] => {
  const data = (res as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as files.AdminFile[];
  const nested = (data as { files?: files.AdminFile[] })?.files;
  return Array.isArray(nested) ? nested : [];
};

export const unwrapFile = (res: unknown): files.AdminFile | null => {
  const data = (res as { data?: unknown })?.data ?? res;
  const nested = (data as { file?: files.AdminFile })?.file;
  return (nested ?? (data as files.AdminFile)) || null;
};

export function useCourseFiles(courseId: number | null) {
  return useQuery({
    queryKey: adminFileKeys.byCourse(courseId ?? 0),
    queryFn: () => files.listCourseFiles(courseId as number),
    enabled: !!courseId,
    select: unwrapList,
    staleTime: 60 * 1000,
  });
}

export function useCreateCourseFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: number;
      data: files.CreateFilePayload;
    }) => files.createCourseFile(courseId, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: adminFileKeys.byCourse(vars.courseId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create PDF record"),
  });
}

export function useUpdateCourseFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      fileId,
      data,
    }: {
      courseId: number;
      fileId: number;
      data: files.UpdateFilePayload;
    }) => files.updateCourseFile(courseId, fileId, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: adminFileKeys.byCourse(vars.courseId) });
      toast.success("PDF details updated");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update PDF"),
  });
}
