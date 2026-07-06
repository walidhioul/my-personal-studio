export interface DashboardProfile {
  name: string;
  email: string;
}

export interface DashboardOverview {
  profile: DashboardProfile;
  total_courses: number;
  total_certificates: number;
  completed_enrollments: number;
  pending_enrollments: number;
  failed_enrollments: number;
}

export interface DashboardCourse {
  course_id: number;
  title: string;
  payment_status: "completed" | "pending" | "failed" | string;
  enrolled_at: string; // "2026-05-18 18:44:51"
}

export interface DashboardCertificate {
  id: number;
  title: string;
  // add more fields once you have a non-empty certificates[] sample
}

export interface DashboardQuizzes {
  attempts: number;
  passed: number;
  pass_rate: number;
  average_score: number;
}

export interface DashboardFeedback {
  total_submitted: number;
  approved: number;
  average_rating: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  courses: DashboardCourse[];
  certificates: DashboardCertificate[];
  english_level: string;
  quizzes: DashboardQuizzes;
  feedback: DashboardFeedback;
}