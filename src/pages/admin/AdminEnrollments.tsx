import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as admin from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const AdminEnrollments = () => {
  const qc = useQueryClient();
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const { data: courses } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: admin.listAdminCourses,
    select: (r) => r.data,
  });

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["admin", "enrollments", courseFilter],
    queryFn: () =>
      courseFilter === "all"
        ? admin.listEnrollments()
        : admin.listEnrollmentsByCourse(+courseFilter),
    select: (r) => r.data,
  });

  const remove = async (id: number) => {
    if (!confirm("Remove this enrollment?")) return;
    try {
      await admin.deleteEnrollment(id);
      qc.invalidateQueries({ queryKey: ["admin", "enrollments"] });
      toast.success("Enrollment removed");
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Enrollments</h1>
          <p className="text-sm text-muted-foreground">View all enrollments or filter by course</p>
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Filter by course" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <p>Loading...</p> : (
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments?.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.id}</TableCell>
                  <TableCell className="font-medium">{e.user?.name || `#${e.user_id}`}</TableCell>
                  <TableCell>{e.user?.email}</TableCell>
                  <TableCell>{e.course?.title || `#${e.course_id}`}</TableCell>
                  <TableCell>{e.created_at ? new Date(e.created_at).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="destructive" onClick={() => remove(e.id)}><Trash2 size={14} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminEnrollments;
