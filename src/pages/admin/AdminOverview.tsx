import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, BookOpen, GraduationCap, MessageSquare, BarChart3 } from "lucide-react";

const iconFor = (key: string) => {
  const k = key.toLowerCase();
  if (k.includes("user") || k.includes("student")) return Users;
  if (k.includes("course")) return BookOpen;
  if (k.includes("enroll")) return GraduationCap;
  if (k.includes("feedback")) return MessageSquare;
  return BarChart3;
};

const humanize = (key: string) =>
  key.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const Stat = ({ label, value }: { label: string; value: string | number }) => {
  const Icon = iconFor(label);
  return (
    <div className="border rounded-lg bg-card p-6 flex items-center gap-4">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground truncate">{humanize(label)}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

/** Flattens one nested level so `{ counts: { users: 3 } }` becomes `counts_users`. */
function collectStats(data: Record<string, unknown>) {
  const stats: [string, string | number][] = [];
  const tables: [string, Record<string, unknown>[]][] = [];

  const pushScalar = (key: string, value: unknown) => {
    if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
      stats.push([key, typeof value === "boolean" ? String(value) : value]);
    }
  };

  Object.entries(data || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const rows = value.filter((v) => v && typeof v === "object") as Record<string, unknown>[];
      if (rows.length) tables.push([key, rows]);
      else stats.push([key, value.length]);
    } else if (value && typeof value === "object") {
      Object.entries(value as Record<string, unknown>).forEach(([k2, v2]) =>
        pushScalar(`${key}_${k2}`, v2),
      );
    } else {
      pushScalar(key, value);
    }
  });

  return { stats, tables };
}

const cellValue = (v: unknown) => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

const AdminOverview = () => {
  const { data, isLoading, isError, error } = useAdminDashboard();
  const { stats, tables } = collectStats((data as Record<string, unknown>) || {});

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Overview</h1>
      <p className="text-sm text-muted-foreground mb-6">Quick view of platform activity</p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="border rounded-lg bg-card p-8 text-center text-sm text-destructive">
          {(error as Error)?.message || "Failed to load dashboard data."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(([key, value]) => (
              <Stat key={key} label={key} value={value} />
            ))}
          </div>

          {tables.map(([key, rows]) => {
            const columns = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
            return (
              <div key={key} className="mt-8">
                <h2 className="text-lg font-semibold mb-3">{humanize(key)}</h2>
                <div className="border rounded-lg bg-card overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((c) => (
                          <TableHead key={c}>{humanize(c)}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row, i) => (
                        <TableRow key={i}>
                          {columns.map((c) => (
                            <TableCell key={c} className="max-w-[280px] truncate">
                              {cellValue(row[c])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}

          {!stats.length && !tables.length && (
            <div className="border rounded-lg bg-card p-8 text-center text-sm text-muted-foreground">
              No dashboard data returned.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOverview;
