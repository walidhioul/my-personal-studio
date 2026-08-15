import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { useDashboard } from "@/hooks/useDashboard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { submitFeedback } from "@/api/feedback";

import {
  BookOpen, MessageSquare, User, BarChart3, Award, Star, Send, LogOut, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const isRtl = lang === "ar";
  const { data: dashboard, isLoading } = useDashboard();

  const [feedbackCourse, setFeedbackCourse] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      toast({ title: "Error", description: "Logout failed", variant: "destructive" });
    }
  };

 const handleFeedbackSubmit = async () => {
  if (!feedbackComment.trim() || !feedbackCourse) return;
  setSubmitting(true);
  try {
    await submitFeedback(feedbackCourse, {
      rating: feedbackRating,
      comment: feedbackComment,
    });
    toast({
      title: isRtl ? "تم الإرسال" : "Submitted!",
      description: isRtl ? "شكراً لملاحظاتك" : "Thanks for your feedback",
    });
    setFeedbackComment("");
    setFeedbackRating(5);
    setFeedbackCourse("");
  } catch {
    toast({
      title: "Error",
      description: isRtl ? "فشل الإرسال" : "Failed to submit feedback",
      variant: "destructive",
    });
  } finally {
    setSubmitting(false);
  }
};

  const enrolledCourses = dashboard?.courses || [];
  const overview = dashboard?.overview || {
    profile: { name: user?.name || "", email: user?.email || "" },
    total_courses: 0,
    total_certificates: 0,
    completed_enrollments: 0,
    pending_enrollments: 0,
    failed_enrollments: 0,
  };

  const displayName = overview.profile?.name || user?.name || "";
  const completedCoursesCount = enrolledCourses.filter(
    (c) => c.payment_status === "completed"
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRtl ? `مرحباً، ${displayName}` : `Welcome, ${displayName}`}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRtl ? "تابع رحلتك التعليمية" : "Continue your learning journey"}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut size={16} />
            {isRtl ? "تسجيل الخروج" : "Logout"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: BookOpen, label: isRtl ? "الدورات المسجلة" : "Enrolled Courses", value: completedCoursesCount, color: "text-blue-500" },
                { icon: Award, label: isRtl ? "المكتملة" : "Completed", value: overview.completed_enrollments, color: "text-green-500" },
                { icon: BarChart3, label: isRtl ? "قيد الانتظار" : "Pending", value: overview.pending_enrollments, color: "text-orange-500" },
                { icon: Award, label: isRtl ? "الشهادات" : "Certificates", value: overview.total_certificates, color: "text-purple-500" },
              ].map((stat) => (
                <Card key={stat.label} className="border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="courses" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="courses" className="gap-2">
                  <BookOpen size={16} />
                  <span className="hidden sm:inline">{isRtl ? "دوراتي" : "My Courses"}</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="gap-2">
                  <MessageSquare size={16} />
                  <span className="hidden sm:inline">{isRtl ? "التقييمات" : "Feedback"}</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="gap-2">
                  <User size={16} />
                  <span className="hidden sm:inline">{isRtl ? "الملف الشخصي" : "Profile"}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses">
                <div className="grid gap-4">
                  {enrolledCourses.filter((c) => c.payment_status === "completed").length === 0 ? (
                    <Card className="border-border">
                      <CardContent className="p-8 text-center">
                        <BookOpen className="mx-auto mb-4 text-muted-foreground" size={48} />
                        <p className="text-muted-foreground">
                          {isRtl ? "لم تسجل في أي دورة بعد" : "You haven't enrolled in any courses yet"}
                        </p>
                        <Button className="mt-4" onClick={() => navigate("/courses")}>
                          {isRtl ? "تصفح الدورات" : "Browse Courses"}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    enrolledCourses
                      .filter((course) => course.payment_status === "completed")
                      .map((course) => (
                      <Card key={course.course_id} className="border-border">
                        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{course.title}</h3>
                              <Badge className="bg-green-500/10 text-green-600">
                                {course.payment_status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {isRtl ? "تاريخ التسجيل: " : "Enrolled: "}
                              {new Date(course.enrolled_at).toLocaleDateString(isRtl ? "ar" : "en-US")}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/courses/${course.course_id}/learn`)}
                          >
                            {isRtl ? "متابعة" : "Continue"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="feedback">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">{isRtl ? "أترك تقييمك" : "Leave Your Feedback"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">{isRtl ? "الدورة" : "Course"}</label>
                      <select value={feedbackCourse} onChange={(e) => setFeedbackCourse(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">{isRtl ? "اختر دورة" : "Select a course"}</option>
                        {enrolledCourses
                          .filter((c) => c.payment_status === "completed")
                          .map((c) => (
                            <option key={c.course_id} value={c.course_id}>{c.title}</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">{isRtl ? "التقييم" : "Rating"}</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setFeedbackRating(star)} className="transition-colors">
                            <Star size={24} className={star <= feedbackRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">{isRtl ? "تعليقك" : "Your Comment"}</label>
                      <Textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} placeholder={isRtl ? "اكتب تعليقك هنا..." : "Write your feedback here..."} rows={4} />
                    </div>
                    <Button onClick={handleFeedbackSubmit} disabled={submitting || !feedbackComment.trim() || !feedbackCourse} className="gap-2">
                      <Send size={16} />
                      {submitting ? (isRtl ? "جاري الإرسال..." : "Submitting...") : (isRtl ? "إرسال التقييم" : "Submit Feedback")}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">{isRtl ? "إعدادات الملف الشخصي" : "Profile Settings"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-w-md">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">{isRtl ? "الاسم" : "Name"}</label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">{isRtl ? "البريد الإلكتروني" : "Email"}</label>
                      <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} type="email" />
                    </div>
                    <Button onClick={() => toast({ title: isRtl ? "قريباً" : "Coming soon", description: isRtl ? "سيتم تفعيل هذه الميزة قريباً" : "Profile update will be available soon" })}>
                      {isRtl ? "حفظ التعديلات" : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
