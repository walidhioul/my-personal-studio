import { apiClient } from "@/api/client";
import type {
  CourseLearningResponse,
  ResourceAccessResponse,
  VideoCompletionResponse,
} from "@/types/courseLearning";

export const courseLearningApi = {
  /**
   * Get the learning content of a course.
   *
   * Backend decides what the user can see:
   *
   * - Not enrolled:
   *   only free preview videos
   *   resources = []
   *
   * - Enrolled:
   *   all videos
   *   all resources
   */
  getCourseLearning: async (
    courseId: number
  ): Promise<CourseLearningResponse> => {
    return apiClient.get<CourseLearningResponse>(
      `/courses/${courseId}/learn`
    );
  },

  /**
   * Get an authorized download URL for a resource.
   */
  accessResource: async (
    courseId: number,
    resourceId: number
  ): Promise<ResourceAccessResponse> => {
    return apiClient.get<ResourceAccessResponse>(
      `/courses/${courseId}/resources/${resourceId}/access`
    );
  },

  /**
   * Mark a video as completed (called once the learner
   * has watched at least 80% of it).
   */
  completeVideo: async (
    courseId: number,
    videoId: number
  ): Promise<VideoCompletionResponse> => {
    return apiClient.post<VideoCompletionResponse>(
      `/courses/${courseId}/videos/${videoId}/complete`
    );
  },
};
