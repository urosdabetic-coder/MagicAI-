import type { Audit, Auditor, Workpaper } from "@/types";

export const auditors: Auditor[] = [
  { id: "u1", name: "Sarah Chen", initials: "SC", avatarColor: "bg-zinc-900" },
  { id: "u2", name: "Marcus Weber", initials: "MW", avatarColor: "bg-zinc-700" },
  { id: "u3", name: "Priya Shah", initials: "PS", avatarColor: "bg-zinc-800" },
  { id: "u4", name: "Julien Roux", initials: "JR", avatarColor: "bg-zinc-600" },
  { id: "u5", name: "Elena Ricci", initials: "ER", avatarColor: "bg-zinc-900" },
];

export const audits: Audit[] = [
  {
    id: "aud-2026-001",
    title: "Q3 Financial Review",
    code: "FIN-Q3-26",
    description: "Quarterly close controls, revenue recognition, and journal entry testing across group entities.",
    status: "fieldwork",
    risk: "high",
    progress: 62,
    workpaperCount: 24,
    completedWorkpapers: 15,
    findingsCount: 3,
    dueDate: "May 18, 2026",
    team: [auditors[0], auditors[1], auditors[3]],
    domain: "Finance",
  },
  {
    id: "aud-2026-002",
    title: "IT Security Audit",
    code: "ITS-26-02",
    description: "Identity & access management, privileged account review, and SOC 2 Type II readiness assessment.",
    status: "review",
    risk: "critical",
    progress: 84,
    workpaperCount: 31,
    completedWorkpapers: 28,
    findingsCount: 7,
    dueDate: "May 04, 2026",
    team: [auditors[2], auditors[4]],
    domain: "Technology",
  },
  {
    id: "aud-2026-003",
    title: "Procurement & Vendor Risk",
    code: "PRC-26-01",
    description: "Third-party risk assessment, vendor onboarding controls, and segregation of duties review.",
    status: "fieldwork",
    risk: "medium",
    progress: 41,
    workpaperCount: 18,
    completedWorkpapers: 7,
    findingsCount: 1,
    dueDate: "June 02, 2026",
    team: [auditors[1], auditors[3]],
    domain: "Operations",
  },
  {
    id: "aud-2026-004",
    title: "GDPR Data Processing Review",
    code: "PRV-26-01",
    description: "Data subject rights, processing records (Art. 30), and cross-border transfer mechanisms.",
    status: "planning",
    risk: "high",
    progress: 12,
    workpaperCount: 14,
    completedWorkpapers: 2,
    findingsCount: 0,
    dueDate: "July 11, 2026",
    team: [auditors[2], auditors[0]],
    domain: "Compliance",
  },
  {
    id: "aud-2026-005",
    title: "Treasury & Cash Management",
    code: "TRS-26-01",
    description: "Bank reconciliations, FX hedging policy compliance, and liquidity forecasting controls.",
    status: "reporting",
    risk: "medium",
    progress: 96,
    workpaperCount: 11,
    completedWorkpapers: 11,
    findingsCount: 2,
    dueDate: "Apr 29, 2026",
    team: [auditors[4]],
    domain: "Finance",
  },
  {
    id: "aud-2026-006",
    title: "Payroll Controls Assessment",
    code: "HRP-26-01",
    description: "Payroll authorization, termination workflow, and overtime approval controls.",
    status: "closed",
    risk: "low",
    progress: 100,
    workpaperCount: 9,
    completedWorkpapers: 9,
    findingsCount: 1,
    dueDate: "Mar 22, 2026",
    team: [auditors[3], auditors[1]],
    domain: "Human Resources",
  },
];

export const workpapers: Workpaper[] = [
  {
    id: "wp-001",
    auditId: "aud-2026-002",
    auditTitle: "IT Security Audit",
    title: "Privileged Access Review — Production Systems",
    reference: "ITS-26-02 / WP-014",
    status: "in_review",
    owner: auditors[2],
    reviewer: auditors[0],
    updatedAt: "2 hours ago",
    objective:
      "Evaluate whether privileged access to production systems is granted, monitored, and revoked in accordance with policy ITS-POL-004.",
    scope:
      "All Tier-1 production systems (ERP, HRIS, CRM, core banking platform) for the period 01-Jan-2026 to 31-Mar-2026. Population: 142 privileged accounts.",
    rawNotes: `Walkthrough with Platform Security team on 14-Apr-2026.

Tested a sample of 25 privileged account grants from a population of 142. Selected using random sampling.

Findings so far:
- 3 of 25 accounts lacked documented business justification in ServiceNow ticket
- 1 account belonged to a terminated employee (last login 12-Feb, termination 08-Feb)
- Quarterly access recertification was completed in Q1, but evidence of reviewer sign-off is inconsistent across the 4 system owners

Policy requires:
- Documented justification for all privileged grants
- Removal within 24h of termination
- Quarterly recertification signed by system owner

Root cause discussion with Head of IT Security: off-boarding workflow relies on manual HR notification. No automated trigger from HRIS to IAM.`,
  },
  {
    id: "wp-002",
    auditId: "aud-2026-001",
    auditTitle: "Q3 Financial Review",
    title: "Revenue Recognition — Multi-Element Arrangements",
    reference: "FIN-Q3-26 / WP-008",
    status: "draft",
    owner: auditors[0],
    updatedAt: "Yesterday",
    objective:
      "Test whether revenue from multi-element software + services contracts is recognized in accordance with IFRS 15 performance obligations.",
    scope:
      "Sample of 15 contracts signed in Q3 with TCV > €250k across EMEA and APAC regions.",
    rawNotes: "",
  },
  {
    id: "wp-003",
    auditId: "aud-2026-002",
    auditTitle: "IT Security Audit",
    title: "MFA Enforcement Across Cloud Tenants",
    reference: "ITS-26-02 / WP-021",
    status: "approved",
    owner: auditors[4],
    reviewer: auditors[0],
    updatedAt: "3 days ago",
    objective: "Verify MFA is enforced for all user accounts across Azure AD and AWS IAM tenants.",
    scope: "All production cloud tenants as of 31-Mar-2026.",
    rawNotes: "All controls operating effectively. No exceptions noted.",
  },
];

export function getAuditById(id: string): Audit | undefined {
  return audits.find((a) => a.id === id);
}

export function getWorkpaperById(id: string): Workpaper | undefined {
  return workpapers.find((w) => w.id === id);
}
