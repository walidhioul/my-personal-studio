import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as admin from "@/api/admin";
import { User } from "@/types/auth";
import { toast } from "sonner";

export const userKeys = {
  all: ["admin", "users"] as const,
};

export function useAdminUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: admin.listUsers,
    select: (r) => r.data ?? [],
    staleTime: 5 * 60 * 1000,
  });
}

function useInvalidateUsers() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: userKeys.all });
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (payload: Partial<User> & { password: string }) => admin.createUser(payload),
    onSuccess: (res) => {
      invalidate();
      toast.success(res?.message || "User created successfully");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create user"),
  });
}

export function useUpdateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name: string; role: string } }) =>
      admin.updateUser(id, payload as Partial<User>),
    onSuccess: (res) => {
      invalidate();
      toast.success(res?.message || "User updated successfully");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update user"),
  });
}

export function useDeleteUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: number) => admin.deleteUser(id),
    onSuccess: (res) => {
      invalidate();
      toast.success(res?.message || "User deleted successfully");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete user"),
  });
}

/** Optimistic helpers shared by toggle-active and role change */
function optimisticPatch(
  qc: ReturnType<typeof useQueryClient>,
  id: number,
  patch: (u: User) => User,
) {
  const previous = qc.getQueryData(userKeys.all);
  qc.setQueryData(userKeys.all, (old: { data?: User[] } | undefined) => {
    if (!old?.data) return old;
    return { ...old, data: old.data.map((u) => (u.id === id ? patch(u) : u)) };
  });
  return previous;
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => admin.toggleUserActive(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: userKeys.all });
      const previous = optimisticPatch(qc, id, (u) => ({ ...u, is_active: u.is_active === false }));
      return { previous };
    },
    onError: (e: Error, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(userKeys.all, ctx.previous);
      toast.error(e.message || "Failed to update status");
    },
    onSuccess: (res) => toast.success(res?.message || "Status updated"),
    onSettled: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useChangeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => admin.changeUserRole(id, role),
    onMutate: async ({ id, role }) => {
      await qc.cancelQueries({ queryKey: userKeys.all });
      const previous = optimisticPatch(qc, id, (u) => ({ ...u, role }));
      return { previous };
    },
    onError: (e: Error, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(userKeys.all, ctx.previous);
      toast.error(e.message || "Failed to update role");
    },
    onSuccess: (res) => toast.success(res?.message || "Role updated"),
    onSettled: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}
