export interface ApiCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  picture: string | null;
  price: number;
  level: string;
  duration?: number;
  lessons_count?: number;
  rating?: number;
}

export interface ApiLesson {
  id: number;
  title: string;
  duration: string;
  video_url: string | null;
  order: number;
  is_completed?: boolean;
}

export interface ApiVideo {
  id: number;
  title: string;
  description?: string;
  video_url?: string | null;
  duration?: number;
  order?: number;
  is_free?: boolean;
}

export interface ApiResource {
  id: number;
  title: string;
  url?: string;
  file_url?: string | null;
  type?: string;
}

export interface ApiQuiz {
  id: number;
  title: string;
  description?: string;
  passing_score?: number;
}

export interface ApiCourseDetail extends ApiCourse {
  lessons?: ApiLesson[];
  videos?: ApiVideo[];
  resources?: ApiResource[];
  quizzes?: ApiQuiz[];
}

export interface DashboardEnrolledCourse {
  id: number;
  title: string;
  level?: string;
  thumbnail?: string | null;
  picture?: string | null;
  payment_status?: string;
  course_id?: number;
  enrolled_at?: string;
}

export interface DashboardOverview {
  profile: { name: string; email: string };
  total_courses: number;
  total_certificates: number;
  completed_enrollments: number;
  pending_enrollments: number;
  failed_enrollments: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  courses: DashboardEnrolledCourse[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
