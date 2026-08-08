import { useMemo, useState } from "react";
import { FileText, Loader2, Pencil, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminCoursesList } from "@/hooks/useAdminVideos";
import {
  useCourseFiles,
  useCreateCourseFile,
  useUpdateCourseFile,
  unwrapFile,
} from "@/hooks/useAdminFiles";
import {
  formatBytes,
  useBunnyFileUpload,
  validatePdf,
} from "@/hooks/useBunnyFileUpload";
import FileStatusBadge from "@/components/admin/files/FileStatusBadge";
import FileUploadProgress from "@/components/admin/files/FileUploadProgress";
import type { AdminFile } from "@/api/adminFiles";

const emptyForm = { title: "", description: "" };

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "—";

const AdminFiles = () => {
  const [courseId, setCourseId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminFile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pdf, setPdf] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: courses = [], isLoading: coursesLoading } = useAdminCoursesList();
  const {
    data: files = [],
    isLoading,
    isError,
    error,
  } = useCourseFiles(courseId);
  const createMutation = useCreateCourseFile();
  const updateMutation = useUpdateCourseFile();
  const { getUpload, startUpload, cancel, rememberFile, hasFile } =
    useBunnyFileUpload();

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
    // Kept in browser memory only — no upload happens on selection.
    setPdf(file);
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const submitCreate = async () => {
    const next: Record<string, string> = {};
    if (!courseId) next.course = "Select a course";
    if (form.title.trim().length < 2)
      next.title = "Title must be at least 2 characters";
    if (!pdf) next.file = "Select a PDF file";
    setErrors(next);
    if (Object.keys(next).length > 0 || !courseId || !pdf) return;

    const res = await createMutation.mutateAsync({
      courseId,
      data: {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        file_name: pdf.name,
        file_size: pdf.size,
      },
    });

    const created = unwrapFile(res);
    if (!created?.id) return;

    setCreateOpen(false);
    const file = pdf;
    resetForm();
    rememberFile(created.id, file);
    void startUpload(courseId, created.id, file);
  };

  const submitEdit = async () => {
    if (!editing || !courseId) return;
    if (form.title.trim().length < 2) {
      setErrors({ title: "Title must be at least 2 characters" });
      return;
    }
    await updateMutation.mutateAsync({
      courseId,
      fileId: editing.id,
      data: {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
      },
    });
    setEditing(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">File Management</h1>
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
            <Plus size={16} /> Add PDF
          </Button>
        </div>
      </div>

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
          {(error as Error)?.message || "Could not load PDF resources"}
        </div>
      ) : files.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center space-y-4">
          <FileText className="mx-auto text-muted-foreground" size={32} />
          <p className="text-muted-foreground">No PDF resources yet</p>
          <Button onClick={openCreate} className="gap-2">
            <Plus size={16} /> Add PDF
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PDF</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => {
                const upload = getUpload(file.id);
                const busy =
                  upload.phase === "starting" || upload.phase === "uploading";
                const status =
                  upload.phase === "completed"
                    ? "verifying"
                    : busy
                      ? "uploading"
                      : upload.phase === "error"
                        ? "failed"
                        : file.status;
                return (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <FileText size={16} className="text-primary shrink-0" />
                        {file.title}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px] text-sm text-muted-foreground truncate">
                      {file.description || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {file.file_name || upload.fileName || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {file.file_size
                        ? formatBytes(file.file_size)
                        : upload.total
                          ? formatBytes(upload.total)
                          : "—"}
                    </TableCell>
                    <TableCell>
                      {upload.phase === "idle" ? (
                        <FileStatusBadge status={status} />
                      ) : (
                        <div className="space-y-1">
                          <FileStatusBadge status={status} />
                          <FileUploadProgress state={upload} />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(file.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {busy ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => cancel(file.id)}
                          >
                            <X size={14} /> Cancel
                          </Button>
                        ) : upload.phase === "error" ||
                          (file.status || "").toString().toLowerCase() ===
                            "failed" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() =>
                              void startUpload(file.course_id ?? courseId, file.id)
                            }
                            disabled={!hasFile(file.id)}
                            title={
                              hasFile(file.id)
                                ? "Retry Upload"
                                : "Re-add the PDF to retry after a refresh"
                            }
                          >
                            <Upload size={14} /> Retry Upload
                          </Button>
                        ) : (file.status || "").toString().toLowerCase() ===
                          "pending_upload" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() =>
                              void startUpload(file.course_id ?? courseId, file.id)
                            }
                            disabled={!hasFile(file.id)}
                            title={
                              hasFile(file.id)
                                ? "Upload PDF"
                                : "Re-add the PDF to upload after a refresh"
                            }
                          >
                            <Upload size={14} /> Upload
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          disabled={busy}
                          onClick={() => {
                            setEditing(file);
                            setForm({
                              title: file.title || "",
                              description: file.description || "",
                            });
                            setErrors({});
                          }}
                        >
                          <Pencil size={14} /> Edit
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
            <DialogTitle>Add PDF</DialogTitle>
            <DialogDescription>
              Create the PDF resource, then it uploads directly to storage.
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
              <Label htmlFor="pdf-title">Title</Label>
              <Input
                id="pdf-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Present Perfect"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pdf-description">Description</Label>
              <Textarea
                id="pdf-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Grammar exercises"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pdf-file">PDF file</Label>
              <Input
                id="pdf-file"
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

      {/* Edit metadata */}
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
            <DialogTitle>Edit PDF details</DialogTitle>
            <DialogDescription>
              Only the title and description change — the PDF is not re-uploaded.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
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
    </div>
  );
};

export default AdminFiles;
