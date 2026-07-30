import { useState } from "react";
import { z } from "zod";
import { User } from "@/types/auth";
import {
  useAdminUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useToggleUserActive,
  useChangeUserRole,
} from "@/hooks/useAdminUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DeleteConfirmationDialog from "@/components/admin/evaluation-quiz/DeleteConfirmationDialog";
import { Trash2, Pencil, Plus, Loader2 } from "lucide-react";

const createUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().email("Invalid email address").max(255),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password too long"),
    password_confirmation: z.string(),
    role: z.enum(["student"], { errorMap: () => ({ message: "Invalid role" }) }),
    is_active: z.boolean(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

const editUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  role: z.enum(["student", "admin"]),
});

type FormState = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "student",
  is_active: true,
};

const AdminUsers = () => {
  const { data, isLoading } = useAdminUsers();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const toggleActive = useToggleUserActive();
  const changeRole = useChangeUserRole();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const submitting = createUser.isPending || updateUser.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setOpen(true);
  };
  const openEdit = (u: User) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      password_confirmation: "",
      role: u.role || "student",
      is_active: u.is_active !== false,
    });
    setErrors({});
    setOpen(true);
  };

  const submit = async () => {
    setErrors({});
    const parsed = editing
      ? editUserSchema.safeParse({ name: form.name, role: form.role })
      : createUserSchema.safeParse(form);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const key = i.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (editing) {
        await updateUser.mutateAsync({
          id: editing.id,
          payload: parsed.data as { name: string; role: string },
        });
        if ((editing.is_active !== false) !== form.is_active) {
          await toggleActive.mutateAsync(editing.id);
        }
      } else {
        await createUser.mutateAsync(parsed.data as never);
      }
      setOpen(false);
    } catch {
      /* errors surfaced via toast in hooks */
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      /* handled in hook */
    }
  };

  const onToggleActive = (id: number) => {
    setPendingId(id);
    toggleActive.mutate(id, { onSettled: () => setPendingId(null) });
  };

  const onChangeRole = (id: number, role: string) => {
    setPendingId(id);
    changeRole.mutate({ id, role }, { onSettled: () => setPendingId(null) });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage all users, roles, and access</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus size={16} /> New User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit User" : "Create User"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="Full name"
                  maxLength={100}
                  disabled={submitting}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  placeholder="user@example.com"
                  type="email"
                  maxLength={255}
                  disabled={submitting || !!editing}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              {!editing && (
                <>
                  <div>
                    <Label>Password</Label>
                    <Input
                      placeholder="At least 8 characters"
                      type="password"
                      disabled={submitting}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <Input
                      placeholder="Repeat password"
                      type="password"
                      disabled={submitting}
                      value={form.password_confirmation}
                      onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                    />
                    {errors.password_confirmation && (
                      <p className="text-xs text-destructive mt-1">{errors.password_confirmation}</p>
                    )}
                  </div>
                </>
              )}
              <div>
                <Label>Role</Label>
                <Select
                  value={form.role}
                  disabled={submitting}
                  onValueChange={(v) => setForm({ ...form, role: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    {editing && <SelectItem value="admin">Admin</SelectItem>}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-destructive mt-1">{errors.role}</p>}
                {!editing && (
                  <p className="text-xs text-muted-foreground mt-1">
                    New users can only be created as Students.
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={form.is_active}
                  disabled={submitting}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={submit} disabled={submitting}>
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((u) => {
                const rowBusy = pendingId === u.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role || "student"}
                        disabled={rowBusy}
                        onValueChange={(v) => onChangeRole(u.id, v)}
                      >
                        <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={rowBusy ? "opacity-60 pointer-events-none" : "cursor-pointer"}
                        variant={u.is_active === false ? "destructive" : "default"}
                        onClick={() => !rowBusy && onToggleActive(u.id)}
                      >
                        {u.is_active === false ? "Inactive" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" disabled={rowBusy} onClick={() => openEdit(u)}>
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={rowBusy || deleteUser.isPending}
                        onClick={() => setDeleteTarget(u)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete user"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : undefined
        }
        loading={deleteUser.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminUsers;
