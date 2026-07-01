import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as admin from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, ChevronRight } from "lucide-react";

const emptyCourse = { title: "", description: "", level: "Beginner", price: 0, thumbnail: "" };

const AdminCourses = () => {
  const qc = useQueryClient();
  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: admin.listAdminCourses,
    select: (r) => r.data,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<admin.AdminCourse | null>(null);
  const [form, setForm] = useState<any>(emptyCourse);
  const [selected, setSelected] = useState<admin.AdminCourse | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "courses"] });

  const openCreate = () => { setEditing(null); setForm(emptyCourse); setOpen(true); };
  const openEdit = (c: admin.AdminCourse) => {
    setEditing(c);
    setForm({ title: c.title, description: c.description || "", level: c.level, price: c.price, thumbnail: c.thumbnail || "" });
    setOpen(true);
  };

  const submit = async () => {
    try {
      if (editing) { await admin.updateCourse(editing.id, form); toast.success("Course updated"); }
      else { await admin.createCourse(form); toast.success("Course created"); }
      setOpen(false); refresh();
    } catch (e) { toast.error((e as Error).message); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this course?")) return;
    try { await admin.deleteCourse(id); toast.success("Deleted"); refresh(); if (selected?.id === id) setSelected(null); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-sm text-muted-foreground">Manage courses, lessons, resources, and quizzes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openCreate}><Plus size={16} /> New Course</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Course" : "Create Course"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              <Input placeholder="Thumbnail path" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit}>{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <p>Loading...</p> : (
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{c.level}</TableCell>
                  <TableCell>${Number(c.price || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setSelected(c)}>Manage <ChevronRight size={14} /></Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)}><Pencil size={14} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(c.id)}><Trash2 size={14} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selected && (
        <div className="mt-8 border rounded-lg bg-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Manage: {selected.title}</h2>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Close</Button>
          </div>
          <Tabs defaultValue="lessons">
            <TabsList>
              <TabsTrigger value="lessons">Lessons / Videos</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            </TabsList>
            <TabsContent value="lessons"><LessonsPanel courseId={selected.id} /></TabsContent>
            <TabsContent value="resources"><ResourcesPanel courseId={selected.id} /></TabsContent>
            <TabsContent value="quizzes"><QuizzesPanel courseId={selected.id} /></TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

// -------- LESSONS PANEL --------
const LessonsPanel = ({ courseId }: { courseId: number }) => {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "lessons", courseId],
    queryFn: () => admin.listLessons(courseId),
    select: (r) => r.data,
  });
  const [form, setForm] = useState({ title: "", video_url: "", duration: "", order: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "lessons", courseId] });

  const submit = async () => {
    try {
      if (editingId) await admin.updateLesson(editingId, form);
      else await admin.createLesson(courseId, form);
      setForm({ title: "", video_url: "", duration: "", order: 0 });
      setEditingId(null);
      refresh();
      toast.success("Saved");
    } catch (e) { toast.error((e as Error).message); }
  };
  const remove = async (id: number) => {
    if (!confirm("Delete lesson?")) return;
    try { await admin.deleteLesson(id); refresh(); } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-4 gap-2">
        <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input placeholder="Video URL" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
        <Input placeholder="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        <div className="flex gap-2">
          <Input placeholder="Order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: +e.target.value })} />
          <Button onClick={submit}>{editingId ? "Update" : "Add"}</Button>
        </div>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Title</TableHead><TableHead>Video</TableHead><TableHead>Duration</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {data?.map((l) => (
            <TableRow key={l.id}>
              <TableCell>{l.order}</TableCell>
              <TableCell>{l.title}</TableCell>
              <TableCell className="truncate max-w-[200px]">{l.video_url}</TableCell>
              <TableCell>{l.duration}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingId(l.id); setForm({ title: l.title, video_url: l.video_url || "", duration: l.duration || "", order: l.order || 0 }); }}><Pencil size={14} /></Button>
                <Button size="sm" variant="destructive" onClick={() => remove(l.id)}><Trash2 size={14} /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// -------- RESOURCES PANEL --------
const ResourcesPanel = ({ courseId }: { courseId: number }) => {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "resources", courseId],
    queryFn: () => admin.listResources(courseId),
    select: (r) => r.data,
  });
  const [form, setForm] = useState({ title: "", url: "", type: "pdf" });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "resources", courseId] });

  const submit = async () => {
    try { await admin.createResource(courseId, form); setForm({ title: "", url: "", type: "pdf" }); refresh(); toast.success("Added"); }
    catch (e) { toast.error((e as Error).message); }
  };
  const remove = async (id: number) => {
    if (!confirm("Delete resource?")) return;
    try { await admin.deleteResource(id); refresh(); } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-4 gap-2">
        <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <Input placeholder="Type (pdf, link)" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        <Button onClick={submit}>Add Resource</Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>URL</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {data?.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.title}</TableCell>
              <TableCell>{r.type}</TableCell>
              <TableCell className="truncate max-w-[300px]">{r.url}</TableCell>
              <TableCell className="text-right"><Button size="sm" variant="destructive" onClick={() => remove(r.id)}><Trash2 size={14} /></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// -------- QUIZZES PANEL --------
const QuizzesPanel = ({ courseId }: { courseId: number }) => {
  const qc = useQueryClient();
  const { data: quizzes } = useQuery({
    queryKey: ["admin", "quizzes", courseId],
    queryFn: () => admin.listQuizzes(courseId),
    select: (r) => r.data,
  });
  const [form, setForm] = useState({ title: "", description: "" });
  const [selectedQuiz, setSelectedQuiz] = useState<admin.AdminQuiz | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "quizzes", courseId] });

  const submit = async () => {
    try { await admin.createQuiz(courseId, form); setForm({ title: "", description: "" }); refresh(); toast.success("Created"); }
    catch (e) { toast.error((e as Error).message); }
  };
  const remove = async (id: number) => {
    if (!confirm("Delete quiz?")) return;
    try { await admin.deleteQuiz(id); refresh(); if (selectedQuiz?.id === id) setSelectedQuiz(null); } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-3 gap-2">
        <Input placeholder="Quiz Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Button onClick={submit}>Add Quiz</Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {quizzes?.map((q) => (
            <TableRow key={q.id}>
              <TableCell>{q.title}</TableCell>
              <TableCell>{q.description}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedQuiz(q)}>Questions</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(q.id)}><Trash2 size={14} /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedQuiz && <QuestionsPanel quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />}
    </div>
  );
};

