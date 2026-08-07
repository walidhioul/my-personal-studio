import { AlertCircle, CheckCircle2, Loader2, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VideoStatus } from "@/hooks/useVideoStatusPolling";

interface Props {
  status: VideoStatus;
  reconnecting?: boolean;
}

const VideoStatusBadge = ({ status, reconnecting }: Props) => {
  const indicator = reconnecting ? (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <WifiOff size={11} /> Reconnecting...
    </span>
  ) : null;

  if (status === "ready") {
    return (
      <div className="space-y-1">
        <Badge className="bg-primary text-primary-foreground gap-1">
          <CheckCircle2 size={12} /> Ready
        </Badge>
        {indicator}
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="space-y-1 text-left">
        <Badge variant="destructive" className="gap-1">
          <AlertCircle size={12} /> Video Processing Failed
        </Badge>
        <p className="text-xs text-muted-foreground">
          Bunny Stream could not encode this file. Please retry the upload.
        </p>
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="space-y-1 text-left">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" size={13} /> Processing...
        </span>
        {indicator}
      </div>
    );
  }

  return (
    <div className="space-y-1 text-left">
      <Badge variant="outline">Pending Upload</Badge>
      {indicator}
    </div>
  );
};

export default VideoStatusBadge;
