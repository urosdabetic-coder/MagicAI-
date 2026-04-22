"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, Trash2, UserPlus2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  TEAM_ROLE_LABELS,
  type RiskLevel,
  type TeamRole,
} from "@/types";
import { useAuditStore } from "@/lib/store";

interface NewAuditDialogProps {
  trigger?: React.ReactNode;
}

interface TeamDraft {
  auditorId: string;
  role: TeamRole;
}

const DOMAINS = [
  "Finance",
  "Technology",
  "Operations",
  "Compliance",
  "Human Resources",
  "Strategy",
  "Other",
];

export function NewAuditDialog({ trigger }: NewAuditDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const auditors = useAuditStore((s) => s.auditors);
  const createAudit = useAuditStore((s) => s.createAudit);

  // Form state
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("");
  const [objectives, setObjectives] = useState<string[]>([""]);
  const [risk, setRisk] = useState<RiskLevel>("medium");
  const [dueDate, setDueDate] = useState("");
  const [team, setTeam] = useState<TeamDraft[]>([]);

  // AI planning state
  const [planning, setPlanning] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && code.trim().length > 0 && dueDate.trim().length > 0;

  const availableForAdd = useMemo(
    () =>
      auditors.filter((a) => !team.some((t) => t.auditorId === a.id)),
    [auditors, team]
  );

  function resetForm() {
    setTitle("");
    setCode("");
    setDomain(DOMAINS[0]);
    setDescription("");
    setScope("");
    setObjectives([""]);
    setRisk("medium");
    setDueDate("");
    setTeam([]);
    setPlanError(null);
  }

  function handleAddMember() {
    if (availableForAdd.length === 0) return;
    // Default the very first member to "lead", everyone after to "auditor"
    const nextRole: TeamRole = team.length === 0 ? "lead" : "auditor";
    setTeam([...team, { auditorId: availableForAdd[0].id, role: nextRole }]);
  }

  function handleUpdateMember(index: number, patch: Partial<TeamDraft>) {
    setTeam(team.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function handleRemoveMember(index: number) {
    setTeam(team.filter((_, i) => i !== index));
  }

  function handleAddObjective() {
    setObjectives([...objectives, ""]);
  }

  function handleUpdateObjective(index: number, value: string) {
    setObjectives(objectives.map((o, i) => (i === index ? value : o)));
  }

  function handleRemoveObjective(index: number) {
    setObjectives(objectives.filter((_, i) => i !== index));
  }

  async function handleSuggestWithAI() {
    if (!scope.trim() || scope.trim().length < 20) {
      setPlanError("Please write at least a short scope description first.");
      return;
    }
    setPlanning(true);
    setPlanError(null);
    try {
      const res = await fetch("/api/ai/audit-planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, domain, scope }),
      });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.objectives) && data.objectives.length > 0) {
          setObjectives(data.objectives);
        }
        if (data.suggestedRisk) {
          setRisk(data.suggestedRisk as RiskLevel);
        }
        if (data.suggestedCode && !code) {
          setCode(data.suggestedCode);
        }
      } else {
        setPlanError(data.error ?? "AI planning failed.");
      }
    } catch (e) {
      setPlanError("Network error contacting AI planning endpoint.");
    } finally {
      setPlanning(false);
    }
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const audit = createAudit({
      title: title.trim(),
      code: code.trim(),
      domain,
      description: description.trim(),
      scope: scope.trim() || undefined,
      objectives: objectives.map((o) => o.trim()).filter(Boolean),
      risk,
      dueDate: dueDate.trim(),
      team,
    });
    setOpen(false);
    resetForm();
    router.push(`/audits/${audit.id}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>New audit</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a new audit</DialogTitle>
          <DialogDescription>
            Define scope and objectives, assemble your team, and open the engagement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Basics */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="audit-title">Title</Label>
              <Input
                id="audit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 Revenue Recognition Audit"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-code">Audit code</Label>
              <Input
                id="audit-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="FIN-Q4-26"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-domain">Domain</Label>
              <Select
                id="audit-domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-risk">Inherent risk</Label>
              <Select
                id="audit-risk"
                value={risk}
                onChange={(e) => setRisk(e.target.value as RiskLevel)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="audit-due">Due date</Label>
              <Input
                id="audit-due"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="e.g. Aug 15, 2026"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="audit-description">Short description</Label>
            <Textarea
              id="audit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One or two sentences that appear on the audit card."
              className="min-h-[70px]"
            />
          </div>

          {/* Scope + AI assist */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="audit-scope">Scope</Label>
              <button
                type="button"
                onClick={handleSuggestWithAI}
                disabled={planning || scope.trim().length < 20}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground transition-all",
                  "hover:border-foreground/40 hover:bg-muted hover:text-foreground",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <Sparkles className="h-3 w-3" />
                {planning ? "Thinking…" : "Suggest objectives with AI"}
              </button>
            </div>
            <Textarea
              id="audit-scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Entities, period, population boundaries. The AI uses this to suggest audit objectives."
              className="min-h-[90px]"
            />
            {planError && <p className="text-[11px] text-red-600">{planError}</p>}
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Objectives</Label>
              <button
                type="button"
                onClick={handleAddObjective}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                + Add objective
              </button>
            </div>
            <div className="space-y-2">
              {objectives.map((obj, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="mt-2 font-mono text-[10px] text-muted-foreground tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <Input
                    value={obj}
                    onChange={(e) => handleUpdateObjective(idx, e.target.value)}
                    placeholder="e.g. Evaluate design effectiveness of …"
                    className="flex-1"
                  />
                  {objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(idx)}
                      className="mt-1.5 text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Team</Label>
              <button
                type="button"
                onClick={handleAddMember}
                disabled={availableForAdd.length === 0}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                <UserPlus2 className="h-3 w-3" />
                Add member
              </button>
            </div>
            {team.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center">
                <p className="text-xs text-muted-foreground">
                  No team members yet. Add at least a Lead Auditor.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {team.map((m, idx) => {
                  const auditor = auditors.find((a) => a.id === m.auditorId);
                  if (!auditor) return null;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback
                          className={cn(
                            auditor.avatarColor,
                            "text-[10px] font-semibold text-white"
                          )}
                        >
                          {auditor.initials}
                        </AvatarFallback>
                      </Avatar>
                      <Select
                        value={m.auditorId}
                        onChange={(e) => handleUpdateMember(idx, { auditorId: e.target.value })}
                        className="h-8 flex-1 text-xs"
                      >
                        {auditors
                          .filter(
                            (a) =>
                              a.id === m.auditorId ||
                              !team.some((t) => t.auditorId === a.id)
                          )
                          .map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                              {a.title ? ` — ${a.title}` : ""}
                            </option>
                          ))}
                      </Select>
                      <Select
                        value={m.role}
                        onChange={(e) =>
                          handleUpdateMember(idx, { role: e.target.value as TeamRole })
                        }
                        className="h-8 w-36 text-xs"
                      >
                        {Object.entries(TEAM_ROLE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={!canSubmit} onClick={handleSubmit}>
            Create audit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
