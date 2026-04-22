"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FileText,
  AlertTriangle,
  Users,
  LayoutDashboard,
  FileCheck2,
} from "lucide-react";
import { useAuditStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Audit, RiskLevel } from "@/types";
import { AuditOverviewTab } from "./tabs/overview-tab";
import { AuditTeamTab } from "./tabs/team-tab";
import { AuditWorkpapersTab } from "./tabs/workpapers-tab";
import { AuditFindingsTab } from "./tabs/findings-tab";
import { AuditReportTab } from "./tabs/report-tab";

const riskConfig: Record<RiskLevel, { label: string; dot: string; text: string }> = {
  low: { label: "Low", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  medium: { label: "Medium", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  high: { label: "High", dot: "bg-orange-500", text: "text-orange-700 dark:text-orange-400" },
  critical: { label: "Critical", dot: "bg-red-500", text: "text-red-700 dark:text-red-400" },
};

const statusLabels: Record<Audit["status"], string> = {
  planning: "Planning",
  fieldwork: "Fieldwork",
  review: "In Review",
  reporting: "Reporting",
  closed: "Closed",
};

type TabKey = "overview" | "team" | "workpapers" | "findings" | "report";

const TABS: Array<{ key: TabKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "team", label: "Team", icon: Users },
  { key: "workpapers", label: "Workpapers", icon: FileText },
  { key: "findings", label: "Findings", icon: AlertTriangle },
  { key: "report", label: "Report", icon: FileCheck2 },
];

export function AuditDetailView({ auditId }: { auditId: string }) {
  const audit = useAuditStore((s) => s.audits.find((a) => a.id === auditId));
  const workpapers = useAuditStore((s) =>
    s.workpapers.filter((w) => w.auditId === auditId)
  );
  const findings = useAuditStore((s) =>
    s.findings.filter((f) => f.auditId === auditId)
  );

  const [tab, setTab] = useState<TabKey>("overview");

  if (!audit) {
    // The store hasn't hydrated yet OR the audit truly doesn't exist.
    // Give the store a moment; if it hydrates, the selector returns a value.
    // For a missing ID, show a minimal not-found message.
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
        <div className="mt-8 rounded-xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Audit <span className="font-mono">{auditId}</span> not found.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            If you just reloaded, your local data may have been cleared. Go back to the dashboard.
          </p>
        </div>
      </div>
    );
  }

  const risk = riskConfig[audit.risk];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-10">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="font-mono tracking-tight">{audit.code}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/50" />
            <span>{audit.domain}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/50" />
            <span>{statusLabels[audit.status]}</span>
          </div>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight leading-tight">
            {audit.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {audit.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="gap-1.5 font-medium">
              <span className={cn("h-1.5 w-1.5 rounded-full", risk.dot)} />
              <span className={risk.text}>{risk.label} risk</span>
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Due {audit.dueDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span className="tabular-nums">
                {audit.completedWorkpapers}/{audit.workpaperCount} workpapers
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              <span className="tabular-nums">{audit.findingsCount} findings</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex -space-x-1.5">
            {audit.team.slice(0, 4).map((m) => (
              <Avatar key={m.auditor.id} className="h-7 w-7 border-2 border-background">
                <AvatarFallback
                  className={cn(m.auditor.avatarColor, "text-[10px] font-semibold text-white")}
                  title={`${m.auditor.name} — ${m.role}`}
                >
                  {m.auditor.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {audit.team.length > 4 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold text-muted-foreground">
                +{audit.team.length - 4}
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Tabs */}
      <div className="border-b border-border/60">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                {t.key === "workpapers" && workpapers.length > 0 && (
                  <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground tabular-nums">
                    {workpapers.length}
                  </span>
                )}
                {t.key === "findings" && findings.length > 0 && (
                  <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground tabular-nums">
                    {findings.length}
                  </span>
                )}
                {t.key === "team" && (
                  <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground tabular-nums">
                    {audit.team.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-8 pb-16">
        {tab === "overview" && <AuditOverviewTab audit={audit} />}
        {tab === "team" && <AuditTeamTab audit={audit} />}
        {tab === "workpapers" && <AuditWorkpapersTab audit={audit} />}
        {tab === "findings" && <AuditFindingsTab audit={audit} />}
        {tab === "report" && <AuditReportTab audit={audit} />}
      </div>
    </div>
  );
}
