import Link from "next/link";
import {
  Calendar,
  FileText,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import type { Audit } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AuditCardProps {
  audit: Audit;
}

const riskConfig: Record<
  Audit["risk"],
  { label: string; dot: string; text: string }
> = {
  low: { label: "Low", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  medium: { label: "Medium", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  high: { label: "High", dot: "bg-orange-500", text: "text-orange-700 dark:text-orange-400" },
  critical: { label: "Critical", dot: "bg-red-500", text: "text-red-700 dark:text-red-400" },
};

export function AuditCard({ audit }: AuditCardProps) {
  const risk = riskConfig[audit.risk];

  return (
    <Link
      href={`/workpapers/wp-001`}
      className="group block rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:border-border hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <span className="font-mono tracking-tight">{audit.code}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/50" />
            <span>{audit.domain}</span>
          </div>
          <h3 className="mt-2 text-sm font-semibold tracking-tight text-foreground leading-snug">
            {audit.title}
          </h3>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>

      {/* Description */}
      <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
        {audit.description}
      </p>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium text-muted-foreground">Progress</span>
          <span className="font-mono font-semibold tabular-nums text-foreground">
            {audit.progress}%
          </span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-500"
            style={{ width: `${audit.progress}%` }}
          />
        </div>
      </div>

      {/* Meta footer */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span className="tabular-nums">
              {audit.completedWorkpapers}/{audit.workpaperCount}
            </span>
          </div>
          {audit.findingsCount > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span className="tabular-nums">{audit.findingsCount}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{audit.dueDate}</span>
          </div>
        </div>
      </div>

      {/* Risk + Team row */}
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
        <Badge variant="outline" className="gap-1.5 font-medium">
          <span className={cn("h-1.5 w-1.5 rounded-full", risk.dot)} />
          <span className={risk.text}>{risk.label} risk</span>
        </Badge>
        <div className="flex -space-x-1.5">
          {audit.team.slice(0, 3).map((member) => (
            <Avatar
              key={member.id}
              className="h-6 w-6 border-2 border-card"
            >
              <AvatarFallback
                className={cn(
                  member.avatarColor,
                  "text-[9px] font-semibold text-white"
                )}
              >
                {member.initials}
              </AvatarFallback>
            </Avatar>
          ))}
          {audit.team.length > 3 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-semibold text-muted-foreground">
              +{audit.team.length - 3}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
