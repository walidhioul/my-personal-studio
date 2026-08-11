import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminCoursesList } from "@/hooks/useAdminVideos";
import {
  adminResourceKeys,
  unwrapResource,
  useCourseResources,
  useCreateCourseResource,
  useDeleteCourseResource,
  useUpdateCourseResource,
} from "@/hooks/useAdminResources";
import {
  formatBytes,
  useBunnyResourceUpload,
  validatePdf,
} from "@/hooks/useBunnyResourceUpload";
import ResourceStatusBadge from "@/components/admin/resources/ResourceStatusBadge";
import ResourceUploadProgress from "@/components/admin/resources/ResourceUploadProgress";
import type { AdminResource } from "@/api/adminResources";

const emptyForm = { title: "", order: "1" };

const AdminResources = () => {
  const [courseId, setCourseId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminResource | null>(null);
  const [deleting, setDeleting] = useState<AdminResource | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pdf, setPdf] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const reselectRef = useRef<HTMLInputElement | null>(null);
  const reselectTarget = useRef<number | null>(null);

  const qc = useQueryClient();
  const { data: courses = [], isLoading: coursesLoading } = useAdminCoursesList();
  const {
    data: resources = [],
    isLoading,
    isError,
    error,
  } = useCourseResources(courseId);
  const createMutation = useCreateCourseResource();
  const updateMutation = useUpdateCourseResource();
  const deleteMutation = useDeleteCourseResource();
  const { getUpload, startUpload, cancel, rememberFile, hasFile } =
    useBunnyResourceUpload(() => {
      if (courseId)
        qc.invalidateQueries({ queryKey: adminResourceKeys.byCourse(courseId) });
    });

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === courseId) ?? null,
    [courses, courseId]
  );

  const resetForm = () => {
    setForm(emptyForm);
    setPdf(null);
    setErrors({});
  };

  const openCreate = () => {
    resetForm();
    setForm({ title: "", order: String(resources.length + 1) });
    setCreateOpen(true);
  };

  const handlePick = (file?: File) => {
    if (!file) return;
    const invalid = validatePdf(file);
    if (invalid) {
      setPdf(null);
      setErrors((prev) => ({ ...prev, file: invalid }));
      return;
    }
    // Held in browser memory only — nothing is uploaded on selection.
    setPdf(file);
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const submitCreate = async () => {
    const next: Record<string, string> = {};
    if (!courseId) next.course = "Select a course";
    if (form.title.trim().length < 2)
      next.title = "Title must be at least 2 characters";
    const order = Number(form.order);
    if (!Number.isFinite(order) || order < 0)
      next.order = "Order must be a positive number";
    if (!pdf) next.file = "Select a PDF file";
    setErrors(next);
    if (Object.keys(next).length > 0 || !courseId || !pdf) return;

    // Metadata only — the PDF stays in browser memory until the presigned PUT.
    const res = await createMutation.mutateAsync({
      courseId,
      data: { title: form.title.trim(), order },
    });

    const created = unwrapResource(res);
    if (!created?.id) return;

    setCreateOpen(false);
    const file = pdf;
    resetForm();
    rememberFile(created.id, file);
    void startUpload(courseId, created.id, file);
  };

  const submitEdit = async () => {
    if (!editing || !courseId) return;
    const order = Number(form.order);
    const next: Record<string, string> = {};
    if (form.title.trim().length < 2)
      next.title = "Title must be at least 2 characters";
    if (!Number.isFinite(order) || order < 0)
      next.order = "Order must be a positive number";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    await updateMutation.mutateAsync({
      courseId,
      resourceId: editing.id,
      data: { title: form.title.trim(), order },
    });
    setEditing(null);
    resetForm();
  };

  const confirmDelete = async () => {
    if (!deleting || !courseId) return;
    await deleteMutation.mutateAsync({ courseId, resourceId: deleting.id });
    setDeleting(null);
  };

  const triggerReselect = (resourceId: number) => {
    reselectTarget.current = resourceId;
    reselectRef.current?.click();
  };

  const handleReselect = (file?: File) => {
    const resourceId = reselectTarget.current;
    if (!file || !resourceId || !courseId) return;
    const invalid = validatePdf(file);
    if (invalid) return;
    rememberFile(resourceId, file);
    void startUpload(courseId, resourceId, file);
    reselectTarget.current = null;
    if (reselectRef.current) reselectRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Resource Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage the PDF resources attached to each course.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={courseId ? String(courseId) : ""}
            onValueChange={(v) => setCourseId(Number(v))}
            disabled={coursesLoading}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreate} disabled={!courseId} className="gap-2">
            <Plus size={16} /> Add Resource
          </Button>
        </div>
      </div>

      <input
        ref={reselectRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleReselect(e.target.files?.[0])}
      />

      {!courseId ? (
        <div className="border border-border rounded-lg p-12 text-center text-muted-foreground">
          Select a course to view its PDF resources.
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="border border-destructive/40 bg-destructive/5 rounded-lg p-6 text-sm text-destructive">
          {(error as Error)?.message || "Could not load resources"}
        </div>
      ) : resources.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center space-y-4">
          <FileText className="mx-auto text-muted-foreground" size={32} />
          <p className="text-muted-foreground">No PDF resources yet</p>
          <Button onClick={openCreate} className="gap-2">
            <Plus size={16} /> Add Resource
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Order</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => {
                const upload = getUpload(resource.id);
                const busy =
                  upload.phase === "starting" ||
                  upload.phase === "uploading" ||
                  upload.phase === "verifying";
                // Backend is the source of truth: file_size !== null => Ready.
                const backendStatus =
                  resource.file_size !== null && resource.file_size !== undefined
                    ? "ready"
                    : "pending_upload";
                const status =
                  upload.phase === "idle"
                    ? backendStatus
                    : upload.phase === "error"
                      ? "failed"
                      : upload.phase === "ready"
                        ? "ready"
                        : upload.phase;

                return (
                  <TableRow key={resource.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {resource.order ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <FileText size={16} className="text-primary shrink-0" />
                        {resource.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {resource.file_name || upload.fileName || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {resource.file_size
                        ? formatBytes(resource.file_size)
                        : upload.total
                          ? formatBytes(upload.total)
                          : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <ResourceStatusBadge status={status} />
                        <ResourceUploadProgress state={upload} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {busy ? (
                          upload.phase === "verifying" ? null : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => cancel(resource.id)}
                            >
                              <X size={14} /> Cancel
                            </Button>
                          )
                        ) : status === "failed" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() =>
                              hasFile(resource.id)
                                ? void startUpload(courseId, resource.id)
                                : triggerReselect(resource.id)
                            }
                          >
                            <Upload size={14} /> Retry Upload
                          </Button>
                        ) : status === "pending_upload" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() =>
                              hasFile(resource.id)
                                ? void startUpload(courseId, resource.id)
                                : triggerReselect(resource.id)
                            }
                          >
                            <Upload size={14} />
                            {hasFile(resource.id) ? "Upload" : "Select PDF"}
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          disabled={busy}
                          onClick={() => {
                            setEditing(resource);
                            setForm({
                              title: resource.title || "",
                              order: String(resource.order ?? 1),
                            });
                            setErrors({});
                          }}
                        >
                          <Pencil size={14} /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          disabled={busy}
                          onClick={() => setDeleting(resource)}
                        >
                          <Trash2 size={14} /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create */}
      <Dialog
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
            <DialogDescription>
              The resource record is created first, then the PDF uploads directly to
              storage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Course</Label>
              <Input value={selectedCourse?.title ?? ""} disabled />
              {errors.course && (
                <p className="text-xs text-destructive">{errors.course}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resource-title">Title</Label>
              <Input
                id="resource-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Present Perfect worksheet"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resource-order">Order</Label>
              <Input
                id="resource-order"
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
              />
              {errors.order && (
                <p className="text-xs text-destructive">{errors.order}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resource-file">PDF file</Label>
              <Input
                id="resource-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => handlePick(e.target.files?.[0])}
              />
              {pdf && (
                <p className="text-xs text-muted-foreground">
                  {pdf.name} · {formatBytes(pdf.size)}
                </p>
              )}
              {errors.file && (
                <p className="text-xs text-destructive">{errors.file}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitCreate}
              disabled={createMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending && (
                <Loader2 className="animate-spin" size={14} />
              )}
              Create & Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) {
            setEditing(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit resource</DialogTitle>
            <DialogDescription>
              Only the title and order change — the PDF is not re-uploaded.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-resource-title">Title</Label>
              <Input
                id="edit-resource-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-resource-order">Order</Label>
              <Input
                id="edit-resource-order"
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
              />
              {errors.order && (
                <p className="text-xs text-destructive">{errors.order}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={submitEdit}
              disabled={updateMutation.isPending}
              className="gap-2"
            >
              {updateMutation.isPending && (
                <Loader2 className="animate-spin" size={14} />
              )}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this resource?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” will be removed permanently. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminResources;
