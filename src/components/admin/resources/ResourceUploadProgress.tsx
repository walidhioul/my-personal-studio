import { CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  ResourceUploadState,
  formatBytes,
} from "@/hooks/useBunnyResourceUpload";

interface Props {
  state: ResourceUploadState;
}

const ResourceUploadProgress = ({ state }: Props) => {
  if (state.phase === "idle") return null;

  if (state.phase === "ready") {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
        <CheckCircle2 size={14} /> Upload Completed
      </div>
    );
  }

  if (state.phase === "verifying") {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="animate-spin" size={12} /> Verifying...
      </p>
    );
  }

  if (state.phase === "error") {
    return (
      <p className="text-xs text-destructive">{state.error || "Upload failed"}</p>
    );
  }

  return (
    <div className="space-y-1.5 min-w-[200px]">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Loader2 className="animate-spin" size={12} />
          {state.phase === "starting" ? "Preparing..." : "Uploading PDF..."}
        </span>
        <span className="font-medium">{state.percent.toFixed(1)}%</span>
      </div>
      <Progress value={state.percent} className="h-1.5" />
      <p className="text-xs text-muted-foreground">
        {formatBytes(state.uploaded)} / {formatBytes(state.total)}
      </p>
    </div>
  );
};

export default ResourceUploadProgress;
