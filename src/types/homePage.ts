import { ApiCourse } from "@/types/course";
import { Feedback } from "@/types/feedback";

export interface HomePageData {
  best_selling_courses: ApiCourse[];
  featured_feedbacks: Feedback[];
}
