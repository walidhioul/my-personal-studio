import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as admin from "@/api/admin";

import { toast } from "sonner";


export const adminVideoKeys = {
  all: ["admin", "videos"] as const,

  byCourse: (courseId: number) =>
    ["admin", "videos", courseId] as const,

  detail: (
    courseId: number,
    videoId: number
  ) =>
    [
      "admin",
      "videos",
      courseId,
      videoId,
    ] as const,
};


/* =========================================================
   LIST VIDEOS
========================================================= */

export function useAdminVideos(
  courseId: number | "all"
) {
  return useQuery({
    queryKey:
      courseId === "all"
        ? adminVideoKeys.all
        : adminVideoKeys.byCourse(courseId),

    queryFn: () =>
      courseId === "all"
        ? admin.listAllVideos()
        : admin.listCourseVideos(courseId),

    select: (r) =>
      r.data ?? [],

    staleTime:
      2 * 60 * 1000,
  });
}


/* =========================================================
   COURSES
========================================================= */

export function useAdminCoursesList() {
  return useQuery({
    queryKey: [
      "admin",
      "courses",
    ],

    queryFn:
      admin.listAdminCourses,

    select: (r) =>
      r.data ?? [],

    staleTime:
      5 * 60 * 1000,
  });
}


/* =========================================================
   CREATE VIDEO
========================================================= */

export function useCreateVideo() {
  const qc =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: number;
      data: admin.CreateVideoPayload;
    }) =>
      admin.createVideo(
        courseId,
        data
      ),

    onSuccess: (
      res,
      variables
    ) => {

      // Refresh all video queries
      qc.invalidateQueries({
        queryKey:
          adminVideoKeys.all,
      });

      qc.invalidateQueries({
        queryKey: [
          "admin",
          "videos",
        ],
      });

      // Also refresh the specific course
      qc.invalidateQueries({
        queryKey:
          adminVideoKeys.byCourse(
            variables.courseId
          ),
      });

      toast.success(
        res?.message ||
          "Video created — pending upload"
      );
    },

    onError: (e: Error) => {
      toast.error(
        e.message ||
          "Failed to create video"
      );
    },
  });
}


/* =========================================================
   UPDATE VIDEO
========================================================= */

export function useUpdateVideo() {
  const qc =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      videoId,
      data,
    }: {
      courseId: number;
      videoId: number;
      data: admin.UpdateVideoPayload;
    }) =>
      admin.updateVideo(
        courseId,
        videoId,
        data
      ),

    onSuccess: (
      res,
      variables
    ) => {

      qc.invalidateQueries({
        queryKey:
          adminVideoKeys.all,
      });

      qc.invalidateQueries({
        queryKey:
          adminVideoKeys.byCourse(
            variables.courseId
          ),
      });

      qc.invalidateQueries({
        queryKey:
          adminVideoKeys.detail(
            variables.courseId,
            variables.videoId
          ),
      });

      toast.success(
        res?.message ||
          "Video updated successfully"
      );
    },

    onError: (e: Error) => {
      toast.error(
        e.message ||
          "Failed to update video"
      );
    },
  });
}


/* =========================================================
   DELETE VIDEO
========================================================= */

export function useDeleteVideo() {
  const qc =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      videoId,
    }: {
      courseId: number;
      videoId: number;
    }) =>
      admin.deleteVideo(
        courseId,
        videoId
      ),

    onSuccess: (
      res,
      variables
    ) => {

      qc.invalidateQueries({
        queryKey:
          adminVideoKeys.all,
      });

      qc.invalidateQueries({
        queryKey:
          adminVideoKeys.byCourse(
            variables.courseId
          ),
      });

      qc.removeQueries({
        queryKey:
          adminVideoKeys.detail(
            variables.courseId,
            variables.videoId
          ),
      });

      toast.success(
        res?.message ||
          "Video deleted successfully"
      );
    },

    onError: (e: Error) => {
      toast.error(
        e.message ||
          "Failed to delete video"
      );
    },
  });
}


/* =========================================================
   REORDER VIDEOS
========================================================= */

export function useReorderVideos() {
  const qc =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      items,
    }: {
      courseId: number;
      items: admin.ReorderVideoItem[];
    }) =>
      admin.reorderVideos(
        courseId,
        items
      ),

    onSuccess: (
      res,
      variables
    ) => {

      qc.invalidateQueries({
        queryKey:
          adminVideoKeys.all,
      });

      qc.invalidateQueries({
        queryKey:
          adminVideoKeys.byCourse(
            variables.courseId
          ),
      });

      toast.success(
        res?.message ||
          "Videos reordered successfully"
      );
    },

    onError: (e: Error) => {
      toast.error(
        e.message ||
          "Failed to reorder videos"
      );
    },
  });
}