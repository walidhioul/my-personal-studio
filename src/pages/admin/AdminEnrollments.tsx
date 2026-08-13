import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as admin from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const AdminEnrollments = () => {
  const qc = useQueryClient();
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");

  const { data: courses } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: admin.listAdminCourses,
    select: (r) => r.data,
  });

  const { data: users } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: admin.listUsers,
    select: (r) => r.data,
  });

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["admin", "enrollments", courseFilter],
    queryFn: () =>
      courseFilter === "all"
        ? admin.listEnrollments()
        : admin.listEnrollmentsByCourse(+courseFilter),
    select: (r) => {
      const d = r.data as any;
      // Handles both a flat array response and a Laravel paginator
      // ({ data: { data: [...], total, current_page, ... } })
      return Array.isArray(d) ? d : d?.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: admin.createEnrollment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "enrollments"] });
      toast.success("Enrollment created");
      setOpen(false);
      setSelectedUser("");
      setSelectedCourse("");
      setPaymentStatus("pending");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCreate = () => {
    if (!selectedUser || !selectedCourse) {
      toast.error("Select a student and a course");
      return;
    }
    createMutation.mutate({
      user_id: +selectedUser,
      course_id: +selectedCourse,
      payment_status: paymentStatus as "pending" | "paid" | "failed",
    });
  };

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
          <p className="text-sm text-muted-foreground">
            View all enrollments or filter by course
            {enrollments ? ` — ${enrollments.length} total` : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Filter by course" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {courses?.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Create Enrollment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Enrollment</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Student</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
                    <SelectContent>
                      {users?.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Course</label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                    <SelectContent>
                      {courses?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Payment Status</label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
                <TableHead>Payment</TableHead>
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
                  <TableCell className="capitalize">{e.payment_status || "—"}</TableCell>
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