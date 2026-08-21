import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAdminVideos,
  useAdminCoursesList,
  useCreateVideo,
  useUpdateVideo,
  useDeleteVideo,
  useReorderVideos,
} from "@/hooks/useAdminVideos";

import {
  AdminVideo,
} from "@/api/admin";

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

import {
  Plus,
  Upload,
  Loader2,
  RotateCcw,
  Video as VideoIcon,
  Pencil,
  Trash2,
  ArrowUpDown,
} from "lucide-react";

import { useBunnyVideoUpload } from "@/hooks/useBunnyVideoUpload";

import { useVideoStatusPolling } from "@/hooks/useVideoStatusPolling";

import VideoUploadProgress from "@/components/admin/videos/VideoUploadProgress";

import VideoStatusBadge from "@/components/admin/videos/VideoStatusBadge";


/* =========================================================
   FORM
========================================================= */

const emptyForm = {
  course_id: "",
  title: "",
  description: "",
  order: "1",
  is_free_preview: false,
};


/* =========================================================
   STATUS
========================================================= */

const statusBadge = (
  status?: string | null
) => {

  const value =
    (
      status ||
      "pending_upload"
    ).toLowerCase();


  if (
    value.includes("ready") ||
    value.includes("published")
  ) {
    return (
      <Badge className="bg-primary text-primary-foreground">
        Ready
      </Badge>
    );
  }


  if (
    value.includes("processing")
  ) {
    return (
      <Badge variant="secondary">
        Processing
      </Badge>
    );
  }


  if (
    value.includes("failed")
  ) {
    return (
      <Badge variant="destructive">
        Failed
      </Badge>
    );
  }


  return (
    <Badge variant="outline">
      Pending Upload
    </Badge>
  );
};


const isPendingUpload = (
  status?: string | null
) => {

  const value =
    (
      status ||
      "pending_upload"
    ).toLowerCase();


  return (
    !value.includes("ready") &&
    !value.includes("published") &&
    !value.includes("processing")
  );
};


/* =========================================================
   PAGE
========================================================= */

