export type AuditStatus = "planning" | "fieldwork" | "review" | "reporting" | "closed";

export type WorkpaperStatus = "draft" | "in_review" | "approved" | "returned";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type TeamRole = "lead" | "auditor" | "reviewer" | "auditee" | "observer";

export type FindingStatus = "open" | "accepted" | "in_remediation" | "closed";

export interface Auditor {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  title?: string;
  email?: string;
}

export interface TeamMember {
  auditor: Auditor;
  role: TeamRole;
}

export interface Audit {
  id: string;
  title: string;
  code: string;
  description: string;
  /** High-level scope boundary (entities, period, population). */
  scope?: string;
  /** Audit objectives as free-form bullets. */
  objectives?: string[];
  status: AuditStatus;
  risk: RiskLevel;
  progress: number;
  workpaperCount: number;
  completedWorkpapers: number;
  findingsCount: number;
  /** Human-readable due date for display. */
  dueDate: string;
  /** Team members with roles. */
  team: TeamMember[];
  domain: string;
  createdAt?: string;
}

export interface Workpaper {
  id: string;
  auditId: string;
  auditTitle: string;
  title: string;
  reference: string;
  status: WorkpaperStatus;
  owner: Auditor;
  reviewer?: Auditor;
  updatedAt: string;
  objective: string;
  scope: string;
  rawNotes: string;
  draftedFinding?: DraftedFinding;
}

export interface DraftedFinding {
  condition: string;
  criteria: string;
  cause: string;
  effect: string;
  recommendation: string;
  risk: RiskLevel;
  generatedAt: string;
}

/**
 * A Finding promoted from a DraftedFinding into a tracked, first-class entity.
 * Lives independently of its originating workpaper so it can be aggregated
 * across an audit and across the whole organization.
 */
export interface Finding {
  id: string;
  auditId: string;
  workpaperId?: string;
  title: string;
  condition: string;
  criteria: string;
  cause: string;
  effect: string;
  recommendation: string;
  severity: RiskLevel;
  status: FindingStatus;
  owner?: Auditor;
  dueDate?: string;
  managementResponse?: string;
  createdAt: string;
}

export interface ComplianceInsight {
  id: string;
  severity: "success" | "warning" | "error" | "info";
  category: string;
  title: string;
  description: string;
  reference?: string;
}

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  lead: "Lead Auditor",
  auditor: "Auditor",
  reviewer: "Reviewer",
  auditee: "Auditee",
  observer: "Observer",
};

export const SEVERITY_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const FINDING_STATUS_LABELS: Record<FindingStatus, string> = {
  open: "Open",
  accepted: "Accepted",
  in_remediation: "In Remediation",
  closed: "Closed",
};
