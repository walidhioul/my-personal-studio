import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AdminFileStatus } from "@/api/adminFiles";

interface Props {
  status?: AdminFileStatus | string | null;
}

const FileStatusBadge = ({ status }: Props) => {
  const value = (status || "pending_upload").toString().toLowerCase();

  if (value === "ready") {
    return (
      <Badge className="bg-primary text-primary-foreground gap-1">
        <CheckCircle2 size={12} /> Ready
      </Badge>
    );
  }
  if (value === "failed") {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle size={12} /> Upload Failed
      </Badge>
    );
  }
  if (value === "uploading") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Upload size={12} /> Uploading
      </Badge>
    );
  }
  if (value === "verifying") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="animate-spin" size={12} /> Verifying
      </Badge>
    );
  }
  return <Badge variant="outline">Pending Upload</Badge>;
};

export default FileStatusBadge;
