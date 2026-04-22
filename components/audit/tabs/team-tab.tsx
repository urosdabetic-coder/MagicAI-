"use client";

import { useState } from "react";
import { Trash2, UserPlus2 } from "lucide-react";
import type { Audit, TeamRole } from "@/types";
import { TEAM_ROLE_LABELS } from "@/types";
import { useAuditStore } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function AuditTeamTab({ audit }: { audit: Audit }) {
  const auditors = useAuditStore((s) => s.auditors);
  const addTeamMember = useAuditStore((s) => s.addTeamMember);
  const updateTeamRole = useAuditStore((s) => s.updateTeamRole);
  const removeTeamMember = useAuditStore((s) => s.removeTeamMember);
  const addAuditor = useAuditStore((s) => s.addAuditor);

  const [addingOpen, setAddingOpen] = useState(false);
  const [selectedAuditorId, setSelectedAuditorId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<TeamRole>("auditor");

  const [creatingAuditor, setCreatingAuditor] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const availableAuditors = auditors.filter(
    (a) => !audit.team.some((m) => m.auditor.id === a.id)
  );

  function handleAddExisting() {
    if (!selectedAuditorId) return;
    addTeamMember(audit.id, selectedAuditorId, selectedRole);
    setAddingOpen(false);
    setSelectedAuditorId("");
    setSelectedRole("auditor");
  }

  function handleCreateAndAdd() {
    if (!newName.trim()) return;
    const created = addAuditor(newName.trim(), newTitle.trim() || undefined, newEmail.trim() || undefined);
    addTeamMember(audit.id, created.id, selectedRole);
    setAddingOpen(false);
    setCreatingAuditor(false);
    setNewName("");
    setNewTitle("");
    setNewEmail("");
    setSelectedRole("auditor");
  }

  const roleOrder: TeamRole[] = ["lead", "reviewer", "auditor", "auditee", "observer"];
  const sortedTeam = [...audit.team].sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
  );

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Team members</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Assign auditors, reviewers, auditees, and observers. Every audit needs at least one Lead.
          </p>
        </div>
        <Dialog open={addingOpen} onOpenChange={setAddingOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <UserPlus2 className="h-3.5 w-3.5" />
              Add member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {creatingAuditor ? "Create and assign auditor" : "Add team member"}
              </DialogTitle>
            </DialogHeader>

            {creatingAuditor ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="new-name">Full name</Label>
                  <Input
                    id="new-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Anna Müller"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-title">Title (optional)</Label>
                  <Input
                    id="new-title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Senior IT Auditor"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-email">Email (optional)</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="anna.mueller@company.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-role">Role in this audit</Label>
                  <Select
                    id="new-role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                  >
                    {Object.entries(TEAM_ROLE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </div>
                <button
                  type="button"
                  onClick={() => setCreatingAuditor(false)}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  ← Pick from existing auditors
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {availableAuditors.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
                    All auditors are already on this team.
                  </p>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="pick-auditor">Auditor</Label>
                      <Select
                        id="pick-auditor"
                        value={selectedAuditorId}
                        onChange={(e) => setSelectedAuditorId(e.target.value)}
                      >
                        <option value="">Select…</option>
                        {availableAuditors.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                            {a.title ? ` — ${a.title}` : ""}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pick-role">Role in this audit</Label>
                      <Select
                        id="pick-role"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                      >
                        {Object.entries(TEAM_ROLE_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setCreatingAuditor(true)}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  + Invite someone new to the auditor pool
                </button>
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" size="sm" onClick={() => setAddingOpen(false)}>
                Cancel
              </Button>
              {creatingAuditor ? (
                <Button size="sm" disabled={!newName.trim()} onClick={handleCreateAndAdd}>
                  Create & add
                </Button>
              ) : (
                <Button size="sm" disabled={!selectedAuditorId} onClick={handleAddExisting}>
                  Add to team
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 space-y-2">
        {sortedTeam.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center">
            <p className="text-xs text-muted-foreground">No team members yet.</p>
          </div>
        ) : (
          sortedTeam.map((m) => (
            <div
              key={m.auditor.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback
                  className={cn(m.auditor.avatarColor, "text-xs font-semibold text-white")}
                >
                  {m.auditor.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{m.auditor.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.auditor.title || m.auditor.email || "—"}
                </p>
              </div>
              <Select
                value={m.role}
                onChange={(e) =>
                  updateTeamRole(audit.id, m.auditor.id, e.target.value as TeamRole)
                }
                className="h-8 w-40 text-xs"
              >
                {Object.entries(TEAM_ROLE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
              <button
                onClick={() => removeTeamMember(audit.id, m.auditor.id)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                aria-label="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
