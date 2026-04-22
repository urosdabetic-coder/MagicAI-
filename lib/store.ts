"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Audit,
  AuditStatus,
  Auditor,
  Finding,
  FindingStatus,
  RiskLevel,
  TeamMember,
  TeamRole,
  Workpaper,
  WorkpaperStatus,
  DraftedFinding,
} from "@/types";
import {
  audits as seedAudits,
  auditors as seedAuditors,
  findings as seedFindings,
  workpapers as seedWorkpapers,
} from "./mock-data";

/**
 * Central client-side state. Swap this out for a real API/DB layer later by
 * replacing the action bodies — the shape of selectors stays stable.
 *
 * `persist` writes to localStorage so reloading a tab preserves your edits.
 */

const AVATAR_PALETTE = [
  "bg-zinc-900",
  "bg-zinc-700",
  "bg-zinc-800",
  "bg-zinc-600",
];

interface NewAuditInput {
  title: string;
  code: string;
  domain: string;
  description: string;
  scope?: string;
  objectives?: string[];
  risk: RiskLevel;
  dueDate: string;
  team: Array<{ auditorId: string; role: TeamRole }>;
}

interface NewWorkpaperInput {
  auditId: string;
  title: string;
  reference?: string;
  objective: string;
  scope: string;
  ownerId: string;
  reviewerId?: string;
}

interface AuditStoreState {
  // Entities
  audits: Audit[];
  workpapers: Workpaper[];
  auditors: Auditor[];
  findings: Finding[];

  // Getters
  getAudit: (id: string) => Audit | undefined;
  getWorkpaper: (id: string) => Workpaper | undefined;
  getAuditor: (id: string) => Auditor | undefined;
  getWorkpapersForAudit: (auditId: string) => Workpaper[];
  getFindingsForAudit: (auditId: string) => Finding[];

  // Audit actions
  createAudit: (input: NewAuditInput) => Audit;
  updateAudit: (id: string, patch: Partial<Audit>) => void;
  setAuditStatus: (id: string, status: AuditStatus) => void;
  deleteAudit: (id: string) => void;

  // Team actions
  addTeamMember: (auditId: string, auditorId: string, role: TeamRole) => void;
  updateTeamRole: (auditId: string, auditorId: string, role: TeamRole) => void;
  removeTeamMember: (auditId: string, auditorId: string) => void;

  // Auditor actions (pool management)
  addAuditor: (name: string, title?: string, email?: string) => Auditor;

  // Workpaper actions
  createWorkpaper: (input: NewWorkpaperInput) => Workpaper;
  updateWorkpaper: (id: string, patch: Partial<Workpaper>) => void;
  setWorkpaperStatus: (id: string, status: WorkpaperStatus) => void;
  saveWorkpaperNotes: (id: string, rawNotes: string) => void;
  saveDraftedFinding: (workpaperId: string, drafted: DraftedFinding) => void;

  // Finding actions
  promoteDraftToFinding: (workpaperId: string) => Finding | undefined;
  updateFinding: (id: string, patch: Partial<Finding>) => void;
  setFindingStatus: (id: string, status: FindingStatus) => void;
  deleteFinding: (id: string) => void;

  // Utilities
  reset: () => void;
}

function deriveInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function randomAvatarColor(): string {
  return AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)];
}

function nowIso(): string {
  return new Date().toISOString();
}

