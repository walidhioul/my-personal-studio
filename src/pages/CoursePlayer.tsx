import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCourse } from "@/hooks/useCourses";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  ArrowLeft, ArrowRight, Play, CheckCircle2, Circle,
  ChevronLeft, ChevronRight, Menu, X, Clock, ListVideo, Loader2,
} from "lucide-react";

const CoursePlayer = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const { data: course, isLoading } = useCourse(id || "");

  const [activeLesson, setActiveLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

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

  const lessons = course.lessons || [];
  const currentLesson = lessons[activeLesson];

  const toggleComplete = (lessonId: number) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const goNext = () => {
    if (activeLesson < lessons.length - 1 && currentLesson) {
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
        <h1 className="text-sm font-semibold text-foreground truncate flex-1">{course.title}</h1>
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

          {/* ✅ HARDCODED TEST IFRAME - no conditions */}
          <div className="bg-black aspect-video w-full">
            <iframe
              src="https://iframe.mediadelivery.net/embed/687329/48b3681c-18af-4ad8-9f87-be8bac46e929"
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              style={{ border: "none" }}
            />
          </div>

          {/* Navigation Bar */}
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

            {currentLesson && (
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {currentLesson.order}. {currentLesson.title}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                  <Clock size={12} /> {currentLesson.duration}
                </p>
              </div>
            )}

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

          {/* Course Description */}
          <div className="flex-1 overflow-auto p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {lang === "en" ? "Overview" : "نظرة عامة"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
          </div>
        </div>

        {/* Lesson Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 bg-card border-s border-border shrink-0 overflow-hidden fixed lg:relative inset-y-14 ${isRtl ? "left-0" : "right-0"} lg:inset-y-0 z-20 lg:z-0`}
        >
          <div className="w-80 h-full flex flex-col">
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
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {lessons.map((lesson: any, index: number) => {
                  const isActive = index === activeLesson;
                  const isCompleted = completedLessons.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActiveLesson(index);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`w-full text-start px-3 py-3 rounded-lg flex items-start gap-3 transition-colors mb-0.5 ${
                        isActive
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50 border border-transparent"
                      }`}
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
                        <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                          {lesson.order}. {lesson.title}
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