import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  BookOpen,
  GraduationCap,
  MessageSquare,
  BarChart3,
  Activity,
  Star,
  ClipboardList,
} from "lucide-react";

const iconFor = (key: string) => {
  const k = key.toLowerCase();
  if (k.includes("student")) return Users;
  if (k.includes("course")) return BookOpen;
  if (k.includes("video")) return BookOpen;
  if (k.includes("resource")) return BookOpen;
  if (k.includes("enrollment")) return GraduationCap;
  if (k.includes("quiz")) return ClipboardList;
  if (k.includes("feedback")) return MessageSquare;
  if (k.includes("rating")) return Star;
  if (k.includes("completion") || k.includes("pass")) return Activity;
  return BarChart3;
};

const humanize = (key: string) =>
  key.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatValue = (key: string, value: number | string) => {
  if (typeof value === "number") {
    if (key.includes("rate") || key.includes("completion") || key.includes("average")) {
      return `${value}%`;
    }
    return value.toLocaleString();
  }
  return value;
};

const Stat = ({ label, value }: { label: string; value: string | number }) => {
  const Icon = iconFor(label);
  return (
    <div className="border rounded-lg bg-card p-6 flex items-center gap-4">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground truncate">{humanize(label)}</p>
        <p className="text-2xl font-bold">{formatValue(label, value)}</p>
      </div>
    </div>
  );
};

const AdminOverview = () => {
  const { data, isLoading, isError, error } = useAdminDashboard();
  const overview = (data as Record<string, unknown>)?.overview as Record<string, number | string> | undefined;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Overview</h1>
      <p className="text-sm text-muted-foreground mb-6">Quick view of platform activity</p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="border rounded-lg bg-card p-8 text-center text-sm text-destructive">
          {(error as Error)?.message || "Failed to load dashboard data."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overview &&
            Object.entries(overview).map(([key, value]) => (
              <Stat key={key} label={key} value={value} />
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
