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

export interface ApiCourseDetail extends ApiCourse {
  lessons: ApiLesson[];
}

export interface DashboardData {
  user: {
    id: number;
    name: string;
    email: string;
  };
  enrolled_courses: {
    id: number;
    title: string;
    level: string;
    progress: number;
  }[];
  stats: {
    total_courses: number;
    completed_courses: number;
    study_hours: number;
    certificates: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
