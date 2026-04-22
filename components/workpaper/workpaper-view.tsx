"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Send,
  MoreHorizontal,
  Clock,
  User,
  Eye,
} from "lucide-react";
import type {
  Workpaper,
  DraftedFinding,
  ComplianceInsight,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { DraftingSkeleton } from "./drafting-skeleton";
import { DraftingResult } from "./drafting-result";
import { ComplianceSheet } from "./compliance-sheet";

interface WorkpaperViewProps {
  workpaper: Workpaper;
}

export function WorkpaperView({ workpaper: initialWorkpaper }: WorkpaperViewProps) {
  const [workpaper, setWorkpaper] = useState(initialWorkpaper);
  const [notes, setNotes] = useState(initialWorkpaper.rawNotes);

  // Drafting Assistant state
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftFinding, setDraftFinding] = useState<DraftedFinding | null>(
    initialWorkpaper.draftedFinding ?? null
  );
  const [draftError, setDraftError] = useState<string | null>(null);

  // Compliance Checker state
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [complianceInsights, setComplianceInsights] = useState<
    ComplianceInsight[] | null
  >(null);

  const isReviewMode = workpaper.status === "in_review";

  async function handleDraftFinding() {
    setDraftLoading(true);
    setDraftError(null);
    setDraftFinding(null);
    try {
      const res = await fetch("/api/ai/drafting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawNotes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        setDraftFinding(data.finding);
      } else {
        setDraftError(data.error ?? "Unknown error");
      }
    } catch (e) {
      setDraftError("Network error. Please try again.");
    } finally {
      setDraftLoading(false);
    }
  }

  async function handleComplianceCheck() {
    setComplianceOpen(true);
    setComplianceLoading(true);
    setComplianceInsights(null);
    try {
      const res = await fetch("/api/ai/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workpaperId: workpaper.id,
          workpaperContent: buildWorkpaperContent(workpaper, notes, draftFinding),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComplianceInsights(data.insights);
      }
    } catch (e) {
      // Swallow for MVP
    } finally {
      setComplianceLoading(false);
    }
  }

  function handleSubmitForReview() {
    setWorkpaper({ ...workpaper, status: "in_review" });
  }

  function handleApprove() {
    setWorkpaper({ ...workpaper, status: "approved" });
  }

  function handleReturn() {
    setWorkpaper({ ...workpaper, status: "returned" });
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10 lg:py-10">
        {/* Breadcrumb + back */}
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
              <span className="font-mono tracking-tight">{workpaper.reference}</span>
              <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/50" />
              <span>{workpaper.auditTitle}</span>
            </div>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight leading-tight">
              {workpaper.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StatusBadge status={workpaper.status} />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Updated {workpaper.updatedAt}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{workpaper.owner.name}</span>
              </div>
            </div>
          </div>

          {/* Action area (adapts based on status) */}
          <div className="flex items-center gap-2">
            {isReviewMode ? (
              <ReviewerActions
                onComplianceCheck={handleComplianceCheck}
                onApprove={handleApprove}
                onReturn={handleReturn}
                reviewer={workpaper.reviewer}
              />
            ) : workpaper.status === "draft" ? (
              <>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitForReview}
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit for review
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                View audit trail
              </Button>
            )}
          </div>
        </div>

        {/* Review-mode banner */}
        {isReviewMode && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/30 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                <Eye className="h-3 w-3 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Review mode
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800/80 dark:text-amber-200/70">
                  You are reviewing this workpaper on behalf of {workpaper.owner.name}.
                  Run the AI compliance check before approving.
                </p>
              </div>
            </div>
          </div>
        )}

        <Separator className="my-8" />

        {/* Metadata — Notion-like inline property list */}
        <div className="space-y-3">
          <MetaRow label="Objective" value={workpaper.objective} />
          <MetaRow label="Scope" value={workpaper.scope} />
          <MetaRow
            label="Reviewer"
            value={
              workpaper.reviewer ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback
                      className={cn(
                        workpaper.reviewer.avatarColor,
                        "text-[9px] font-semibold text-white"
                      )}
                    >
                      {workpaper.reviewer.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{workpaper.reviewer.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Not assigned</span>
              )
            }
          />
        </div>

        <Separator className="my-8" />

        {/* Raw notes section */}
        <div>
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                Fieldwork notes
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Write freely. The AI will structure your notes into an IIA-compliant finding.
              </p>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
              {notes.length} chars
            </span>
          </div>

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your interview notes, walkthrough observations, and testing results here…"
            className="mt-3 min-h-[260px] resize-none border-border/60 bg-muted/20 p-4 text-sm leading-relaxed focus-visible:bg-background"
            disabled={isReviewMode}
          />
        </div>

        {/* Spark AI CTA */}
        {!isReviewMode && (
          <div className="mt-6">
            <button
              onClick={handleDraftFinding}
              disabled={draftLoading || notes.trim().length === 0}
              className={cn(
                "group relative w-full overflow-hidden rounded-xl border border-border/60 bg-card p-5 text-left transition-all duration-300 hover:border-foreground/40 hover:shadow-lg",
                "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none disabled:hover:border-border/60"
              )}
            >
              {/* Subtle gradient sheen on hover */}
              <div
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/[0.04] to-transparent transition-transform duration-700 group-hover:translate-x-full"
                aria-hidden="true"
              />
              <div className="relative flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground transition-transform duration-300 group-hover:scale-105">
                  <Sparkles className="h-4 w-4 text-background" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold tracking-tight">
                    Spark AI · Draft Finding
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Transform your raw notes into an IIA-structured finding in seconds.
                  </p>
                </div>
                <span className="hidden shrink-0 items-center gap-1 rounded-md border border-border/60 bg-muted px-2 py-1 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
                  <span>⌘</span>
                  <span>↵</span>
                </span>
              </div>
            </button>

            {draftError && (
              <p className="mt-3 text-xs text-red-600">{draftError}</p>
            )}
          </div>
        )}

        {/* AI Output area */}
        <div className="mt-8 space-y-6">
          {draftLoading && <DraftingSkeleton />}
          {!draftLoading && draftFinding && (
            <DraftingResult
              finding={draftFinding}
              onRegenerate={handleDraftFinding}
              onAccept={() => {
                /* no-op for MVP */
              }}
            />
          )}
        </div>

        {/* Bottom padding */}
        <div className="h-16" />
      </div>

      {/* Slide-out compliance panel */}
      <ComplianceSheet
        open={complianceOpen}
        onOpenChange={setComplianceOpen}
        insights={complianceInsights}
        loading={complianceLoading}
      />
    </>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-6 text-sm">
      <span className="min-w-[100px] pt-0.5 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className="flex-1 leading-relaxed text-foreground/90">{value}</span>
    </div>
  );
}

