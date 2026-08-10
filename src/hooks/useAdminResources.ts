import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as resources from "@/api/adminResources";

export const adminResourceKeys = {
  byCourse: (courseId: number) => ["admin", "resources", courseId] as const,
};

const unwrapList = (res: unknown): resources.AdminResource[] => {
  const data = (res as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as resources.AdminResource[];
  const nested = (data as { resources?: resources.AdminResource[] })?.resources;
  return Array.isArray(nested) ? nested : [];
};

export const unwrapResource = (res: unknown): resources.AdminResource | null => {
  const data = (res as { data?: unknown })?.data ?? res;
  const nested = (data as { resource?: resources.AdminResource })?.resource;
  return (nested ?? (data as resources.AdminResource)) || null;
};

export function useCourseResources(courseId: number | null) {
  return useQuery({
    queryKey: adminResourceKeys.byCourse(courseId ?? 0),
    queryFn: () => resources.listCourseResources(courseId as number),
    enabled: !!courseId,
    select: unwrapList,
    staleTime: 60 * 1000,
  });
}

export function useCreateCourseResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: number;
      data: resources.CreateResourcePayload;
    }) => resources.createCourseResource(courseId, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: adminResourceKeys.byCourse(vars.courseId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create resource"),
  });
}

export function useUpdateCourseResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      resourceId,
      data,
    }: {
      courseId: number;
      resourceId: number;
      data: resources.UpdateResourcePayload;
    }) => resources.updateCourseResource(courseId, resourceId, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: adminResourceKeys.byCourse(vars.courseId) });
      toast.success("Resource updated");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update resource"),
  });
}

export function useDeleteCourseResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      resourceId,
    }: {
      courseId: number;
      resourceId: number;
    }) => resources.deleteCourseResource(courseId, resourceId),
    onSuccess: (_res, vars) => {
      // Remove from the cached list immediately — no full page refresh.
      qc.setQueryData(adminResourceKeys.byCourse(vars.courseId), (prev: unknown) => {
        const data = (prev as { data?: unknown })?.data;
        if (Array.isArray(data)) {
          return {
            ...(prev as object),
            data: (data as resources.AdminResource[]).filter(
              (r) => r.id !== vars.resourceId
            ),
          };
        }
        const nested = (data as { resources?: resources.AdminResource[] })?.resources;
        if (Array.isArray(nested)) {
          return {
            ...(prev as object),
            data: {
              ...(data as object),
              resources: nested.filter((r) => r.id !== vars.resourceId),
            },
          };
        }
        return prev;
      });
      qc.invalidateQueries({ queryKey: adminResourceKeys.byCourse(vars.courseId) });
      toast.success("Resource deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete resource"),
  });
}