function nextId(prefix: string, existing: string[]): string {
  // Find the highest numeric suffix and increment. Falls back to timestamp if
  // existing IDs don't follow the expected pattern.
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  let max = 0;
  for (const id of existing) {
    const m = id.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  if (max === 0) return `${prefix}-${Date.now()}`;
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

function recomputeAuditCounts(audit: Audit, workpapers: Workpaper[], findings: Finding[]): Audit {
  const wps = workpapers.filter((w) => w.auditId === audit.id);
  const completed = wps.filter((w) => w.status === "approved").length;
  const fns = findings.filter((f) => f.auditId === audit.id);
  return {
    ...audit,
    workpaperCount: wps.length,
    completedWorkpapers: completed,
    findingsCount: fns.length,
    progress: wps.length === 0 ? audit.progress : Math.round((completed / wps.length) * 100),
  };
}

export const useAuditStore = create<AuditStoreState>()(
  persist(
    (set, get) => ({
      audits: seedAudits,
      workpapers: seedWorkpapers,
      auditors: seedAuditors,
      findings: seedFindings,

      getAudit: (id) => get().audits.find((a) => a.id === id),
      getWorkpaper: (id) => get().workpapers.find((w) => w.id === id),
      getAuditor: (id) => get().auditors.find((a) => a.id === id),
      getWorkpapersForAudit: (auditId) =>
        get().workpapers.filter((w) => w.auditId === auditId),
      getFindingsForAudit: (auditId) =>
        get().findings.filter((f) => f.auditId === auditId),

      // ---------- Audit actions ----------
      createAudit: (input) => {
        const id = nextId("aud-2026", get().audits.map((a) => a.id));
        const audit: Audit = {
          id,
          title: input.title,
          code: input.code,
          domain: input.domain,
          description: input.description,
          scope: input.scope,
          objectives: input.objectives ?? [],
          status: "planning",
          risk: input.risk,
          progress: 0,
          workpaperCount: 0,
          completedWorkpapers: 0,
          findingsCount: 0,
          dueDate: input.dueDate,
          team: input.team
            .map((t) => {
              const auditor = get().auditors.find((a) => a.id === t.auditorId);
              if (!auditor) return null;
              return { auditor, role: t.role } satisfies TeamMember;
            })
            .filter((t): t is TeamMember => t !== null),
          createdAt: nowIso(),
        };
        set((s) => ({ audits: [audit, ...s.audits] }));
        return audit;
      },

      updateAudit: (id, patch) =>
        set((s) => ({
          audits: s.audits.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      setAuditStatus: (id, status) =>
        set((s) => ({
          audits: s.audits.map((a) => (a.id === id ? { ...a, status } : a)),
        })),

      deleteAudit: (id) =>
        set((s) => ({
          audits: s.audits.filter((a) => a.id !== id),
          workpapers: s.workpapers.filter((w) => w.auditId !== id),
          findings: s.findings.filter((f) => f.auditId !== id),
        })),

      // ---------- Team actions ----------
      addTeamMember: (auditId, auditorId, role) =>
        set((s) => ({
          audits: s.audits.map((a) => {
            if (a.id !== auditId) return a;
            if (a.team.some((m) => m.auditor.id === auditorId)) return a; // no dupes
            const auditor = s.auditors.find((x) => x.id === auditorId);
            if (!auditor) return a;
            return { ...a, team: [...a.team, { auditor, role }] };
          }),
        })),

      updateTeamRole: (auditId, auditorId, role) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === auditId
              ? {
                  ...a,
                  team: a.team.map((m) =>
                    m.auditor.id === auditorId ? { ...m, role } : m
                  ),
                }
              : a
          ),
        })),

      removeTeamMember: (auditId, auditorId) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === auditId
              ? { ...a, team: a.team.filter((m) => m.auditor.id !== auditorId) }
              : a
          ),
        })),

      // ---------- Auditor pool ----------
      addAuditor: (name, title, email) => {
        const id = nextId("u", get().auditors.map((a) => a.id));
        const auditor: Auditor = {
          id,
          name,
          initials: deriveInitials(name),
          avatarColor: randomAvatarColor(),
          title,
          email,
        };
        set((s) => ({ auditors: [...s.auditors, auditor] }));
        return auditor;
      },

      // ---------- Workpaper actions ----------
      createWorkpaper: (input) => {
        const id = nextId("wp", get().workpapers.map((w) => w.id));
        const audit = get().audits.find((a) => a.id === input.auditId);
        if (!audit) throw new Error(`Audit not found: ${input.auditId}`);
        const owner = get().auditors.find((a) => a.id === input.ownerId);
        if (!owner) throw new Error(`Owner not found: ${input.ownerId}`);
        const reviewer = input.reviewerId
          ? get().auditors.find((a) => a.id === input.reviewerId)
          : undefined;

        // Auto-reference if not provided: e.g. "ITS-26-02 / WP-025"
        const existingForAudit = get().workpapers.filter(
          (w) => w.auditId === audit.id
        ).length;
        const reference =
          input.reference ??
          `${audit.code} / WP-${String(existingForAudit + 1).padStart(3, "0")}`;

        const wp: Workpaper = {
          id,
          auditId: audit.id,
          auditTitle: audit.title,
          title: input.title,
          reference,
          status: "draft",
          owner,
          reviewer,
          updatedAt: "Just now",
          objective: input.objective,
          scope: input.scope,
          rawNotes: "",
        };
        set((s) => {
          const workpapers = [wp, ...s.workpapers];
          const audits = s.audits.map((a) =>
            a.id === audit.id ? recomputeAuditCounts(a, workpapers, s.findings) : a
          );
          return { workpapers, audits };
        });
        return wp;
      },

      updateWorkpaper: (id, patch) =>
        set((s) => ({
          workpapers: s.workpapers.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        })),

      setWorkpaperStatus: (id, status) =>
        set((s) => {
          const workpapers = s.workpapers.map((w) =>
            w.id === id ? { ...w, status, updatedAt: "Just now" } : w
          );
          const audits = s.audits.map((a) =>
            recomputeAuditCounts(a, workpapers, s.findings)
          );
          return { workpapers, audits };
        }),

      saveWorkpaperNotes: (id, rawNotes) =>
        set((s) => ({
          workpapers: s.workpapers.map((w) =>
            w.id === id ? { ...w, rawNotes, updatedAt: "Just now" } : w
          ),
        })),

      saveDraftedFinding: (workpaperId, drafted) =>
        set((s) => ({
          workpapers: s.workpapers.map((w) =>
            w.id === workpaperId ? { ...w, draftedFinding: drafted } : w
          ),
        })),

      // ---------- Finding actions ----------
      promoteDraftToFinding: (workpaperId) => {
        const wp = get().workpapers.find((w) => w.id === workpaperId);
        if (!wp || !wp.draftedFinding) return undefined;
        const id = nextId("fnd", get().findings.map((f) => f.id));
        const finding: Finding = {
          id,
          auditId: wp.auditId,
          workpaperId: wp.id,
          title: wp.title,
          condition: wp.draftedFinding.condition,
          criteria: wp.draftedFinding.criteria,
          cause: wp.draftedFinding.cause,
          effect: wp.draftedFinding.effect,
          recommendation: wp.draftedFinding.recommendation,
          severity: wp.draftedFinding.risk,
          status: "open",
          owner: wp.owner,
          createdAt: nowIso(),
        };
        set((s) => {
          const findings = [finding, ...s.findings];
          const audits = s.audits.map((a) =>
            recomputeAuditCounts(a, s.workpapers, findings)
          );
          return { findings, audits };
        });
        return finding;
      },

      updateFinding: (id, patch) =>
        set((s) => ({
          findings: s.findings.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),

      setFindingStatus: (id, status) =>
        set((s) => ({
          findings: s.findings.map((f) => (f.id === id ? { ...f, status } : f)),
        })),

      deleteFinding: (id) =>
        set((s) => {
          const findings = s.findings.filter((f) => f.id !== id);
          const audits = s.audits.map((a) =>
            recomputeAuditCounts(a, s.workpapers, findings)
          );
          return { findings, audits };
        }),

      reset: () =>
        set({
          audits: seedAudits,
          workpapers: seedWorkpapers,
          auditors: seedAuditors,
          findings: seedFindings,
        }),
    }),
    {
      name: "auditflow-store-v1",
      // Only persist the mutable data. Re-seed on schema bump by changing the name.
      partialize: (s) => ({
        audits: s.audits,
        workpapers: s.workpapers,
        auditors: s.auditors,
        findings: s.findings,
      }),
    }
  )
);
