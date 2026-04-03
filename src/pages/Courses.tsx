import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { CEFRLevel, levelColors, levelTextColors } from "@/data/quizData";
import { useCourses } from "@/hooks/useCourses";
import { Clock, Star, BookOpen, Award, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const levelOrder: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const levelTitles = {
  en: { A1: "A1 – Beginner Level", A2: "A2 – Elementary Level", B1: "B1 – Intermediate Level", B2: "B2 – Upper Intermediate", C1: "C1 – Advanced Level", C2: "C2 – Proficiency Level" },
  ar: { A1: "A1 – مستوى المبتدئ", A2: "A2 – المستوى الأساسي", B1: "B1 – المستوى المتوسط", B2: "B2 – فوق المتوسط", C1: "C1 – المستوى المتقدم", C2: "C2 – مستوى الإتقان" },
};

const levelSubtitles = {
  en: { A1: "Start your English journey with fundamental skills", A2: "Build on basics with everyday communication", B1: "Handle most situations with growing confidence", B2: "Communicate fluently in complex contexts", C1: "Express yourself with precision and nuance", C2: "Achieve near-native mastery" },
  ar: { A1: "ابدأ رحلتك الإنجليزية بالمهارات الأساسية", A2: "ابنِ على الأساسيات مع التواصل اليومي", B1: "تعامل مع معظم المواقف بثقة متزايدة", B2: "تواصل بطلاقة في سياقات معقدة", C1: "عبّر عن نفسك بدقة وتفصيل", C2: "حقق إتقانًا شبيهًا بالمتحدثين الأصليين" },
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

  const displayCourses = userLevel
    ? (courses || []).filter((c) => c.level === userLevel)
    : (courses || []);

  // Group courses by level
  const coursesByLevel: Partial<Record<CEFRLevel, typeof displayCourses>> = {};
  displayCourses.forEach((c) => {
    const lvl = c.level as CEFRLevel;
    if (!coursesByLevel[lvl]) coursesByLevel[lvl] = [];
    coursesByLevel[lvl]!.push(c);
  });

  const displayLevels = levelOrder.filter((lv) => coursesByLevel[lv]);

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

        {!isLoading && !error && displayLevels.map((level) => (
          <section key={level} className="mb-16 last:mb-0">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${levelColors[level]} flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{levelTitles[lang][level]}</h2>
              </div>
              <p className="text-muted-foreground text-sm">{levelSubtitles[lang][level]}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesByLevel[level]!.map((course) => (
                <div key={course.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="h-44 overflow-hidden">
                    <img
                      src={course.thumbnail || course.picture || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${levelTextColors[course.level as CEFRLevel]}`}>{course.level}</span>
                      {course.rating && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          ({course.rating})
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{course.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      {course.duration && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={12} /> {course.duration} {lang === "en" ? "weeks" : "أسبوع"}
                        </span>
                      )}
                      <span className="font-bold text-foreground">${course.price}</span>
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
