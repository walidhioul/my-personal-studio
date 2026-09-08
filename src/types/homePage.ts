export interface HomePageCourse {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url?: string | null;
  picture_url?: string | null;
  price: number | string;
  level: string;
  sales_count?: number;
}

export interface HomePageFeedback {
  id: number;
  user_id: number;
  course_id: number;
  rating: number;
  comment: string | null;
  is_approved: boolean;
}

export interface HomePageData {
  best_selling_courses: HomePageCourse[];
  featured_feedbacks: HomePageFeedback[];
}