function ReviewerActions({
  onComplianceCheck,
  onApprove,
  onReturn,
  reviewer,
}: {
  onComplianceCheck: () => void;
  onApprove: () => void;
  onReturn: () => void;
  reviewer?: { name: string; initials: string; avatarColor: string };
}) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onComplianceCheck}
        className="gap-1.5"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Run AI Compliance Check
      </Button>
      <Button variant="ghost" size="sm" onClick={onReturn}>
        Return
      </Button>
      <Button size="sm" onClick={onApprove}>
        Approve
      </Button>
    </>
  );
}

function buildWorkpaperContent(
  workpaper: Workpaper,
  notes: string,
  finding: DraftedFinding | null
): string {
  const parts = [
    `TITLE: ${workpaper.title}`,
    `REFERENCE: ${workpaper.reference}`,
    `OBJECTIVE: ${workpaper.objective}`,
    `SCOPE: ${workpaper.scope}`,
    ``,
    `FIELDWORK NOTES:`,
    notes,
  ];
  if (finding) {
    parts.push(
      ``,
      `DRAFTED FINDING:`,
      `Condition: ${finding.condition}`,
      `Criteria: ${finding.criteria}`,
      `Cause: ${finding.cause}`,
      `Effect: ${finding.effect}`,
      `Recommendation: ${finding.recommendation}`,
      `Risk: ${finding.risk}`
    );
  }
  return parts.join("\n");
}
