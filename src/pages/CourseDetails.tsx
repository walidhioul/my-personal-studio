import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { allCourses } from "@/data/coursesData";
import { levelColors, levelTextColors } from "@/data/quizData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, Star, BookOpen, CheckCircle, ArrowLeft, ArrowRight, Users } from "lucide-react";
const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const course = allCourses.find((c) => c.id === id);
  if (!course) {
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
  const relatedCourses = allCourses.filter((c) => c.level === course.level && c.id !== course.id).slice(0, 2);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-6">
        <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          {lang === "en" ? "All Courses" : "جميع الدورات"}
        </Link>
      </div>
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Course Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="rounded-xl overflow-hidden aspect-video">
              <img src={course.image} alt={course.title[lang]} className="w-full h-full object-cover" />
            </div>
            {/* Title & Meta */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${levelColors[course.level]} text-white border-0`}>{course.level}</Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" /> {course.rating}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{course.title[lang]}</h1>
              <p className="text-muted-foreground leading-relaxed">{course.desc[lang]}</p>
            </div>
            {/* What You'll Learn */}
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
          </div>
          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-foreground">${course.price}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  ${course.perLesson} / {lang === "en" ? "lesson" : "درس"}
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock size={14} /> {lang === "en" ? "Duration" : "المدة"}
                  </span>
                  <span className="font-medium text-foreground">
                    {course.weeks} {lang === "en" ? "weeks" : "أسابيع"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <BookOpen size={14} /> {lang === "en" ? "Level" : "المستوى"}
                  </span>
                  <span className={`font-medium ${levelTextColors[course.level]}`}>{course.level}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users size={14} /> {lang === "en" ? "Class Size" : "حجم الفصل"}
                  </span>
                  <span className="font-medium text-foreground">8-12</span>
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
        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {lang === "en" ? "Related Courses" : "دورات ذات صلة"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedCourses.map((rc) => (
                <Link key={rc.id} to={`/courses/${rc.id}`} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex">
                  <div className="w-36 shrink-0">
                    <img src={rc.image} alt={rc.title[lang]} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-4 flex flex-col justify-center">
                    <span className={`text-xs font-bold ${levelTextColors[rc.level]} mb-1`}>{rc.level}</span>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{rc.title[lang]}</h3>
                    <span className="text-xs text-muted-foreground">${rc.price} · {rc.weeks} {lang === "en" ? "weeks" : "أسابيع"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};
export default CourseDetails;
