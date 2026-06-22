import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { CEFRLevel } from "@/data/quizData";
import { useCourses } from "@/hooks/useCourses";
import { Clock, Star, BookOpen, Award, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { resolveAsset } from "@/config/api";

type ApiLevel = "Beginner" | "Intermediate" | "Advanced";
const levelOrder: ApiLevel[] = ["Beginner", "Intermediate", "Advanced"];

const levelBadgeColor: Record<ApiLevel, string> = {
  Beginner: "bg-green-500",
  Intermediate: "bg-blue-500",
  Advanced: "bg-purple-500",
};

const levelTextColor: Record<ApiLevel, string> = {
  Beginner: "text-green-600",
  Intermediate: "text-blue-600",
  Advanced: "text-purple-600",
};

const levelTitles = {
  en: { Beginner: "Beginner Level", Intermediate: "Intermediate Level", Advanced: "Advanced Level" },
  ar: { Beginner: "المستوى المبتدئ", Intermediate: "المستوى المتوسط", Advanced: "المستوى المتقدم" },
};

const levelSubtitles = {
  en: {
    Beginner: "Start your English journey with fundamental skills",
    Intermediate: "Build confidence in everyday and work communication",
    Advanced: "Express yourself fluently with precision and nuance",
  },
  ar: {
    Beginner: "ابدأ رحلتك الإنجليزية بالمهارات الأساسية",
    Intermediate: "ابنِ ثقتك في التواصل اليومي والمهني",
    Advanced: "عبّر عن نفسك بطلاقة ودقة",
  },
};

// Map CEFR placement-test result to backend's level grouping
const cefrToApiLevel: Record<CEFRLevel, ApiLevel> = {
  A1: "Beginner", A2: "Beginner",
  B1: "Intermediate", B2: "Intermediate",
  C1: "Advanced", C2: "Advanced",
};

const Courses = () => {
  const { lang } = useLanguage();
  const [userLevel, setUserLevel] = useState<CEFRLevel | null>(null);
  const { data: courses, isLoading, error } = useCourses();

  useEffect(() => {
    const stored = localStorage.getItem("quizResult");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserLevel(parsed.level);
    }
  }, []);

  const mappedLevel = userLevel ? cefrToApiLevel[userLevel] : null;

  const displayCourses = mappedLevel
    ? (courses || []).filter((c) => c.level === mappedLevel)
    : (courses || []);

  const coursesByLevel: Partial<Record<ApiLevel, typeof displayCourses>> = {};
  displayCourses.forEach((c) => {
    const lvl = c.level as ApiLevel;
    if (!levelOrder.includes(lvl)) return;
    if (!coursesByLevel[lvl]) coursesByLevel[lvl] = [];
    coursesByLevel[lvl]!.push(c);
  });

  const displayLevels = levelOrder.filter((lv) => coursesByLevel[lv]?.length);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
            {lang === "en" ? "English Courses" : "الدورات الإنجليزية"}
          </h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto mb-8">
            {lang === "en"
              ? "Choose the perfect course for your English learning journey."
              : "اختر الدورة المثالية لرحلتك في تعلم الإنجليزية."}
          </p>

          {userLevel && (
            <div className="mt-6 inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 text-primary-foreground text-sm">
              <Award size={16} />
              {lang === "en" ? `Showing courses for your level: ${userLevel}` : `عرض الدورات لمستواك: ${userLevel}`}
              <button
                className="ms-2 underline text-primary-foreground/70 hover:text-primary-foreground text-xs"
                onClick={() => { localStorage.removeItem("quizResult"); setUserLevel(null); }}
              >
                {lang === "en" ? "Show all" : "عرض الكل"}
              </button>
            </div>
          )}

          {!userLevel && (
            <div className="mt-6">
              <Button variant="secondary" size="lg" asChild className="gap-2">
                <Link to="/placement-test">
                  <BookOpen size={18} />
                  {lang === "en" ? "Take Placement Test" : "ابدأ اختبار تحديد المستوى"}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Course Sections */}
      <main className="flex-1 container mx-auto px-4 py-16">
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-destructive">
            {lang === "en" ? "Failed to load courses. Please try again." : "فشل تحميل الدورات. يرجى المحاولة مرة أخرى."}
          </div>
        )}

        {!isLoading && !error && displayCourses.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            {lang === "en" ? "No courses available yet." : "لا توجد دورات متاحة حتى الآن."}
          </div>
        )}

        {!isLoading && !error && displayLevels.map((level) => (
          <section key={level} className="mb-16 last:mb-0">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${levelBadgeColor[level]} flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{levelTitles[lang][level]}</h2>
              </div>
              <p className="text-muted-foreground text-sm">{levelSubtitles[lang][level]}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesByLevel[level]!.map((course) => (
                <div key={course.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="h-44 overflow-hidden bg-muted">
                    <img
                      src={resolveAsset(course.thumbnail || course.picture)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${levelTextColor[course.level as ApiLevel] || "text-muted-foreground"}`}>{course.level}</span>
                      {course.rating && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          ({course.rating})
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5 line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{course.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      {course.duration && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={12} /> {course.duration} {lang === "en" ? "weeks" : "أسبوع"}
                        </span>
                      )}
                      <span className="font-bold text-foreground">
                        {Number(course.price) === 0 ? (lang === "en" ? "Free" : "مجاني") : `$${course.price}`}
                      </span>
                    </div>

                    <Button className="w-full" size="sm" asChild>
                      <Link to={`/courses/${course.id}`}>{lang === "en" ? "View Details" : "عرض التفاصيل"}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            {lang === "en" ? "Ready to Start Your English Journey?" : "هل أنت مستعد لبدء رحلتك في تعلم الإنجليزية؟"}
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Button variant="secondary" size="lg">{lang === "en" ? "Book Free Consultation" : "احجز استشارة مجانية"}</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
