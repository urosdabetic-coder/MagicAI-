"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import type { Audit } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useAuditStore } from "@/lib/store";

export function AuditOverviewTab({ audit }: { audit: Audit }) {
  const updateAudit = useAuditStore((s) => s.updateAudit);
  const setAuditStatus = useAuditStore((s) => s.setAuditStatus);

  const [editingScope, setEditingScope] = useState(false);
  const [scopeDraft, setScopeDraft] = useState(audit.scope ?? "");

  const [editingObjectives, setEditingObjectives] = useState(false);
  const [objectivesDraft, setObjectivesDraft] = useState(
    (audit.objectives ?? []).join("\n")
  );

  function saveScope() {
    updateAudit(audit.id, { scope: scopeDraft.trim() });
    setEditingScope(false);
  }

  function saveObjectives() {
    const list = objectivesDraft
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    updateAudit(audit.id, { objectives: list });
    setEditingObjectives(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        {/* Scope */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Scope</h2>
            {!editingScope ? (
              <button
                onClick={() => {
                  setScopeDraft(audit.scope ?? "");
                  setEditingScope(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => setEditingScope(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" onClick={saveScope}>
                  <Check className="h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            )}
          </div>
          {editingScope ? (
            <Textarea
              value={scopeDraft}
              onChange={(e) => setScopeDraft(e.target.value)}
              className="mt-3 min-h-[120px]"
              placeholder="Describe entities, period, and population boundaries."
            />
          ) : audit.scope ? (
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">{audit.scope}</p>
          ) : (
            <p className="mt-3 text-sm italic text-muted-foreground">
              No scope defined. Click Edit to add one.
            </p>
          )}
        </section>

        {/* Objectives */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Objectives</h2>
            {!editingObjectives ? (
              <button
                onClick={() => {
                  setObjectivesDraft((audit.objectives ?? []).join("\n"));
                  setEditingObjectives(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => setEditingObjectives(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" onClick={saveObjectives}>
                  <Check className="h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            )}
          </div>
          {editingObjectives ? (
            <div className="mt-3 space-y-1.5">
              <Textarea
                value={objectivesDraft}
                onChange={(e) => setObjectivesDraft(e.target.value)}
                className="min-h-[140px]"
                placeholder="One objective per line."
              />
              <p className="text-[11px] text-muted-foreground">
                One objective per line. Start with a verb (Evaluate, Test, Assess…).
              </p>
            </div>
          ) : audit.objectives && audit.objectives.length > 0 ? (
            <ol className="mt-3 space-y-2">
              {audit.objectives.map((o, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm leading-relaxed text-foreground/90"
                >
                  <span className="mt-0.5 font-mono text-[10px] text-muted-foreground tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span>{o}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm italic text-muted-foreground">
              No objectives defined. Click Edit to add some.
            </p>
          )}
        </section>
      </div>

      {/* Sidebar stats */}
      <aside className="space-y-6">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Status
          </h3>
          <Select
            value={audit.status}
            onChange={(e) => setAuditStatus(audit.id, e.target.value as Audit["status"])}
            className="mt-3 text-xs"
          >
            <option value="planning">Planning</option>
            <option value="fieldwork">Fieldwork</option>
            <option value="review">In Review</option>
            <option value="reporting">Reporting</option>
            <option value="closed">Closed</option>
          </Select>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Progress
          </h3>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-semibold tabular-nums">
              {audit.progress}%
            </span>
            <span className="text-[11px] text-muted-foreground">
              {audit.completedWorkpapers} / {audit.workpaperCount} approved
            </span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-500"
              style={{ width: `${audit.progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Key dates
          </h3>
          <dl className="mt-3 space-y-2 text-xs">
            {audit.createdAt && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-mono tabular-nums">{audit.createdAt.slice(0, 10)}</dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Due</dt>
              <dd className="font-medium">{audit.dueDate}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
