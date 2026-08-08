import { CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  FileUploadState,
  formatBytes,
  formatEta,
  formatSpeed,
} from "@/hooks/useBunnyFileUpload";

interface Props {
  state: FileUploadState;
}

const FileUploadProgress = ({ state }: Props) => {
  if (state.phase === "idle") return null;

  if (state.phase === "completed") {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
        <CheckCircle2 size={14} /> Upload Completed
      </div>
    );
  }

  if (state.phase === "cancelled") {
    return <p className="text-xs text-muted-foreground">Upload cancelled</p>;
  }

  if (state.phase === "error") {
    return (
      <p className="text-xs text-destructive">{state.error || "Upload failed"}</p>
    );
  }

  const speed = formatSpeed(state.speed);
  const eta = formatEta(state.eta);

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
        {speed ? ` · ${speed}` : ""}
        {eta ? ` · ${eta} left` : ""}
      </p>
    </div>
  );
};

export default FileUploadProgress;
