import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { allCourses } from "@/data/coursesData";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Clock,
  ListVideo,
} from "lucide-react";

// Mock lessons data per course
const generateLessons = (courseTitle: string, lang: "en" | "ar") => {
  const lessonTemplates = lang === "en"
    ? [
        { title: "Introduction", duration: "3min" },
        { title: "Getting Started", duration: "5min" },
        { title: "Core Concepts", duration: "8min" },
        { title: "Vocabulary Building", duration: "6min" },
        { title: "Grammar Essentials", duration: "10min" },
        { title: "Pronunciation Practice", duration: "7min" },
        { title: "Listening Exercises", duration: "9min" },
        { title: "Speaking Drills", duration: "6min" },
        { title: "Reading Comprehension", duration: "8min" },
        { title: "Writing Practice", duration: "7min" },
        { title: "Review & Quiz", duration: "5min" },
        { title: "Final Assessment", duration: "12min" },
      ]
    : [
        { title: "مقدمة", duration: "3 دقائق" },
        { title: "البداية", duration: "5 دقائق" },
        { title: "المفاهيم الأساسية", duration: "8 دقائق" },
        { title: "بناء المفردات", duration: "6 دقائق" },
        { title: "أساسيات القواعد", duration: "10 دقائق" },
        { title: "تدريب النطق", duration: "7 دقائق" },
        { title: "تمارين الاستماع", duration: "9 دقائق" },
        { title: "تدريبات التحدث", duration: "6 دقائق" },
        { title: "فهم القراءة", duration: "8 دقائق" },
        { title: "تدريب الكتابة", duration: "7 دقائق" },
        { title: "مراجعة واختبار", duration: "5 دقائق" },
        { title: "التقييم النهائي", duration: "12 دقائق" },
      ];
  return lessonTemplates.map((l, i) => ({
    id: i + 1,
    title: l.title,
    duration: l.duration,
    completed: i < 2, // first 2 are "completed" as mock
  }));
};

const CoursePlayer = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const course = allCourses.find((c) => c.id === id);

  const lessons = generateLessons(course?.title[lang] || "", lang);
  const [activeLesson, setActiveLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(
    new Set(lessons.filter((l) => l.completed).map((l) => l.id))
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {lang === "en" ? "Course Not Found" : "الدورة غير موجودة"}
          </h1>
          <Button asChild>
            <Link to="/courses">{lang === "en" ? "Back to Courses" : "العودة للدورات"}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentLesson = lessons[activeLesson];
  const progress = Math.round((completedLessons.size / lessons.length) * 100);

  const toggleComplete = (lessonId: number) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const goNext = () => {
    if (activeLesson < lessons.length - 1) {
      // Mark current as completed
      setCompletedLessons((prev) => new Set(prev).add(currentLesson.id));
      setActiveLesson(activeLesson + 1);
    }
  };

  const goPrev = () => {
    if (activeLesson > 0) setActiveLesson(activeLesson - 1);
  };

  return (
    <div className="h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top Bar */}
      <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0 z-10">
        <Link
          to={`/courses/${id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          <span className="hidden sm:inline">{lang === "en" ? "Back" : "رجوع"}</span>
        </Link>
        <div className="h-5 w-px bg-border" />
        <h1 className="text-sm font-semibold text-foreground truncate flex-1">
          {course.title[lang]}
        </h1>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <Progress value={progress} className="w-24 h-2" />
          <span>{progress}%</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video Player */}
          <div className="bg-black aspect-video w-full relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            <div className="relative text-center z-10">
              <button className="w-20 h-20 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-colors shadow-lg">
                <Play size={32} className="text-primary-foreground ml-1" />
              </button>
              <p className="text-white/80 text-sm mt-4">
                {currentLesson.id}. {currentLesson.title}
              </p>
            </div>
          </div>

          {/* Video Controls Bar */}
          <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={activeLesson === 0}
              className="gap-1.5"
            >
              {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              {lang === "en" ? "Previous" : "السابق"}
            </Button>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {currentLesson.id}. {currentLesson.title}
              </p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                <Clock size={12} /> {currentLesson.duration}
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={goNext}
              disabled={activeLesson === lessons.length - 1}
              className="gap-1.5"
            >
              {lang === "en" ? "Next" : "التالي"}
              {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </Button>
          </div>

          {/* Tabs below video */}
          <div className="flex-1 overflow-auto p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {lang === "en" ? "Overview" : "نظرة عامة"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {course.desc[lang]}
            </p>
          </div>
        </div>

        {/* Lesson Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? "w-80" : "w-0"} 
            transition-all duration-300 bg-card border-s border-border shrink-0 overflow-hidden
            fixed lg:relative inset-y-14 ${isRtl ? "left-0" : "right-0"} lg:inset-y-0 z-20 lg:z-0
          `}
        >
          <div className="w-80 h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                  <ListVideo size={16} className="text-primary" />
                  {lang === "en" ? "Course Content" : "محتوى الدورة"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X size={14} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {completedLessons.size} / {lessons.length} {lang === "en" ? "completed" : "مكتمل"}
              </p>
              <Progress value={progress} className="h-1.5 mt-2" />
            </div>

            {/* Lesson List */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {lessons.map((lesson, index) => {
                  const isActive = index === activeLesson;
                  const isCompleted = completedLessons.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActiveLesson(index);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`
                        w-full text-start px-3 py-3 rounded-lg flex items-start gap-3 transition-colors mb-0.5
                        ${isActive
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50 border border-transparent"
                        }
                      `}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(lesson.id);
                        }}
                        className="mt-0.5 shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="text-primary" />
                        ) : (
                          <Circle size={18} className="text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isActive ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {lesson.id}. {lesson.title}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Play size={10} /> {lesson.duration}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayer;
