import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCourse } from "@/hooks/useCourses";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  ArrowLeft, ArrowRight, Play, CheckCircle2, Circle,
  ChevronLeft, ChevronRight, Menu, X, Clock, ListVideo,
  Loader2, BookOpen, FileText, HelpCircle, Lock,
} from "lucide-react";

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s > 0 ? s + "s" : ""}`;
};

const CoursePlayer = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const { data: course, isLoading } = useCourse(id || "");

  const [activeLesson, setActiveLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "resources" | "quiz">("overview");

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

  const videos = course.videos || [];
  const resources = course.resources || [];
  const quizzes = course.quizzes || [];
  const currentLesson = videos[activeLesson];
  const totalDuration = videos.reduce((acc: number, v: any) => acc + (v.duration || 0), 0);

  const toggleComplete = (lessonId: number) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const goNext = () => {
    if (activeLesson < videos.length - 1 && currentLesson) {
      setCompletedLessons((prev) => new Set(prev).add(currentLesson.id));
      setActiveLesson(activeLesson + 1);
    }
  };

  const goPrev = () => {
    if (activeLesson > 0) setActiveLesson(activeLesson - 1);
  };

  return (
    // ✅ No h-screen, no overflow-hidden — page scrolls freely
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>

      {/* Sticky Top Bar */}
      <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 sticky top-0 z-50">
        <Link
          to={`/courses/${id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          <span className="hidden sm:inline">{lang === "en" ? "Back" : "رجوع"}</span>
        </Link>
        <div className="h-5 w-px bg-border" />
        <h1 className="text-sm font-semibold text-foreground truncate flex-1">{course.title}</h1>

        {/* Progress */}
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${videos.length ? (completedLessons.size / videos.length) * 100 : 0}%` }}
            />
          </div>
          <span>{completedLessons.size}/{videos.length} {lang === "en" ? "completed" : "مكتمل"}</span>
        </div>

        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </header>

      {/* ✅ Two column layout — both columns scroll with the page */}
      <div className="flex items-start">

        {/* Left: Video + Tabs — grows with content */}
        <div className="flex-1 min-w-0">

          {/* Video */}
          <div className="bg-black aspect-video w-full">
            <iframe
              src="https://iframe.mediadelivery.net/embed/687329/48b3681c-18af-4ad8-9f87-be8bac46e929"
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              style={{ border: "none" }}
            />
          </div>

          {/* Navigation */}
          <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={goPrev} disabled={activeLesson === 0} className="gap-1.5">
              {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              {lang === "en" ? "Previous" : "السابق"}
            </Button>

            {currentLesson && (
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {currentLesson.order}. {currentLesson.title}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                  <Clock size={12} /> {formatDuration(currentLesson.duration)}
                </p>
              </div>
            )}

            <Button variant="default" size="sm" onClick={goNext} disabled={activeLesson === videos.length - 1} className="gap-1.5">
              {lang === "en" ? "Next" : "التالي"}
              {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </Button>
          </div>

          {/* Tabs Bar */}
          <div className="border-b border-border bg-card">
            <div className="flex px-4">
              {[
                { key: "overview", label: lang === "en" ? "Overview" : "نظرة عامة", icon: BookOpen },
                { key: "resources", label: lang === "en" ? `Resources (${resources.length})` : `الموارد (${resources.length})`, icon: FileText },
                { key: "quiz", label: lang === "en" ? `Quizzes (${quizzes.length})` : `الاختبارات (${quizzes.length})`, icon: HelpCircle },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content — no overflow, just grows */}
          <div className="p-6">

            {/* Overview */}
            {activeTab === "overview" && (
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{course.level}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatDuration(totalDuration)} {lang === "en" ? "total" : "إجمالي"}
                  </span>
                  <span className="flex items-center gap-1">
                    <ListVideo size={12} /> {videos.length} {lang === "en" ? "lessons" : "درس"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
                {currentLesson?.description && (
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {lang === "en" ? "About this lesson" : "عن هذا الدرس"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{currentLesson.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Resources */}
            {activeTab === "resources" && (
              <div className="max-w-2xl space-y-2">
                <h2 className="text-base font-semibold text-foreground mb-3">
                  {lang === "en" ? "Course Resources" : "موارد الدورة"}
                </h2>
                {resources.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {lang === "en" ? "No resources available." : "لا توجد موارد."}
                  </p>
                ) : (
                  resources.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-primary shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.title}</p>
                          {r.file_size && (
                            <p className="text-xs text-muted-foreground">
                              {(r.file_size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          )}
                        </div>
                      </div>
                      {r.download_url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={r.download_url} download>{lang === "en" ? "Download" : "تحميل"}</a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {lang === "en" ? "Unavailable" : "غير متاح"}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Quizzes */}
            {activeTab === "quiz" && (
              <div className="max-w-2xl space-y-3">
                <h2 className="text-base font-semibold text-foreground mb-3">
                  {lang === "en" ? "Course Quizzes" : "اختبارات الدورة"}
                </h2>
                {quizzes.map((q: any) => (
                  <div key={q.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{q.title}</p>
                        {q.description && (
                          <p className="text-xs text-muted-foreground mt-1">{q.description}</p>
                        )}
                        <p className="text-xs text-primary mt-1">
                          {lang === "en" ? `Passing score: ${q.passing_score}%` : `درجة النجاح: ${q.passing_score}%`}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        {lang === "en" ? "Start" : "ابدأ"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ✅ Sidebar — sticky so it stays visible while page scrolls */}
        {sidebarOpen && (
          <aside className="hidden lg:flex w-80 shrink-0 flex-col border-s border-border bg-card sticky top-14 max-h-[calc(100vh-3.5rem)]">
            <div className="p-4 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                  <ListVideo size={16} className="text-primary" />
                  {lang === "en" ? "Course Content" : "محتوى الدورة"}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {videos.length} {lang === "en" ? "lessons" : "درس"} · {formatDuration(totalDuration)}
              </p>
            </div>

            {/* ✅ Sidebar list scrolls independently */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-2">
                {videos.map((video: any, index: number) => {
                  const isActive = index === activeLesson;
                  const isCompleted = completedLessons.has(video.id);
                  return (
                    <button
                      key={video.id}
                      onClick={() => setActiveLesson(index)}
                      className={`w-full text-start px-3 py-3 rounded-lg flex items-start gap-3 transition-colors mb-0.5 ${
                        isActive
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50 border border-transparent"
                      }`}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleComplete(video.id); }}
                        className="mt-0.5 shrink-0"
                      >
                        {isCompleted
                          ? <CheckCircle2 size={18} className="text-primary" />
                          : <Circle size={18} className="text-muted-foreground" />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                          {video.order}. {video.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Play size={10} /> {formatDuration(video.duration)}
                          </p>
                          {video.is_free_preview
                            ? <span className="text-xs text-green-500 font-medium">{lang === "en" ? "Preview" : "معاينة"}</span>
                            : <Lock size={10} className="text-muted-foreground" />
                          }
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

      </div>
    </div>
  );
};

export default CoursePlayer;