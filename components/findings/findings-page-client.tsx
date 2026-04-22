"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useAuditStore } from "@/lib/store";
import {
  FINDING_STATUS_LABELS,
  SEVERITY_LABELS,
  type FindingStatus,
  type RiskLevel,
} from "@/types";
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

export function FindingsPageClient() {
  const findings = useAuditStore((s) => s.findings);
  const audits = useAuditStore((s) => s.audits);
  const setFindingStatus = useAuditStore((s) => s.setFindingStatus);

  const [severityFilter, setSeverityFilter] = useState<"all" | RiskLevel>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | FindingStatus>("all");
  const [auditFilter, setAuditFilter] = useState<"all" | string>("all");

  const filtered = findings
    .filter((f) => severityFilter === "all" || f.severity === severityFilter)
    .filter((f) => statusFilter === "all" || f.status === statusFilter)
    .filter((f) => auditFilter === "all" || f.auditId === auditFilter)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Summary counts
  const openCount = findings.filter((f) => f.status === "open").length;
  const criticalCount = findings.filter(
    (f) => f.severity === "critical" && f.status !== "closed"
  ).length;
  const highCount = findings.filter(
    (f) => f.severity === "high" && f.status !== "closed"
  ).length;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>Findings</span>
          <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/50" />
          <span>All engagements</span>
        </div>
        <h1 className="mt-1.5 text-3xl font-semibold tracking-tight">
          Findings register
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Every finding promoted from a workpaper, across all audits.
        </p>
      </div>

      {/* Summary row */}
      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        <SummaryStat label="Total" value={findings.length} />
        <SummaryStat label="Open" value={openCount} />
        <SummaryStat label="Critical" value={criticalCount} accent="text-red-600" />
        <SummaryStat label="High" value={highCount} accent="text-orange-600" />
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
          className="h-8 w-36 text-xs"
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
        <Select
          value={auditFilter}
          onChange={(e) => setAuditFilter(e.target.value)}
          className="h-8 w-56 text-xs"
        >
          <option value="all">All audits</option>
          {audits.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.title}
            </option>
          ))}
        </Select>
      </div>

      {/* List */}
      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-12 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-xs text-muted-foreground">
              {findings.length === 0
                ? "No findings yet. Accept a drafted finding in a workpaper to see it here."
                : "No findings match these filters."}
            </p>
          </div>
        ) : (
          filtered.map((f) => {
            const sev = severityConfig[f.severity];
            const audit = audits.find((a) => a.id === f.auditId);
            return (
              <div key={f.id} className="rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="gap-1.5 font-medium">
                        <span className={cn("h-1.5 w-1.5 rounded-full", sev.dot)} />
                        <span className={sev.text}>{SEVERITY_LABELS[f.severity]}</span>
                      </Badge>
                      <span className="font-mono text-[10px] text-muted-foreground">{f.id}</span>
                      {audit && (
                        <Link
                          href={`/audits/${audit.id}`}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          {audit.code}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-semibold tracking-tight">{f.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {f.condition}
                    </p>
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

                {f.owner && (
                  <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
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

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-2 font-mono text-2xl font-semibold tabular-nums", accent)}>
        {value}
      </p>
    </div>
  );
}
