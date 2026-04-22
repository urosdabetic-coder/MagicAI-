import { FileCheck2, AlertTriangle, Clock, Target } from "lucide-react";
import type { Audit } from "@/types";

interface StatsRowProps {
  audits: Audit[];
}

export function StatsRow({ audits }: StatsRowProps) {
  const active = audits.filter((a) => a.status !== "closed").length;
  const totalFindings = audits.reduce((sum, a) => sum + a.findingsCount, 0);
  const inReview = audits.filter((a) => a.status === "review").length;
  const avgProgress =
    active > 0
      ? Math.round(
          audits
            .filter((a) => a.status !== "closed")
            .reduce((sum, a) => sum + a.progress, 0) / active
        )
      : 0;

  const stats = [
    { label: "Active audits", value: active, icon: Target, hint: "across 4 domains" },
    { label: "Findings open", value: totalFindings, icon: AlertTriangle, hint: "3 high severity" },
    { label: "In review", value: inReview, icon: Clock, hint: "awaiting sign-off" },
    { label: "Avg. progress", value: `${avgProgress}%`, icon: FileCheck2, hint: "on track" },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </span>
              <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{stat.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
