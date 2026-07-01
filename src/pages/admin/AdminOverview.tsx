import { useQuery } from "@tanstack/react-query";
import * as admin from "@/api/admin";
import { Users, BookOpen, GraduationCap, MessageSquare } from "lucide-react";

const Stat = ({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) => (
  <div className="border rounded-lg bg-card p-6 flex items-center gap-4">
    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const AdminOverview = () => {
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: admin.listUsers, select: (r) => r.data });
  const courses = useQuery({ queryKey: ["admin", "courses"], queryFn: admin.listAdminCourses, select: (r) => r.data });
  const enrollments = useQuery({ queryKey: ["admin", "enrollments", "all"], queryFn: admin.listEnrollments, select: (r) => r.data });
  const feedbacks = useQuery({ queryKey: ["admin", "feedbacks"], queryFn: admin.listAdminFeedbacks, select: (r) => r.data });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Overview</h1>
      <p className="text-sm text-muted-foreground mb-6">Quick view of platform activity</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Users" value={users.data?.length ?? "—"} icon={Users} />
        <Stat label="Courses" value={courses.data?.length ?? "—"} icon={BookOpen} />
        <Stat label="Enrollments" value={enrollments.data?.length ?? "—"} icon={GraduationCap} />
        <Stat label="Feedbacks" value={feedbacks.data?.length ?? "—"} icon={MessageSquare} />
      </div>
    </div>
  );
};

export default AdminOverview;
