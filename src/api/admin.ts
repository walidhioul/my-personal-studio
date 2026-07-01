import { apiClient } from "./client";
import { ApiResponse } from "@/types/course";
import { User } from "@/types/auth";

// ---------- USERS ----------
export const listUsers = () => apiClient.get<ApiResponse<User[]>>("/admin/users");
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
  level: string;
  price: number;
  thumbnail?: string | null;
  picture?: string | null;
}
export const listAdminCourses = () => apiClient.get<ApiResponse<AdminCourse[]>>("/admin/courses");
export const createCourse = (data: Partial<AdminCourse>) =>
  apiClient.post<ApiResponse<AdminCourse>>("/admin/courses", data);
export const updateCourse = (id: number, data: Partial<AdminCourse>) =>
  apiClient.put<ApiResponse<AdminCourse>>(`/admin/courses/${id}`, data);
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
  apiClient.get<ApiResponse<AdminResource[]>>(`/admin/courses/${courseId}/resources`);
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
  created_at?: string;
  user?: { id: number; name: string; email: string };
  course?: { id: number; title: string };
}
export const listEnrollments = () =>
  apiClient.get<ApiResponse<AdminEnrollment[]>>("/admin/enrollments");
export const listEnrollmentsByCourse = (courseId: number) =>
  apiClient.get<ApiResponse<AdminEnrollment[]>>(`/admin/courses/${courseId}/enrollments`);
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
  apiClient.get<ApiResponse<AdminFeedback[]>>("/admin/feedbacks");
export const approveFeedback = (id: number) =>
  apiClient.patch<ApiResponse<AdminFeedback>>(`/admin/feedbacks/${id}/approve`);
export const deleteFeedback = (id: number) =>
  apiClient.delete<ApiResponse<null>>(`/admin/feedbacks/${id}`);
