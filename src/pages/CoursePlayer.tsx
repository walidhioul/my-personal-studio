import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { useLanguage } from "@/i18n/LanguageContext";
import {
  useCourseLearning,
  useAccessCourseResource,
} from "@/hooks/useCourseLearning";

import { Button } from "@/components/ui/button";

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
  Loader2,
  BookOpen,
  FileText,
  Download,
  Lock,
} from "lucide-react";

import type { CourseLearningVideo } from "@/types/courseLearning";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || seconds <= 0) {
    return "--";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes || bytes <= 0) {
    return "--";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const CoursePlayer = () => {
  const { id } = useParams<{ id: string }>();

  const { lang } = useLanguage();

  const isRtl = lang === "ar";

  /* ------------------------------------------------------------------------ */
  /* Course ID                                                               */
  /* ------------------------------------------------------------------------ */

  const courseId = id ? Number(id) : undefined;

  /* ------------------------------------------------------------------------ */
  /* Fetch learning content                                                  */
  /* ------------------------------------------------------------------------ */

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useCourseLearning(courseId);

  /* ------------------------------------------------------------------------ */
  /* Resource download mutation                                              */
  /* ------------------------------------------------------------------------ */

  const accessResourceMutation = useAccessCourseResource();

  /* ------------------------------------------------------------------------ */
  /* Local state                                                              */
  /* ------------------------------------------------------------------------ */

  const [activeLesson, setActiveLesson] = useState(0);

  const [completedLessons, setCompletedLessons] = useState<Set<number>>(
    new Set(),
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [activeTab, setActiveTab] = useState<"overview" | "resources">(
    "overview",
  );

  /* ------------------------------------------------------------------------ */
  /* Backend data                                                             */
  /* ------------------------------------------------------------------------ */

  const learningData = response?.data;

  const course = learningData?.course;

  const isEnrolled = learningData?.is_enrolled ?? false;

  const videos = learningData?.videos ?? [];

  const resources = learningData?.resources ?? [];

  /* ------------------------------------------------------------------------ */
  /* Sort videos by `order`                                                  */
  /* ------------------------------------------------------------------------ */

  const sortedVideos = useMemo<CourseLearningVideo[]>(() => {
    return [...videos].sort((a, b) => a.order - b.order);
  }, [videos]);

  /* ------------------------------------------------------------------------ */
  /* Current lesson                                                           */
  /* ------------------------------------------------------------------------ */

  const currentLesson = sortedVideos[activeLesson];

  /* ------------------------------------------------------------------------ */
  /* Course statistics                                                        */
  /* ------------------------------------------------------------------------ */

  const totalDuration = sortedVideos.reduce((total, video) => {
    return total + (video.duration ?? 0);
  }, 0);

  const progress =
    sortedVideos.length > 0
      ? Math.min(100, (completedLessons.size / sortedVideos.length) * 100)
      : 0;

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error / Course not found                                                 */
  /* ------------------------------------------------------------------------ */

  if (isError || !course) {
    console.error("Failed to load course learning content:", error);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {lang === "en" ? "Course Not Found" : "الدورة غير موجودة"}
          </h1>

          <p className="text-sm text-muted-foreground mb-6">
            {lang === "en"
              ? "We couldn't load this course. Please try again."
              : "تعذر تحميل هذه الدورة. يرجى المحاولة مرة أخرى."}
          </p>

          <Button asChild>
            <Link to="/courses">
              {lang === "en" ? "Back to Courses" : "العودة للدورات"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Navigation                                                               */
  /* ------------------------------------------------------------------------ */

  const goNext = () => {
    if (activeLesson >= sortedVideos.length - 1) {
      return;
    }

    /*
     * For enrolled users, automatically mark the
     * current lesson as completed when going next.
     */
    if (isEnrolled && currentLesson) {
      setCompletedLessons((previous) => {
        const next = new Set(previous);

        next.add(currentLesson.id);

        return next;
      });
    }

    setActiveLesson((previous) => previous + 1);
  };

  const goPrevious = () => {
    if (activeLesson <= 0) {
      return;
    }

    setActiveLesson((previous) => previous - 1);
  };

  /* ------------------------------------------------------------------------ */
  /* Completion                                                               */
  /* ------------------------------------------------------------------------ */

  const toggleComplete = (lessonId: number) => {
    /*
     * Non-enrolled users don't have progress.
     */
    if (!isEnrolled) {
      return;
    }

    setCompletedLessons((previous) => {
      const next = new Set(previous);

      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }

      return next;
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Resource download                                                        */
  /* ------------------------------------------------------------------------ */

  const handleDownload = async (resourceId: number) => {
    if (!courseId) {
      return;
    }

    try {
      const response = await accessResourceMutation.mutateAsync({
        courseId,
        resourceId,
      });

      const downloadUrl = response.data.download_url;

      if (!downloadUrl) {
        throw new Error("Download URL was not returned.");
      }

      /*
       * Open the URL returned by the backend.
       *
       * The backend remains responsible for
       * checking whether the user is allowed
       * to download the resource.
       */
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to download resource:", error);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 sticky top-0 z-50">
        {/* Back */}
        <Link
          to={`/courses/${id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}

          <span className="hidden sm:inline">
            {lang === "en" ? "Back" : "رجوع"}
          </span>
        </Link>

        <div className="h-5 w-px bg-border" />

        {/* Course title */}
        <h1 className="text-sm font-semibold text-foreground truncate flex-1">
          {course.title}
        </h1>

        {/* ================================================================ */}
        {/* ENROLLED HEADER                                                  */}
        {/* ================================================================ */}

        {isEnrolled ? (
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <span>
              {completedLessons.size}/{sortedVideos.length}{" "}
              {lang === "en" ? "completed" : "مكتمل"}
            </span>
          </div>
        ) : (
          /* ============================================================ */
          /* PREVIEW HEADER                                                */
          /* ============================================================ */

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            <Play size={12} />

            {lang === "en" ? "Free Preview" : "معاينة مجانية"}
          </span>
        )}

        {/* Mobile sidebar button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen((previous) => !previous)}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </header>

      {/* ================================================================== */}
      {/* MAIN LAYOUT                                                        */}
      {/* ================================================================== */}

      <div className="flex items-start">
        {/* ================================================================= */}
        {/* MAIN CONTENT                                                      */}
        {/* ================================================================= */}

        <main className="flex-1 min-w-0">
          {/* =============================================================== */}
          {/* PREVIEW NOTICE                                                   */}
          {/* =============================================================== */}

          {!isEnrolled && (
            <div className="bg-primary/5 border-b border-primary/10 px-4 py-3">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {lang === "en"
                      ? "You're watching a free preview"
                      : "أنت تشاهد معاينة مجانية"}
                  </p>

                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "en"
                      ? "Enroll in this course to access all lessons and resources."
                      : "سجل في هذه الدورة للوصول إلى جميع الدروس والموارد."}
                  </p>
                </div>

                <Button size="sm" asChild className="shrink-0">
                  <Link to={`/courses/${id}`}>
                    {lang === "en" ? "View Course" : "عرض الدورة"}
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIDEO                                                            */}
          {/* =============================================================== */}

          <div className="bg-black aspect-video w-full">
            {currentLesson?.player_url && currentLesson.status === "ready" ? (
              <iframe
                key={currentLesson.id}
                src={currentLesson.player_url}
                title={currentLesson.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                style={{
                  border: "none",
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Loader2 className="animate-spin mx-auto mb-3" size={32} />

                  <p className="text-sm">
                    {currentLesson
                      ? lang === "en"
                        ? "Video is not ready yet."
                        : "الفيديو غير جاهز بعد."
                      : lang === "en"
                        ? "No video available."
                        : "لا يوجد فيديو متاح."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* VIDEO NAVIGATION                                                 */}
          {/* =============================================================== */}

          <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
            {/* Previous */}
            <Button
              variant="outline"
              size="sm"
              onClick={goPrevious}
              disabled={activeLesson === 0}
              className="gap-1.5"
            >
              {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}

              {lang === "en" ? "Previous" : "السابق"}
            </Button>

            {/* Current lesson */}
            {currentLesson ? (
              <div className="text-center min-w-0 px-3">
                <p className="text-sm font-medium text-foreground truncate">
                  {currentLesson.order}. {currentLesson.title}
                </p>

                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                  <Clock size={12} />

                  {formatDuration(currentLesson.duration)}
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {lang === "en" ? "No lessons" : "لا توجد دروس"}
              </div>
            )}

            {/* Next */}
            <Button
              variant="default"
              size="sm"
              onClick={goNext}
              disabled={activeLesson >= sortedVideos.length - 1}
              className="gap-1.5"
            >
              {lang === "en" ? "Next" : "التالي"}

              {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </Button>
          </div>

          {/* =============================================================== */}
          {/* TABS                                                             */}
          {/* =============================================================== */}

          <div className="border-b border-border bg-card">
            <div className="flex px-4">
              {/* Overview */}
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "overview"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen size={14} />

                {lang === "en" ? "Overview" : "نظرة عامة"}
              </button>

              {/* Resources */}
              <button
                type="button"
                onClick={() => setActiveTab("resources")}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "resources"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText size={14} />

                {lang === "en"
                  ? `Resources (${resources.length})`
                  : `الموارد (${resources.length})`}
              </button>
            </div>
          </div>

          {/* =============================================================== */}
          {/* TAB CONTENT                                                      */}
          {/* =============================================================== */}

          <div className="p-6">
            {/* ============================================================= */}
            {/* OVERVIEW                                                       */}
            {/* ============================================================= */}

            {activeTab === "overview" && (
              <div className="max-w-2xl space-y-4">
                {/* Course statistics */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  {/* Level */}
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                    {course.level}
                  </span>

                  {/* Duration */}
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(totalDuration)}{" "}
                    {lang === "en" ? "total" : "إجمالي"}
                  </span>

                  {/* Lessons */}
                  <span className="flex items-center gap-1">
                    <ListVideo size={12} />
                    {sortedVideos.length} {lang === "en" ? "lessons" : "درس"}
                  </span>
                </div>

                {/* Course description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {course.description}
                </p>

                {/* Current lesson description */}
                {currentLesson?.description && (
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {lang === "en" ? "About this lesson" : "عن هذا الدرس"}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {currentLesson.description}
                    </p>
                  </div>
                )}

                {/* Preview CTA */}
                {!isEnrolled && (
                  <div className="border border-primary/20 bg-primary/5 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      {lang === "en"
                        ? "Want access to the full course?"
                        : "هل تريد الوصول إلى الدورة كاملة؟"}
                    </h3>

                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      {lang === "en"
                        ? "Enroll to unlock all lessons and course resources."
                        : "سجل للوصول إلى جميع الدروس وموارد الدورة."}
                    </p>

                    <Button size="sm" asChild>
                      <Link to={`/courses/${id}`}>
                        {lang === "en"
                          ? "Enroll in Course"
                          : "التسجيل في الدورة"}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* RESOURCES                                                       */}
            {/* ============================================================= */}

            {activeTab === "resources" && (
              <div className="max-w-2xl space-y-3">
                <h2 className="text-base font-semibold text-foreground mb-3">
                  {lang === "en" ? "Course Resources" : "موارد الدورة"}
                </h2>

                {/* No resources */}
                {resources.length === 0 ? (
                  <div className="text-center py-10">
                    <FileText
                      size={32}
                      className="mx-auto mb-3 text-muted-foreground"
                    />

                    <p className="text-sm text-muted-foreground">
                      {!isEnrolled
                        ? lang === "en"
                          ? "Resources are available after enrollment."
                          : "الموارد متاحة بعد التسجيل في الدورة."
                        : lang === "en"
                          ? "No resources available."
                          : "لا توجد موارد."}
                    </p>

                    {!isEnrolled && (
                      <Button size="sm" className="mt-4" asChild>
                        <Link to={`/courses/${id}`}>
                          {lang === "en" ? "Enroll Now" : "سجل الآن"}
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  /* Resources list */
                  resources
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((resource) => {
                      const isDownloading =
                        accessResourceMutation.isPending &&
                        accessResourceMutation.variables?.resourceId ===
                          resource.id;

                      return (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between gap-4 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          {/* Resource information */}
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText
                              size={18}
                              className="text-primary shrink-0"
                            />

                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {resource.title}
                              </p>

                              <p className="text-xs text-muted-foreground mt-0.5">
                                {resource.mime_type} ·{" "}
                                {formatFileSize(resource.file_size)}
                              </p>
                            </div>
                          </div>

                          {/* Download */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isDownloading}
                            onClick={() => handleDownload(resource.id)}
                            className="shrink-0 gap-1.5"
                          >
                            {isDownloading ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Download size={14} />
                            )}

                            <span className="hidden sm:inline">
                              {isDownloading
                                ? lang === "en"
                                  ? "Preparing..."
                                  : "جاري التحضير..."
                                : lang === "en"
                                  ? "Download"
                                  : "تحميل"}
                            </span>
                          </Button>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        </main>

        {/* ================================================================= */}
        {/* SIDEBAR                                                           */}
        {/* ================================================================= */}

        {sidebarOpen && (
          <aside className="hidden lg:flex w-80 shrink-0 flex-col border-s border-border bg-card sticky top-14 max-h-[calc(100vh-3.5rem)]">
            {/* ============================================================= */}
            {/* SIDEBAR HEADER                                                 */}
            {/* ============================================================= */}

            <div className="p-4 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                  <ListVideo size={16} className="text-primary" />

                  {lang === "en" ? "Course Content" : "محتوى الدورة"}
                </h2>
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                {sortedVideos.length}{" "}
                {lang === "en" ? "lessons available" : "درس متاح"} ·{" "}
                {formatDuration(totalDuration)}
              </p>

              {/* Preview label */}
              {!isEnrolled && (
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    <Play size={11} />

                    {lang === "en" ? "Preview Mode" : "وضع المعاينة"}
                  </span>
                </div>
              )}
            </div>

            {/* ============================================================= */}
            {/* LESSON LIST                                                     */}
            {/* ============================================================= */}

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-2">
                {sortedVideos.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <Play
                      size={28}
                      className="mx-auto mb-3 text-muted-foreground"
                    />

                    <p className="text-sm text-muted-foreground">
                      {lang === "en"
                        ? "No videos available."
                        : "لا توجد فيديوهات متاحة."}
                    </p>
                  </div>
                ) : (
                  sortedVideos.map((video, index) => {
                    const isActive = index === activeLesson;

                    const isCompleted = completedLessons.has(video.id);

                    return (
                      <div
                        key={video.id}
                        className={`w-full px-3 py-3 rounded-lg flex items-start gap-3 transition-colors mb-0.5 ${
                          isActive
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/50 border border-transparent"
                        }`}
                      >
                        {/* ================================================= */}
                        {/* COMPLETION                                         */}
                        {/* ================================================= */}

                        {isEnrolled && (
                          <button
                            type="button"
                            onClick={() => toggleComplete(video.id)}
                            className="mt-0.5 shrink-0"
                            aria-label={
                              isCompleted
                                ? "Mark as incomplete"
                                : "Mark as complete"
                            }
                          >
                            {isCompleted ? (
                              <CheckCircle2
                                size={18}
                                className="text-primary"
                              />
                            ) : (
                              <Circle
                                size={18}
                                className="text-muted-foreground"
                              />
                            )}
                          </button>
                        )}

                        {/* ================================================= */}
                        {/* LESSON BUTTON                                     */}
                        {/* ================================================= */}

                        {/* ================================================= */}
                        {/* LESSON BUTTON                                     */}
                        {/* ================================================= */}

                        <button
                          type="button"
                          onClick={() => {
                            if (isEnrolled || video.is_free_preview) {
                              setActiveLesson(index);
                            }
                          }}
                          disabled={!isEnrolled && !video.is_free_preview}
                          className={`flex-1 min-w-0 text-start ${
                            !isEnrolled && !video.is_free_preview
                              ? "cursor-not-allowed opacity-60"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-sm font-medium truncate ${
                                isActive ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {video.order}. {video.title}
                            </p>

                            {/* Lock non-preview videos for non-enrolled users */}
                            {!isEnrolled && !video.is_free_preview && (
                              <Lock
                                size={14}
                                className="text-muted-foreground shrink-0"
                              />
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            {/* Duration */}
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Play size={10} />
                              {formatDuration(video.duration)}
                            </p>

                            {/* Free preview badge */}
                            {video.is_free_preview && (
                              <span className="text-xs text-green-500 font-medium">
                                {lang === "en" ? "Preview" : "معاينة"}
                              </span>
                            )}

                            {/* Locked badge */}
                            {!isEnrolled && !video.is_free_preview && (
                              <span className="text-xs text-muted-foreground font-medium">
                                {lang === "en" ? "Locked" : "مقفل"}
                              </span>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ============================================================= */}
            {/* SIDEBAR FOOTER - NON ENROLLED                                   */}
            {/* ============================================================= */}

            {!isEnrolled && (
              <div className="border-t border-border p-4 shrink-0">
                <p className="text-xs text-muted-foreground mb-3">
                  {lang === "en"
                    ? "Enroll to unlock the full course."
                    : "سجل لفتح الدورة كاملة."}
                </p>

                <Button size="sm" className="w-full" asChild>
                  <Link to={`/courses/${course.id}/payment`} state={{ course }}>
                    Enroll Now
                  </Link>
                </Button>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
