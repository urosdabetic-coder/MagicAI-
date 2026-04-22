import type { Audit, AuditStatus } from "@/types";
import { AuditCard } from "./audit-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  title: string;
  status: AuditStatus;
  audits: Audit[];
  accentClass?: string;
}

export function KanbanColumn({
  title,
  audits,
  accentClass,
}: KanbanColumnProps) {
  return (
    <div className="flex min-w-[320px] flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-2">
          <div className={cn("h-1.5 w-1.5 rounded-full", accentClass ?? "bg-muted-foreground")} />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground">
            {title}
          </h2>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground tabular-nums">
            {audits.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {audits.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
            <p className="text-xs text-muted-foreground">No audits</p>
          </div>
        ) : (
          audits.map((audit, idx) => (
            <div
              key={audit.id}
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "backwards" }}
            >
              <AuditCard audit={audit} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
