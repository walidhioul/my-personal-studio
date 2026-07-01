import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as admin from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Check, Star } from "lucide-react";

const AdminFeedbacks = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "feedbacks"],
    queryFn: admin.listAdminFeedbacks,
    select: (r) => r.data,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "feedbacks"] });

  const approve = async (id: number) => {
    try { await admin.approveFeedback(id); toast.success("Approved"); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const remove = async (id: number) => {
    if (!confirm("Delete feedback?")) return;
    try { await admin.deleteFeedback(id); toast.success("Deleted"); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Feedbacks</h1>
        <p className="text-sm text-muted-foreground">Approve or remove student feedback</p>
      </div>

      {isLoading ? <p>Loading...</p> : (
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.user?.name || `#${f.user_id}`}</TableCell>
                  <TableCell>{f.course?.title || `#${f.course_id}`}</TableCell>
                  <TableCell><span className="inline-flex items-center gap-1"><Star size={14} className="fill-yellow-400 text-yellow-400" />{f.rating}</span></TableCell>
                  <TableCell className="max-w-[300px] truncate">{f.comment}</TableCell>
                  <TableCell>
                    <Badge variant={f.is_approved ? "default" : "secondary"}>
                      {f.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {!f.is_approved && (
                      <Button size="sm" variant="outline" onClick={() => approve(f.id)}><Check size={14} /></Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => remove(f.id)}><Trash2 size={14} /></Button>
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

export default AdminFeedbacks;
