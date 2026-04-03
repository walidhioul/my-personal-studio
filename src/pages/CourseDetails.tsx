import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCourse } from "@/hooks/useCourses";
import { levelColors, levelTextColors } from "@/data/quizData";
import { CEFRLevel } from "@/data/quizData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, Star, BookOpen, CheckCircle, ArrowLeft, ArrowRight, Users, Loader2 } from "lucide-react";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const { data: course, isLoading, error } = useCourse(id || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {lang === "en" ? "Course Not Found" : "الدورة غير موجودة"}
            </h1>
            <Button asChild>
              <Link to="/courses">{lang === "en" ? "Back to Courses" : "العودة للدورات"}</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const highlights = lang === "en"
    ? ["Live interactive sessions", "Personalized feedback", "Certificate on completion", "Flexible scheduling", "Study materials included"]
    : ["جلسات تفاعلية مباشرة", "تقييم شخصي", "شهادة عند الإتمام", "جدول مرن", "مواد دراسية مضمنة"];

  const level = course.level as CEFRLevel;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-6">
        <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          {lang === "en" ? "All Courses" : "جميع الدورات"}
        </Link>
      </div>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl overflow-hidden aspect-video">
              <img src={course.thumbnail || course.picture || "/placeholder.svg"} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${levelColors[level]} text-white border-0`}>{course.level}</Badge>
                {course.rating && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" /> {course.rating}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{course.title}</h1>
              <p className="text-muted-foreground leading-relaxed">{course.description}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-primary" />
                {lang === "en" ? "What You'll Get" : "ما ستحصل عليه"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lessons list */}
            {course.lessons && course.lessons.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {lang === "en" ? "Course Content" : "محتوى الدورة"} ({course.lessons.length} {lang === "en" ? "lessons" : "درس"})
                </h2>
                <div className="space-y-2">
                  {course.lessons.map((lesson, i) => (
                    <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                      <span className="text-sm text-muted-foreground w-6">{i + 1}</span>
                      <span className="text-sm text-foreground flex-1">{lesson.title}</span>
                      <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-foreground">${course.price}</div>
              </div>
              <div className="space-y-3 mb-6">
                {course.duration && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock size={14} /> {lang === "en" ? "Duration" : "المدة"}
                    </span>
                    <span className="font-medium text-foreground">{course.duration} {lang === "en" ? "weeks" : "أسابيع"}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <BookOpen size={14} /> {lang === "en" ? "Level" : "المستوى"}
                  </span>
                  <span className={`font-medium ${levelTextColors[level]}`}>{course.level}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users size={14} /> {lang === "en" ? "Lessons" : "الدروس"}
                  </span>
                  <span className="font-medium text-foreground">{course.lessons_count || course.lessons?.length || 0}</span>
                </div>
              </div>
              <Button className="w-full" size="lg" asChild>
                <Link to={`/courses/${course.id}/learn`}>
                  {lang === "en" ? "Start Learning" : "ابدأ التعلم"}
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                {lang === "en" ? "30-day money back guarantee" : "ضمان استرداد الأموال خلال 30 يومًا"}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetails;
