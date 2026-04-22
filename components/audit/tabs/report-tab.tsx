"use client";

import { Download, FileCheck2, Sparkles } from "lucide-react";
import type { Audit } from "@/types";
import { useAuditStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function AuditReportTab({ audit }: { audit: Audit }) {
  const findings = useAuditStore((s) =>
    s.findings.filter((f) => f.auditId === audit.id)
  );

  function handleExportMarkdown() {
    const lines: string[] = [
      `# Audit Report — ${audit.title}`,
      ``,
      `**Code:** ${audit.code}  `,
      `**Domain:** ${audit.domain}  `,
      `**Status:** ${audit.status}  `,
      `**Risk:** ${audit.risk}  `,
      `**Due:** ${audit.dueDate}  `,
      ``,
      `## Description`,
      audit.description || "_No description._",
      ``,
      `## Scope`,
      audit.scope || "_No scope defined._",
      ``,
      `## Objectives`,
      ...((audit.objectives ?? []).length > 0
        ? audit.objectives!.map((o, i) => `${i + 1}. ${o}`)
        : ["_No objectives defined._"]),
      ``,
      `## Team`,
      ...audit.team.map((m) => `- **${m.role}** — ${m.auditor.name}`),
      ``,
      `## Findings (${findings.length})`,
      ``,
    ];

    if (findings.length === 0) {
      lines.push("_No findings._");
    } else {
      for (const f of findings) {
        lines.push(`### ${f.title}`);
        lines.push(`**Severity:** ${f.severity} · **Status:** ${f.status}`);
        lines.push("");
        lines.push(`**Condition.** ${f.condition}`);
        lines.push(`**Criteria.** ${f.criteria}`);
        lines.push(`**Cause.** ${f.cause}`);
        lines.push(`**Effect.** ${f.effect}`);
        lines.push(`**Recommendation.** ${f.recommendation}`);
        if (f.owner) lines.push(`**Owner:** ${f.owner.name}`);
        if (f.dueDate) lines.push(`**Due:** ${f.dueDate}`);
        lines.push("");
      }
    }

    const md = lines.join("\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${audit.code.replace(/\s+/g, "_")}-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Report</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Export the current state of this audit. AI-generated executive summary ships in Sprint 3.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="gap-1.5"
            title="Coming in Sprint 3"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate executive summary
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleExportMarkdown}>
            <Download className="h-3.5 w-3.5" />
            Export Markdown
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-card p-6">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold tracking-tight">Report preview</h3>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {audit.code} — {audit.title}
            </h4>
            <p className="mt-1 text-foreground/90">{audit.description}</p>
          </section>

          {audit.scope && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Scope
              </h4>
              <p className="mt-1 text-foreground/90">{audit.scope}</p>
            </section>
          )}

          {audit.objectives && audit.objectives.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Objectives
              </h4>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-foreground/90">
                {audit.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ol>
            </section>
          )}

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Findings summary
            </h4>
            {findings.length === 0 ? (
              <p className="mt-1 text-muted-foreground italic">No findings reported.</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {findings.map((f) => (
                  <li key={f.id} className="text-foreground/90">
                    <span className="font-medium">{f.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      [{f.severity}] — {f.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
