"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { Audit, FindingStatus, RiskLevel } from "@/types";
import { FINDING_STATUS_LABELS, SEVERITY_LABELS } from "@/types";
import { useAuditStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const severityConfig: Record<RiskLevel, { dot: string; text: string }> = {
  low: { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  medium: { dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  high: { dot: "bg-orange-500", text: "text-orange-700 dark:text-orange-400" },
  critical: { dot: "bg-red-500", text: "text-red-700 dark:text-red-400" },
};

const severityOrder: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function AuditFindingsTab({ audit }: { audit: Audit }) {
  const findings = useAuditStore((s) =>
    s.findings.filter((f) => f.auditId === audit.id)
  );
  const setFindingStatus = useAuditStore((s) => s.setFindingStatus);

  const [severityFilter, setSeverityFilter] = useState<"all" | RiskLevel>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | FindingStatus>("all");

  const filtered = findings
    .filter((f) => severityFilter === "all" || f.severity === severityFilter)
    .filter((f) => statusFilter === "all" || f.status === statusFilter)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Findings</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Findings promoted from workpapers. Drafts remain inside their workpaper.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
            className="h-8 w-32 text-xs"
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-8 w-36 text-xs"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="accepted">Accepted</option>
            <option value="in_remediation">In Remediation</option>
            <option value="closed">Closed</option>
          </Select>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center">
            <AlertTriangle className="mx-auto h-5 w-5 text-muted-foreground/60" />
            <p className="mt-2 text-xs text-muted-foreground">
              {findings.length === 0
                ? "No findings yet. Accept a drafted finding in a workpaper to promote it here."
                : "No findings match these filters."}
            </p>
          </div>
        ) : (
          filtered.map((f) => {
            const sev = severityConfig[f.severity];
            return (
              <div key={f.id} className="rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1.5 font-medium">
                        <span className={cn("h-1.5 w-1.5 rounded-full", sev.dot)} />
                        <span className={sev.text}>{SEVERITY_LABELS[f.severity]}</span>
                      </Badge>
                      <span className="font-mono text-[10px] text-muted-foreground">{f.id}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold tracking-tight">{f.title}</h3>
                  </div>
                  <Select
                    value={f.status}
                    onChange={(e) =>
                      setFindingStatus(f.id, e.target.value as FindingStatus)
                    }
                    className="h-8 w-36 text-xs"
                  >
                    {Object.entries(FINDING_STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <FindingField label="Condition" value={f.condition} />
                  <FindingField label="Criteria" value={f.criteria} />
                  <FindingField label="Cause" value={f.cause} />
                  <FindingField label="Effect" value={f.effect} />
                </div>

                <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Recommendation
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed">{f.recommendation}</p>
                </div>

                {f.owner && (
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback
                        className={cn(f.owner.avatarColor, "text-[9px] font-semibold text-white")}
                      >
                        {f.owner.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span>Owner: {f.owner.name}</span>
                    {f.dueDate && (
                      <>
                        <span>·</span>
                        <span>Due {f.dueDate}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function FindingField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-foreground/90">{value}</p>
    </div>
  );
}
