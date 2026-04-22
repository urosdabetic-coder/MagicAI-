export type AuditStatus = "planning" | "fieldwork" | "review" | "reporting" | "closed";

export type WorkpaperStatus = "draft" | "in_review" | "approved" | "returned";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Auditor {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
}

export interface Audit {
  id: string;
  title: string;
  code: string;
  description: string;
  status: AuditStatus;
  risk: RiskLevel;
  progress: number;
  workpaperCount: number;
  completedWorkpapers: number;
  findingsCount: number;
  dueDate: string;
  team: Auditor[];
  domain: string;
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

export interface ComplianceInsight {
  id: string;
  severity: "success" | "warning" | "error" | "info";
  category: string;
  title: string;
  description: string;
  reference?: string;
}
