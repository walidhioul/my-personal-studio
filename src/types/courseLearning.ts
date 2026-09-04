export interface CourseLearningCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  picture_url: string | null;
  price: number;
  level: string;
}

export interface CourseLearningVideo {
  id: number;
  course_id: number;
  course_title: string | null;
  title: string;
  description: string | null;
  duration: number | null;
  order: number;
  is_free_preview: boolean;
  status: string;
  created_at: string;
  player_url: string | null;
}

export interface CourseLearningResource {
  id: number;
  title: string;
  file_name: string;
  mime_type: string;
  file_size: number | null;
  download_url: string | null;
  order: number;
}

export interface CourseLearningData {
  course: CourseLearningCourse;
  is_enrolled: boolean;
  videos: CourseLearningVideo[];
  resources: CourseLearningResource[];
}

export interface CourseLearningResponse {
  success: boolean;
  message: string;
  data: CourseLearningData;
  errors: unknown;
}

export interface ResourceAccessResponse {
  success: boolean;
  message: string;
  data: {
    download_url: string;
  };
  errors: unknown;
}
export interface VideoCompletionResponse {
  success: boolean;
  message: string;
  data: {
    video_id: number;
    completed: boolean;
    completed_at: string;
  };
  errors: unknown;
}
