"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ComplianceInsight } from "@/types";
import { cn } from "@/lib/utils";

interface ComplianceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insights: ComplianceInsight[] | null;
  loading: boolean;
}

const severityConfig: Record<
  ComplianceInsight["severity"],
  {
    icon: typeof CheckCircle2;
    label: string;
    badge: string;
    iconBg: string;
    iconColor: string;
    borderAccent: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    label: "Success",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderAccent: "border-l-emerald-500",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderAccent: "border-l-amber-500",
  },
  error: {
    icon: XCircle,
    label: "Issue",
    badge: "bg-red-500/10 text-red-700 dark:text-red-400",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600 dark:text-red-400",
    borderAccent: "border-l-red-500",
  },
  info: {
    icon: Info,
    label: "Suggestion",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderAccent: "border-l-blue-500",
  },
};

export function ComplianceSheet({
  open,
  onOpenChange,
  insights,
  loading,
}: ComplianceSheetProps) {
  const summary = insights
    ? {
        success: insights.filter((i) => i.severity === "success").length,
        warnings: insights.filter((i) => i.severity === "warning").length,
        errors: insights.filter((i) => i.severity === "error").length,
        info: insights.filter((i) => i.severity === "info").length,
      }
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <ShieldCheck className="h-4 w-4 text-background" />
            </div>
            <div>
              <SheetTitle className="text-base">AI Compliance Check</SheetTitle>
              <SheetDescription className="text-xs">
                Automated review against IIA standards and firm methodology.
              </SheetDescription>
            </div>
          </div>

          {/* Summary chips */}
          {summary && !loading && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              <SummaryChip
                count={summary.errors}
                label="Issues"
                className="bg-red-500/10 text-red-700 dark:text-red-400"
              />
              <SummaryChip
                count={summary.warnings}
                label="Warnings"
                className="bg-amber-500/10 text-amber-700 dark:text-amber-400"
              />
              <SummaryChip
                count={summary.info}
                label="Info"
                className="bg-blue-500/10 text-blue-700 dark:text-blue-400"
              />
              <SummaryChip
                count={summary.success}
                label="Passed"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              />
            </div>
          )}
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && <ComplianceLoadingState />}

          {!loading && insights && (
            <div className="space-y-3">
              {insights.map((insight, idx) => {
                const config = severityConfig[insight.severity];
                const Icon = config.icon;
                return (
                  <div
                    key={insight.id}
                    className={cn(
                      "rounded-lg border border-border/60 border-l-[3px] bg-card p-4 animate-fade-in",
                      config.borderAccent
                    )}
                    style={{
                      animationDelay: `${idx * 70}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                          config.iconBg
                        )}
                      >
                        <Icon className={cn("h-4 w-4", config.iconColor)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                              config.badge
                            )}
                          >
                            {config.label}
                          </span>
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {insight.category}
                          </span>
                        </div>
                        <h4 className="mt-1.5 text-sm font-semibold tracking-tight leading-snug">
                          {insight.title}
                        </h4>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                          {insight.description}
                        </p>
                        {insight.reference && (
                          <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                            <span>{insight.reference}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && insights && (
          <div className="border-t border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>
                Reviewed against 47 quality rules · AI output — always verify
              </span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SummaryChip({
  count,
  label,
  className,
}: {
  count: number;
  label: string;
  className: string;
}) {
  return (
    <div className={cn("rounded-md px-2 py-1.5 text-center", className)}>
      <div className="text-base font-semibold tabular-nums">{count}</div>
      <div className="text-[9px] font-medium uppercase tracking-wider opacity-80">
        {label}
      </div>
    </div>
  );
}

function ComplianceLoadingState() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 p-4">
        <div className="relative flex h-6 w-6 items-center justify-center rounded-md bg-foreground">
          <Sparkles className="h-3 w-3 text-background" />
          <span className="absolute -inset-0.5 rounded-md border border-foreground/20 animate-ping opacity-40" />
        </div>
        <div>
          <p className="text-xs font-semibold">Evaluating 47 quality rules</p>
          <p className="text-[11px] text-muted-foreground">
            Cross-checking against IIA IPPF and firm methodology…
          </p>
        </div>
      </div>

      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-border/60 bg-card p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 shrink-0 rounded-md shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-24 rounded-md shimmer" />
              <div className="h-3 w-3/4 rounded-md shimmer" />
              <div className="space-y-1 pt-1">
                <div className="h-2 w-full rounded-md shimmer" />
                <div className="h-2 w-5/6 rounded-md shimmer" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