const AdminVideos = () => {

  /* -------------------------------------------------------
     FILTER
  ------------------------------------------------------- */

  const [
    courseFilter,
    setCourseFilter,
  ] = useState<
    "all" | number
  >("all");


  /* -------------------------------------------------------
     CREATE / EDIT DIALOG
  ------------------------------------------------------- */

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);


  const [
    formMode,
    setFormMode,
  ] = useState<
    "create" | "edit"
  >("create");


  const [
    selectedVideo,
    setSelectedVideo,
  ] = useState<
    AdminVideo | null
  >(null);


  const [
    form,
    setForm,
  ] = useState(
    emptyForm
  );


  const [
    errors,
    setErrors,
  ] = useState<
    Record<string, string>
  >({});


  /* -------------------------------------------------------
     DELETE
  ------------------------------------------------------- */

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);


  /* -------------------------------------------------------
     REORDER
  ------------------------------------------------------- */

  const [
    reorderOpen,
    setReorderOpen,
  ] = useState(false);


  const [
    reorderValues,
    setReorderValues,
  ] = useState<
    Record<number, string>
  >({});


  /* -------------------------------------------------------
     DATA
  ------------------------------------------------------- */

  const {
    data: courses = [],
    isLoading:
      coursesLoading,
  } = useAdminCoursesList();


  const {
    data: videos = [],
    isLoading,
    isError,
    error,
  } = useAdminVideos(
    courseFilter
  );


  /* -------------------------------------------------------
     MUTATIONS
  ------------------------------------------------------- */

  const createMutation =
    useCreateVideo();


  const updateMutation =
    useUpdateVideo();


  const deleteMutation =
    useDeleteVideo();


  const reorderMutation =
    useReorderVideos();


  /* -------------------------------------------------------
     BUNNY
  ------------------------------------------------------- */

  const {
    inputRef,
    selectFile,
    handleFileSelected,
    retry,
    uploads,
    getUpload,
  } = useBunnyVideoUpload();


  const {
    getStatus,
    startPolling,
    reset: resetStatus,
  } =
    useVideoStatusPolling();


  /* =======================================================
     POLLING
  ======================================================= */

  useEffect(() => {

    Object.entries(
      uploads
    ).forEach(
      ([id, state]) => {

        if (
          state.phase !==
          "completed"
        ) {
          return;
        }


        const videoId =
          Number(id);


        const video =
          videos.find(
            (v) =>
              v.id === videoId
          );


        if (!video) {
          return;
        }


        startPolling(
          video.course_id,
          videoId,
          "processing"
        );
      }
    );

  }, [
    uploads,
    videos,
    startPolling,
  ]);


  useEffect(() => {

    videos.forEach(
      (v) => {

        if (
          (
            v.status ||
            ""
          ).toLowerCase() ===
          "processing"
        ) {

          startPolling(
            v.course_id,
            v.id,
            "processing"
          );

        }

      }
    );

  }, [
    videos,
    startPolling,
  ]);


  /* =======================================================
     COURSE TITLES
  ======================================================= */

  const courseTitle =
    useMemo(() => {

      const map =
        new Map<
          number,
          string
        >();


      courses.forEach(
        (c) =>
          map.set(
            c.id,
            c.title
          )
      );


      return map;

    }, [courses]);


  /* =======================================================
     CREATE
  ======================================================= */

  const openCreate = () => {

    setFormMode(
      "create"
    );

    setSelectedVideo(
      null
    );

    setForm(
      emptyForm
    );

    setErrors({});

    setFormOpen(true);
  };


  /* =======================================================
     EDIT
  ======================================================= */

  const openEdit = (
    video: AdminVideo
  ) => {

    setFormMode(
      "edit"
    );

    setSelectedVideo(
      video
    );


    setForm({
      course_id:
        String(
          video.course_id
        ),

      title:
        video.title || "",

      description:
        video.description ||
        "",

      order:
        String(
          video.order ?? 1
        ),

      is_free_preview:
        Boolean(
          video.is_free_preview
        ),
    });


    setErrors({});

    setFormOpen(true);
  };


  /* =======================================================
     VALIDATE
  ======================================================= */

  const validate = () => {

    const next: Record<
      string,
      string
    > = {};


    if (
      !form.course_id
    ) {
      next.course_id =
        "Select a course";
    }


    if (
      form.title.trim()
        .length < 2
    ) {
      next.title =
        "Title must be at least 2 characters";
    }


    const order =
      Number(
        form.order
      );


    if (
      !Number.isInteger(
        order
      ) ||
      order < 1
    ) {
      next.order =
        "Order must be a positive number";
    }


    setErrors(next);


    return (
      Object.keys(next)
        .length === 0
    );
  };


  /* =======================================================
     SUBMIT CREATE / EDIT
  ======================================================= */

  const submit = () => {

    if (!validate()) {
      return;
    }


    const data = {
      title:
        form.title.trim(),

      description:
        form.description.trim() ||
        undefined,

      order:
        Number(
          form.order
        ),

      is_free_preview:
        form.is_free_preview,
    };


    /* CREATE */

    if (
      formMode ===
      "create"
    ) {

      createMutation.mutate(
        {
          courseId:
            Number(
              form.course_id
            ),

          data,
        },

        {
          onSuccess: () => {

            setFormOpen(
              false
            );

            setForm(
              emptyForm
            );

            setErrors({});
          },
        }
      );


      return;
    }


    /* EDIT */

    if (
      !selectedVideo
    ) {
      return;
    }


    updateMutation.mutate(
      {
        courseId:
          selectedVideo.course_id,

        videoId:
          selectedVideo.id,

        data,
      },

      {
        onSuccess: () => {

          setFormOpen(
            false
          );

          setSelectedVideo(
            null
          );

          setForm(
            emptyForm
          );
        },
      }
    );
  };


  /* =======================================================
     DELETE
  ======================================================= */

  const confirmDelete = () => {

    if (
      !selectedVideo
    ) {
      return;
    }


    deleteMutation.mutate(
      {
        courseId:
          selectedVideo.course_id,

        videoId:
          selectedVideo.id,
      },

      {
        onSuccess: () => {

          setDeleteOpen(
            false
          );

          setSelectedVideo(
            null
          );
        },
      }
    );
  };


  /* =======================================================
     REORDER OPEN
  ======================================================= */

  const openReorder = () => {

    if (
      courseFilter ===
      "all"
    ) {
      return;
    }


    const values:
      Record<
        number,
        string
      > = {};


    videos.forEach(
      (video) => {

        values[video.id] =
          String(
            video.order ?? 1
          );

      }
    );


    setReorderValues(
      values
    );

    setReorderOpen(
      true
    );
  };


  /* =======================================================
     REORDER
  ======================================================= */

  const submitReorder =
    () => {

      if (
        courseFilter ===
        "all"
      ) {
        return;
      }


      const items =
        videos.map(
          (video) => ({
            id:
              video.id,

            order:
              Number(
                reorderValues[
                  video.id
                ]
              ),
          })
        );


      const invalid =
        items.some(
          (item) =>
            !Number.isInteger(
              item.order
            ) ||
            item.order < 1
        );


      if (invalid) {
        return;
      }


      const orders =
        items.map(
          (item) =>
            item.order
        );


      if (
        new Set(
          orders
        ).size !==
        orders.length
      ) {
        return;
      }


      reorderMutation.mutate(
        {
          courseId:
            courseFilter,

          items,
        },

        {
          onSuccess: () => {
            setReorderOpen(
              false
            );
          },
        }
      );
    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div>

      {/* HEADER */}

      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">

        <div>

          <h1 className="text-2xl font-bold">
            Video Management
          </h1>

          <p className="text-sm text-muted-foreground">
            Create course videos and track their upload status
          </p>

        </div>


        <div className="flex items-center gap-2">

          {/* REORDER */}

          <Button
            variant="outline"
            disabled={
              courseFilter ===
                "all" ||
              videos.length < 2
            }
            onClick={
              openReorder
            }
            className="gap-2"
          >

            <ArrowUpDown
              size={16}
            />

            Reorder

          </Button>


          {/* CREATE */}

          <Button
            onClick={
              openCreate
            }
            className="gap-2"
          >

            <Plus
              size={16}
            />

            Create Video

          </Button>

        </div>

      </div>


      {/* TABLE */}

      {isError ? (

        <div className="border rounded-lg bg-card p-8 text-center text-sm text-destructive">

          {(error as Error)
            ?.message ||
            "Failed to load videos."}

        </div>

      ) : isLoading ? (

        <Skeleton className="h-64 w-full" />

      ) : (

        <div className="border rounded-lg bg-card">

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>
                  Title
                </TableHead>

                <TableHead>
                  Course
                </TableHead>

                <TableHead>
                  Order
                </TableHead>

                <TableHead>
                  Free Preview
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>

              </TableRow>

            </TableHeader>


            <TableBody>

              {videos.length ===
              0 ? (

                <TableRow>

                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >

                    <VideoIcon
                      className="mx-auto mb-2 opacity-50"
                      size={24}
                    />

                    No videos yet.
                    Create one to get started.

                  </TableCell>

                </TableRow>

              ) : (

                videos.map(
                  (v) => {

                    const upload =
                      getUpload(
                        v.id
                      );


                    const busy =
                      upload.phase ===
                        "starting" ||
                      upload.phase ===
                        "uploading";


                    const polled =
                      getStatus(
                        v.id
                      );


                    const failedProcessing =
                      polled?.status ===
                      "failed";


                    return (

                      <TableRow
                        key={v.id}
                      >

                        <TableCell className="font-medium">
                          {v.title}
                        </TableCell>


                        <TableCell className="text-muted-foreground">

                          {v.course
                            ?.title ||
                            courseTitle.get(
                              v.course_id
                            ) ||
                            `#${v.course_id}`}

                        </TableCell>


                        <TableCell>
                          {v.order ??
                            "—"}
                        </TableCell>


                        <TableCell>

                          {v.is_free_preview ? (

                            <Badge variant="secondary">
                              Free
                            </Badge>

                          ) : (

                            <span className="text-muted-foreground">
                              —
                            </span>

                          )}

                        </TableCell>


                        <TableCell>

                          {polled ? (

                            <VideoStatusBadge
                              status={
                                polled.status
                              }
                              reconnecting={
                                polled.reconnecting
                              }
                            />

                          ) : busy ||
                            upload.phase ===
                              "error" ? (

                            <VideoUploadProgress
                              state={
                                upload
                              }
                            />

                          ) : (

                            statusBadge(
                              v.status
                            )

                          )}

                        </TableCell>


                        <TableCell>

                          <div className="flex justify-end items-center gap-2">

                            {/* RETRY */}

                            {upload.phase ===
                              "error" ||
                            failedProcessing ? (

                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={() => {

                                  if (
                                    failedProcessing
                                  ) {

                                    resetStatus(
                                      v.id
                                    );

                                    selectFile(
                                      v.course_id,
                                      v.id
                                    );

                                  } else {

                                    retry(
                                      v.course_id,
                                      v.id
                                    );

                                  }

                                }}
                              >

                                <RotateCcw
                                  size={14}
                                />

                                Retry Upload

                              </Button>

                            ) : polled ? null : upload.phase ===
                              "completed" ? null : (

                              isPendingUpload(
                                v.status
                              ) && (

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                  disabled={
                                    busy
                                  }
                                  onClick={() =>
                                    selectFile(
                                      v.course_id,
                                      v.id
                                    )
                                  }
                                >

                                  {busy ? (

                                    <Loader2
                                      className="animate-spin"
                                      size={14}
                                    />

                                  ) : (

                                    <Upload
                                      size={14}
                                    />

                                  )}

                                  {busy
                                    ? "Uploading..."
                                    : "Upload Video"}

                                </Button>

                              )

                            )}


                            {/* EDIT */}

                            <Button
                              size="icon"
                              variant="ghost"
                              title="Edit video"
                              onClick={() =>
                                openEdit(
                                  v
                                )
                              }
                            >

                              <Pencil
                                size={16}
                              />

                            </Button>


                            {/* DELETE */}

                            <Button
                              size="icon"
                              variant="ghost"
                              title="Delete video"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {

                                setSelectedVideo(
                                  v
                                );

                                setDeleteOpen(
                                  true
                                );

                              }}
                            >

                              <Trash2
                                size={16}
                              />

                            </Button>

                          </div>

                        </TableCell>

                      </TableRow>

                    );

                  }
                )

              )}

            </TableBody>

          </Table>

        </div>

      )}


      {/* HIDDEN FILE INPUT */}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) =>
          handleFileSelected(
            e.target.files?.[0]
          )
        }
      />


      {/* ===================================================
          CREATE / EDIT DIALOG
      =================================================== */}

      <Dialog
        open={formOpen}
        onOpenChange={
          setFormOpen
        }
      >

        <DialogContent>

          <DialogHeader>

            <DialogTitle>

              {formMode ===
              "create"
                ? "Create Video"
                : "Edit Video"}

            </DialogTitle>

            <DialogDescription>

              {formMode ===
              "create"
                ? "A placeholder is created first — you can upload the file afterwards."
                : "Update the video information."}

            </DialogDescription>

          </DialogHeader>


          <div className="space-y-4">

            {/* COURSE */}

            <div className="space-y-1.5">

              <Label>
                Course
              </Label>

              <Select
                value={
                  form.course_id
                }
                disabled={
                  formMode ===
                  "edit"
                }
                onValueChange={(
                  v
                ) =>
                  setForm({
                    ...form,
                    course_id:
                      v,
                  })
                }
              >

                <SelectTrigger>

                  <SelectValue
                    placeholder={
                      coursesLoading
                        ? "Loading..."
                        : "Select a course"
                    }
                  />

                </SelectTrigger>


                <SelectContent>

                  {courses.map(
                    (c) => (

                      <SelectItem
                        key={c.id}
                        value={String(
                          c.id
                        )}
                      >
                        {c.title}
                      </SelectItem>

                    )
                  )}

                </SelectContent>

              </Select>


              {errors.course_id && (

                <p className="text-xs text-destructive">
                  {errors.course_id}
                </p>

              )}

            </div>


            {/* TITLE */}

            <div className="space-y-1.5">

              <Label>
                Title
              </Label>

              <Input
                placeholder="Lesson 1"
                value={
                  form.title
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    title:
                      e.target.value,
                  })
                }
              />


              {errors.title && (

                <p className="text-xs text-destructive">
                  {errors.title}
                </p>

              )}

            </div>


            {/* DESCRIPTION */}

            <div className="space-y-1.5">

              <Label>
                Description
              </Label>

              <Textarea
                placeholder="Present Perfect"
                value={
                  form.description
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
              />

            </div>


            {/* ORDER */}

            <div className="space-y-1.5">

              <Label>
                Order
              </Label>

              <Input
                type="number"
                min={1}
                value={
                  form.order
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    order:
                      e.target.value,
                  })
                }
              />


              {errors.order && (

                <p className="text-xs text-destructive">
                  {errors.order}
                </p>

              )}

            </div>


            {/* FREE PREVIEW */}

            <div className="flex items-center gap-2">

              <Checkbox
                id="is_free_preview"
                checked={
                  form.is_free_preview
                }
                onCheckedChange={(
                  c
                ) =>
                  setForm({
                    ...form,
                    is_free_preview:
                      c === true,
                  })
                }
              />

              <Label
                htmlFor="is_free_preview"
                className="cursor-pointer"
              >
                Free Preview
              </Label>

            </div>

          </div>


          <DialogFooter>

            <Button
              variant="outline"
              onClick={() =>
                setFormOpen(
                  false
                )
              }
            >
              Cancel
            </Button>


            <Button
              onClick={
                submit
              }
              disabled={
                createMutation.isPending ||
                updateMutation.isPending
              }
            >

              {(
                createMutation.isPending ||
                updateMutation.isPending
              ) && (

                <Loader2
                  className="animate-spin mr-2"
                  size={14}
                />

              )}


              {formMode ===
              "create"
                ? "Create Video"
                : "Save Changes"}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* ===================================================
          DELETE DIALOG
      =================================================== */}

      <Dialog
        open={deleteOpen}
        onOpenChange={
          setDeleteOpen
        }
      >

        <DialogContent>

          <DialogHeader>

            <DialogTitle>
              Delete Video
            </DialogTitle>

            <DialogDescription>

              Are you sure you want to delete{" "}

              <strong>
                {selectedVideo?.title}
              </strong>

              ?

              <br />

              This action cannot be undone.

            </DialogDescription>

          </DialogHeader>


          <DialogFooter>

            <Button
              variant="outline"
              disabled={
                deleteMutation.isPending
              }
              onClick={() =>
                setDeleteOpen(
                  false
                )
              }
            >
              Cancel
            </Button>


            <Button
              variant="destructive"
              disabled={
                deleteMutation.isPending
              }
              onClick={
                confirmDelete
              }
            >

              {deleteMutation.isPending && (

                <Loader2
                  className="animate-spin mr-2"
                  size={14}
                />

              )}

              Delete Video

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* ===================================================
          REORDER DIALOG
      =================================================== */}

      <Dialog
        open={reorderOpen}
        onOpenChange={
          setReorderOpen
        }
      >

        <DialogContent>

          <DialogHeader>

            <DialogTitle>
              Reorder Videos
            </DialogTitle>

            <DialogDescription>
              Set a unique order number for each video.
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-3 max-h-[400px] overflow-y-auto">

            {[...videos]
              .sort(
                (a, b) =>
                  (a.order ?? 0) -
                  (b.order ?? 0)
              )
              .map(
                (video) => (

                  <div
                    key={
                      video.id
                    }
                    className="flex items-center gap-3 border rounded-lg p-3"
                  >

                    <div className="flex-1 min-w-0">

                      <p className="font-medium truncate">
                        {video.title}
                      </p>

                    </div>


                    <Input
                      type="number"
                      min={1}
                      className="w-24"
                      value={
                        reorderValues[
                          video.id
                        ] ??
                        ""
                      }
                      onChange={(
                        e
                      ) =>
                        setReorderValues(
                          {
                            ...reorderValues,

                            [video.id]:
                              e.target.value,
                          }
                        )
                      }
                    />

                  </div>

                )
              )}

          </div>


          <DialogFooter>

            <Button
              variant="outline"
              disabled={
                reorderMutation.isPending
              }
              onClick={() =>
                setReorderOpen(
                  false
                )
              }
            >
              Cancel
            </Button>


            <Button
              disabled={
                reorderMutation.isPending
              }
              onClick={
                submitReorder
              }
            >

              {reorderMutation.isPending && (

                <Loader2
                  className="animate-spin mr-2"
                  size={14}
                />

              )}

              Save Order

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  );
};


export default AdminVideos;
