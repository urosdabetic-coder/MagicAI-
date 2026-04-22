"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import type { Audit, WorkpaperStatus } from "@/types";
import { useAuditStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/workpaper/status-badge";
import { cn } from "@/lib/utils";

export function AuditWorkpapersTab({ audit }: { audit: Audit }) {
  const workpapers = useAuditStore((s) =>
    s.workpapers.filter((w) => w.auditId === audit.id)
  );
  const createWorkpaper = useAuditStore((s) => s.createWorkpaper);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [scope, setScope] = useState("");
  const [ownerId, setOwnerId] = useState(audit.team[0]?.auditor.id ?? "");
  const [reviewerId, setReviewerId] = useState<string>("");

  const [filter, setFilter] = useState<"all" | WorkpaperStatus>("all");

  const filtered =
    filter === "all" ? workpapers : workpapers.filter((w) => w.status === filter);

  function resetForm() {
    setTitle("");
    setObjective("");
    setScope("");
    setOwnerId(audit.team[0]?.auditor.id ?? "");
    setReviewerId("");
  }

  function handleCreate() {
    if (!title.trim() || !objective.trim() || !ownerId) return;
    const wp = createWorkpaper({
      auditId: audit.id,
      title: title.trim(),
      objective: objective.trim(),
      scope: scope.trim(),
      ownerId,
      reviewerId: reviewerId || undefined,
    });
    setOpen(false);
    resetForm();
    // Optional: could router.push(`/workpapers/${wp.id}`) — left on this tab for context.
    void wp;
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Workpapers</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Evidence and test work for this audit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="h-8 w-36 text-xs"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="returned">Returned</option>
          </Select>
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5" disabled={audit.team.length === 0}>
                <Plus className="h-3.5 w-3.5" />
                New workpaper
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New workpaper</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="wp-title">Title</Label>
                  <Input
                    id="wp-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Revenue Recognition — Sample of 15 Contracts"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wp-objective">Objective</Label>
                  <Textarea
                    id="wp-objective"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="What is this workpaper testing?"
                    className="min-h-[70px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wp-scope">Scope</Label>
                  <Textarea
                    id="wp-scope"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    placeholder="Population, period, sample selection."
                    className="min-h-[70px]"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="wp-owner">Owner</Label>
                    <Select
                      id="wp-owner"
                      value={ownerId}
                      onChange={(e) => setOwnerId(e.target.value)}
                    >
                      <option value="">Select…</option>
                      {audit.team.map((m) => (
                        <option key={m.auditor.id} value={m.auditor.id}>
                          {m.auditor.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="wp-reviewer">Reviewer (optional)</Label>
                    <Select
                      id="wp-reviewer"
                      value={reviewerId}
                      onChange={(e) => setReviewerId(e.target.value)}
                    >
                      <option value="">None</option>
                      {audit.team.map((m) => (
                        <option key={m.auditor.id} value={m.auditor.id}>
                          {m.auditor.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!title.trim() || !objective.trim() || !ownerId}
                  onClick={handleCreate}
                >
                  Create workpaper
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center">
            <FileText className="mx-auto h-5 w-5 text-muted-foreground/60" />
            <p className="mt-2 text-xs text-muted-foreground">
              {workpapers.length === 0
                ? "No workpapers yet. Create one to start fieldwork."
                : "No workpapers match this filter."}
            </p>
          </div>
        ) : (
          filtered.map((w) => (
            <Link
              key={w.id}
              href={`/workpapers/${w.id}`}
              className="group block rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-border hover:bg-accent/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                    <span className="font-mono">{w.reference}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium">{w.title}</p>
                </div>
                <StatusBadge status={w.status} />
                <Avatar className="h-6 w-6">
                  <AvatarFallback
                    className={cn(w.owner.avatarColor, "text-[9px] font-semibold text-white")}
                    title={w.owner.name}
                  >
                    {w.owner.initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
