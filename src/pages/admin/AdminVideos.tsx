import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminVideos,
  useAdminCoursesList,
  useCreateVideo,
} from "@/hooks/useAdminVideos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Upload, Loader2, RotateCcw, Video as VideoIcon } from "lucide-react";
import { useBunnyVideoUpload } from "@/hooks/useBunnyVideoUpload";
import { useVideoStatusPolling } from "@/hooks/useVideoStatusPolling";
import VideoUploadProgress from "@/components/admin/videos/VideoUploadProgress";
import VideoStatusBadge from "@/components/admin/videos/VideoStatusBadge";


const emptyForm = {
  course_id: "",
  title: "",
  description: "",
  order: "1",
  is_free_preview: false,
};

const statusBadge = (status?: string | null) => {
  const value = (status || "pending_upload").toLowerCase();
  if (value.includes("ready") || value.includes("published"))
    return <Badge className="bg-primary text-primary-foreground">Ready</Badge>;
  if (value.includes("processing"))
    return <Badge variant="secondary">Processing</Badge>;
  return <Badge variant="outline">Pending Upload</Badge>;
};

const isPendingUpload = (status?: string | null) => {
  const value = (status || "pending_upload").toLowerCase();
  return !value.includes("ready") && !value.includes("published") && !value.includes("processing");
};

const AdminVideos = () => {
  const [courseFilter, setCourseFilter] = useState<"all" | number>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: courses = [], isLoading: coursesLoading } = useAdminCoursesList();
  const { data: videos = [], isLoading, isError, error } = useAdminVideos(courseFilter);
  const createMutation = useCreateVideo();
  const { inputRef, selectFile, handleFileSelected, retry, uploads, getUpload } =
    useBunnyVideoUpload();
  const { getStatus, startPolling, reset: resetStatus } = useVideoStatusPolling();
  const qc = useQueryClient();

  // Start polling as soon as an upload reaches 100% (one timer per video).
  useEffect(() => {
    Object.entries(uploads).forEach(([id, state]) => {
      if (state.phase !== "completed") return;
      const videoId = Number(id);
      const video = videos.find((v) => v.id === videoId);
      if (!video) return;
      startPolling(video.course_id, videoId, "processing");
    });
  }, [uploads, videos, startPolling]);

  // Refresh the cached list once a video finishes processing.
  useEffect(() => {
    if (videos.some((v) => getStatus(v.id)?.status === "ready")) {
      qc.invalidateQueries({ queryKey: ["admin", "videos"] });
    }
  }, [videos, getStatus, qc]);



  const courseTitle = useMemo(() => {
    const map = new Map<number, string>();
    courses.forEach((c) => map.set(c.id, c.title));
    return map;
  }, [courses]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.course_id) next.course_id = "Select a course";
    if (form.title.trim().length < 2) next.title = "Title must be at least 2 characters";
    const order = Number(form.order);
    if (!Number.isInteger(order) || order < 1) next.order = "Order must be a positive number";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    createMutation.mutate(
      {
        courseId: Number(form.course_id),
        data: {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          order: Number(form.order),
          is_free_preview: form.is_free_preview,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm(emptyForm);
          setErrors({});
        },
      }
    );
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Video Management</h1>
          <p className="text-sm text-muted-foreground">
            Create course videos and track their upload status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={courseFilter === "all" ? "all" : String(courseFilter)}
            onValueChange={(v) => setCourseFilter(v === "all" ? "all" : Number(v))}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus size={16} /> Create Video
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="border rounded-lg bg-card p-8 text-center text-sm text-destructive">
          {(error as Error)?.message || "Failed to load videos."}
        </div>
      ) : isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Free Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    <VideoIcon className="mx-auto mb-2 opacity-50" size={24} />
                    No videos yet. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                videos.map((v) => {
                  const upload = getUpload(v.id);
                  const busy = upload.phase === "starting" || upload.phase === "uploading";
                  const polled = getStatus(v.id);
                  const failedProcessing = polled?.status === "failed";
                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {v.course?.title || courseTitle.get(v.course_id) || `#${v.course_id}`}
                      </TableCell>
                      <TableCell>{v.order ?? "—"}</TableCell>
                      <TableCell>
                        {v.is_free_preview ? (
                          <Badge variant="secondary">Free</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {polled ? (
                          <VideoStatusBadge
                            status={polled.status}
                            reconnecting={polled.reconnecting}
                          />
                        ) : busy || upload.phase === "error" ? (
                          <VideoUploadProgress state={upload} />
                        ) : (
                          statusBadge(v.status)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {upload.phase === "error" || failedProcessing ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                              if (failedProcessing) {
                                resetStatus(v.id);
                                selectFile(v.course_id, v.id);
                              } else {
                                retry(v.course_id, v.id);
                              }
                            }}
                          >
                            <RotateCcw size={14} /> Retry Upload
                          </Button>
                        ) : polled ? null : upload.phase === "completed" ? null : (
                          isPendingUpload(v.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              disabled={busy}
                              onClick={() => selectFile(v.course_id, v.id)}
                            >
                              {busy ? (
                                <Loader2 className="animate-spin" size={14} />
                              ) : (
                                <Upload size={14} />
                              )}
                              {busy ? "Uploading..." : "Upload Video"}
                            </Button>
                          )
                        )}
                      </TableCell>
                    </TableRow>

                  );
                })

              )}
            </TableBody>
          </Table>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileSelected(e.target.files?.[0])}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Video</DialogTitle>
            <DialogDescription>
              A placeholder is created first — you can upload the file afterwards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Course</Label>
              <Select
                value={form.course_id}
                onValueChange={(v) => setForm({ ...form, course_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={coursesLoading ? "Loading..." : "Select a course"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.course_id && (
                <p className="text-xs text-destructive">{errors.course_id}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                placeholder="Lesson 1"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Present Perfect"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Order</Label>
              <Input
                type="number"
                min={1}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
              />
              {errors.order && <p className="text-xs text-destructive">{errors.order}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is_free_preview"
                checked={form.is_free_preview}
                onCheckedChange={(c) => setForm({ ...form, is_free_preview: c === true })}
              />
              <Label htmlFor="is_free_preview" className="cursor-pointer">
                Free Preview
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="animate-spin" size={14} />}
              Create Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVideos;
