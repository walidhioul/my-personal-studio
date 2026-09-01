import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { courseLearningApi } from "@/api/courseLearning";

/* -------------------------------------------------------------------------- */
/* Query keys                                                                 */
/* -------------------------------------------------------------------------- */

export const courseLearningKeys = {
  all: ["course-learning"] as const,

  course: (courseId: number) =>
    [...courseLearningKeys.all, courseId] as const,
};

/* -------------------------------------------------------------------------- */
/* Get course learning content                                                */
/* -------------------------------------------------------------------------- */

export const useCourseLearning = (
  courseId: number | undefined
) => {
  return useQuery({
    queryKey: courseId
      ? courseLearningKeys.course(courseId)
      : ["course-learning", "disabled"],

    queryFn: () => {
      if (!courseId) {
        throw new Error(
          "Course ID is required."
        );
      }

      return courseLearningApi.getCourseLearning(
        courseId
      );
    },

    enabled: Boolean(courseId),

    staleTime: 5 * 60 * 1000,
  });
};

/* -------------------------------------------------------------------------- */
/* Access resource                                                            */
/* -------------------------------------------------------------------------- */

export const useAccessCourseResource = () => {
  return useMutation({
    mutationFn: ({
      courseId,
      resourceId,
    }: {
      courseId: number;
      resourceId: number;
    }) =>
      courseLearningApi.accessResource(
        courseId,
        resourceId
      ),
  });
};