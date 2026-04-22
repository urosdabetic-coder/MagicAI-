import type { WorkpaperStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  WorkpaperStatus,
  { label: string; variant: "muted" | "warning" | "success" | "info"; dot: string }
> = {
  draft: { label: "Draft", variant: "muted", dot: "bg-zinc-400" },
  in_review: { label: "In Review", variant: "warning", dot: "bg-amber-500" },
  approved: { label: "Approved", variant: "success", dot: "bg-emerald-500" },
  returned: { label: "Returned", variant: "info", dot: "bg-blue-500" },
};

export function StatusBadge({ status }: { status: WorkpaperStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className="gap-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </Badge>
  );
}
