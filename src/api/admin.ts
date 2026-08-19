import { apiClient } from "./client";
import { ApiResponse } from "@/types/course";
import { User } from "@/types/auth";

// ---------- USERS ----------
export const listUsers = () => apiClient.get<ApiResponse<User[]>>("/admin/users?per_page=1000");
export const getUser = (id: number) => apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
export const createUser = (data: Partial<User> & { password: string }) =>
  apiClient.post<ApiResponse<User>>("/admin/users", data);
export const updateUser = (id: number, data: Partial<User>) =>
  apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data);
export const deleteUser = (id: number) => apiClient.delete<ApiResponse<null>>(`/admin/users/${id}`);
export const toggleUserActive = (id: number) =>
  apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/toggle-active`);
export const changeUserRole = (id: number, role: string) =>
  apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role });

// ---------- COURSES ----------
export interface AdminCourse {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  level: string; // A1 | A2 | B1 | B2 | C1 | C2
  price: number;
  thumbnail?: string | null;
  picture?: string | null;
}

export interface CourseFormPayload {
  title: string;
  slug: string;
  description: string;
  level: string;
  price: number;
  thumbnail?: File | null; // required on create, optional on update
}

const buildCourseFormData = (data: CourseFormPayload, method?: "PUT") => {
  const fd = new FormData();
  fd.append("title", data.title);
  fd.append("slug", data.slug);
  fd.append("description", data.description);
  fd.append("level", data.level);
  fd.append("price", String(data.price));
  if (data.thumbnail) fd.append("thumbnail", data.thumbnail);
  if (method) fd.append("_method", method); // Laravel multipart PUT workaround
  return fd;
};

export const listAdminCourses = () => apiClient.get<ApiResponse<AdminCourse[]>>("/admin/courses?per_page=1000");

export const createCourse = (data: CourseFormPayload) =>
  apiClient.post<ApiResponse<AdminCourse>>("/admin/courses", buildCourseFormData(data));

export const updateCourse = (id: number, data: CourseFormPayload) =>
  apiClient.post<ApiResponse<AdminCourse>>(`/admin/courses/${id}`, buildCourseFormData(data, "PUT"));


export const deleteCourse = (id: number) =>
  apiClient.delete<ApiResponse<null>>(`/admin/courses/${id}`);

// ---------- LESSONS / VIDEOS ----------
export interface AdminLesson {
  id: number;
  course_id: number;
  title: string;
  video_url?: string | null;
  duration?: string;
  order?: number;
}
export const listLessons = (courseId: number) =>
  apiClient.get<ApiResponse<AdminLesson[]>>(`/admin/courses/${courseId}/lessons`);
export const createLesson = (courseId: number, data: Partial<AdminLesson>) =>
  apiClient.post<ApiResponse<AdminLesson>>(`/admin/courses/${courseId}/lessons`, data);
export const updateLesson = (id: number, data: Partial<AdminLesson>) =>
  apiClient.put<ApiResponse<AdminLesson>>(`/admin/lessons/${id}`, data);
export const deleteLesson = (id: number) =>
  apiClient.delete<ApiResponse<null>>(`/admin/lessons/${id}`);

// ---------- RESOURCES ----------
export interface AdminResource {
  id: number;
  lesson_id?: number;
  course_id?: number;
  title: string;
  url: string;
  type?: string;
}
export const listResources = (courseId: number) =>
  apiClient.get<ApiResponse<AdminResource[]>>(`/admin/courses/${courseId}/resources?per_page=1000`);
export const createResource = (courseId: number, data: Partial<AdminResource>) =>
  apiClient.post<ApiResponse<AdminResource>>(`/admin/courses/${courseId}/resources`, data);
export const updateResource = (id: number, data: Partial<AdminResource>) =>
  apiClient.put<ApiResponse<AdminResource>>(`/admin/resources/${id}`, data);
export const deleteResource = (id: number) =>
  apiClient.delete<ApiResponse<null>>(`/admin/resources/${id}`);

// ---------- QUIZZES ----------
export interface AdminQuiz {
  id: number;
  course_id: number;
  title: string;
  description?: string;
}
export const listQuizzes = (courseId: number) =>
  apiClient.get<ApiResponse<AdminQuiz[]>>(`/admin/courses/${courseId}/quizzes`);
export const createQuiz = (courseId: number, data: Partial<AdminQuiz>) =>
  apiClient.post<ApiResponse<AdminQuiz>>(`/admin/courses/${courseId}/quizzes`, data);
export const updateQuiz = (id: number, data: Partial<AdminQuiz>) =>
  apiClient.put<ApiResponse<AdminQuiz>>(`/admin/quizzes/${id}`, data);
export const deleteQuiz = (id: number) =>
  apiClient.delete<ApiResponse<null>>(`/admin/quizzes/${id}`);

// ---------- QUIZ QUESTIONS (Evaluation questions) ----------
export interface AdminQuestion {
  id: number;
  quiz_id: number;
  question: string;
  options: string[];
  correct_answer: string;
}
export const listQuestions = (quizId: number) =>
  apiClient.get<ApiResponse<AdminQuestion[]>>(`/admin/quizzes/${quizId}/questions`);
export const createQuestion = (quizId: number, data: Partial<AdminQuestion>) =>
  apiClient.post<ApiResponse<AdminQuestion>>(`/admin/quizzes/${quizId}/questions`, data);
export const updateQuestion = (id: number, data: Partial<AdminQuestion>) =>
  apiClient.put<ApiResponse<AdminQuestion>>(`/admin/questions/${id}`, data);
export const deleteQuestion = (id: number) =>
  apiClient.delete<ApiResponse<null>>(`/admin/questions/${id}`);

// ---------- ENROLLMENTS ----------
export interface AdminEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  payment_status?: string;
  created_at?: string;
  user?: { id: number; name: string; email: string };
  course?: { id: number; title: string };
}

export interface CreateEnrollmentPayload {
  user_id: number;
  course_id: number;
  payment_status: "pending" | "completed" | "failed";
}
export const createEnrollment = (data: CreateEnrollmentPayload) =>
  apiClient.post<ApiResponse<AdminEnrollment>>("/admin/enrollments", data);


export const listEnrollments = () =>
  apiClient.get<ApiResponse<AdminEnrollment[]>>("/admin/enrollments?per_page=1000");
export const listEnrollmentsByCourse = (courseId: number) =>
  apiClient.get<ApiResponse<AdminEnrollment[]>>(`/admin/courses/${courseId}/enrollments?per_page=1000`);
export const deleteEnrollment = (id: number) =>
  apiClient.delete<ApiResponse<null>>(`/admin/enrollments/${id}`);

// ---------- FEEDBACKS ----------
export interface AdminFeedback {
  id: number;
  user_id: number;
  course_id: number;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  user?: { id: number; name: string };
  course?: { id: number; title: string };
}
export const listAdminFeedbacks = () =>
  apiClient.get<ApiResponse<AdminFeedback[]>>("/admin/feedback?per_page=1000");
export const approveFeedback = (id: number) =>
  apiClient.patch<ApiResponse<AdminFeedback>>(`/admin/feedback/${id}/approve`);
export const deleteFeedback = (id: number) =>
  apiClient.delete<ApiResponse<null>>(`/admin/feedback/${id}`);

// ---------- DASHBOARD (overview) ----------
export interface AdminDashboardData {
  [key: string]: unknown;
}
export const getAdminDashboard = () =>
  apiClient.get<ApiResponse<AdminDashboardData>>("/admin/dashboard");

// ---------- VIDEOS ----------
// ---------- VIDEOS ----------

export interface AdminVideo {
  id: number;
  course_id: number;
  title: string;
  description?: string | null;
  order?: number | null;
  is_free_preview?: boolean;
  status?: string | null;
  bunny_video_id?: string | null;
  course?: {
    id: number;
    title: string;
  } | null;
}

export interface CreateVideoPayload {
  title: string;
  description?: string;
  order: number;
  is_free_preview: boolean;
}

export interface UpdateVideoPayload {
  title: string;
  description?: string;
  order: number;
  is_free_preview: boolean;
}

export interface ReorderVideoItem {
  id: number;
  order: number;
}


// GET ALL VIDEOS
export const listAllVideos = () =>
  apiClient.get<ApiResponse<AdminVideo[]>>(
    "/admin/videos/pending-uploads?per_page=1000"
  );


// GET VIDEOS BY COURSE
export const listCourseVideos = (courseId: number) =>
  apiClient.get<ApiResponse<AdminVideo[]>>(
    `/admin/courses/${courseId}/videos`
  );


// GET ONE VIDEO
export const getAdminVideo = (
  courseId: number,
  videoId: number
) =>
  apiClient.get<ApiResponse<AdminVideo>>(
    `/admin/courses/${courseId}/videos/${videoId}`
  );


// CREATE VIDEO
export const createVideo = (
  courseId: number,
  data: CreateVideoPayload
) =>
  apiClient.post<ApiResponse<AdminVideo>>(
    `/admin/courses/${courseId}/videos`,
    data
  );


// UPDATE VIDEO
export const updateVideo = (
  courseId: number,
  videoId: number,
  data: UpdateVideoPayload
) =>
  apiClient.put<ApiResponse<AdminVideo>>(
    `/admin/courses/${courseId}/videos/${videoId}`,
    data
  );


// DELETE VIDEO
export const deleteVideo = (
  courseId: number,
  videoId: number
) =>
  apiClient.delete<ApiResponse<null>>(
    `/admin/courses/${courseId}/videos/${videoId}`
  );


// REORDER VIDEOS
export const reorderVideos = (
  courseId: number,
  items: ReorderVideoItem[]
) =>
  apiClient.patch<ApiResponse<null>>(
    `/admin/courses/${courseId}/videos/reorder`,
    { items }
  );


// BUNNY UPLOAD CREDENTIALS

export interface VideoUploadCredentials {
  endpoint: string;
  headers: Record<string, string>;
}

export const getVideoUploadCredentials = (
  courseId: number,
  videoId: number
) =>
  apiClient.get<
    VideoUploadCredentials |
    ApiResponse<VideoUploadCredentials>
  >(
    `/admin/courses/${courseId}/videos/${videoId}/upload-credentials`
  );


// VIDEO STATUS

export type VideoStatus =
  | "pending_upload"
  | "processing"
  | "ready"
  | "failed";