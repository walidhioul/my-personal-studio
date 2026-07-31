import { useQuery } from "@tanstack/react-query";
import * as admin from "@/api/admin";

export const adminDashboardKeys = {
  all: ["admin", "dashboard"] as const,
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardKeys.all,
    queryFn: admin.getAdminDashboard,
    select: (r) => r.data,
    staleTime: 2 * 60 * 1000,
  });
}