// -------- QUESTIONS PANEL --------
const QuestionsPanel = ({ quiz, onClose }: { quiz: admin.AdminQuiz; onClose: () => void }) => {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "questions", quiz.id],
    queryFn: () => admin.listQuestions(quiz.id),
    select: (r) => r.data,
  });
  const [form, setForm] = useState({ question: "", options: ["", "", "", ""], correct_answer: "" });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "questions", quiz.id] });

  const submit = async () => {
    try {
      await admin.createQuestion(quiz.id, {
        question: form.question,
        options: form.options.filter(Boolean),
        correct_answer: form.correct_answer,
      });
      setForm({ question: "", options: ["", "", "", ""], correct_answer: "" });
      refresh();
      toast.success("Question added");
    } catch (e) { toast.error((e as Error).message); }
  };
  const remove = async (id: number) => {
    if (!confirm("Delete question?")) return;
    try { await admin.deleteQuestion(id); refresh(); } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="mt-6 border rounded-lg p-4 bg-muted/30">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Evaluation Questions — {quiz.title}</h3>
        <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
      </div>
      <div className="space-y-2 mb-4">
        <Textarea placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          {form.options.map((opt, i) => (
            <Input key={i} placeholder={`Option ${i + 1}`} value={opt}
              onChange={(e) => { const o = [...form.options]; o[i] = e.target.value; setForm({ ...form, options: o }); }} />
          ))}
        </div>
        <Input placeholder="Correct answer" value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })} />
        <Button onClick={submit}><Plus size={14} /> Add Question</Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Question</TableHead><TableHead>Correct</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {data?.map((q) => (
            <TableRow key={q.id}>
              <TableCell>{q.question}</TableCell>
              <TableCell>{q.correct_answer}</TableCell>
              <TableCell className="text-right"><Button size="sm" variant="destructive" onClick={() => remove(q.id)}><Trash2 size={14} /></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminCourses;
