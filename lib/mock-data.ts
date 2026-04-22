import type { Audit, Auditor, Finding, TeamMember, Workpaper } from "@/types";

/**
 * Initial data seed. At runtime, the Zustand store owns the mutable copies.
 * These exports are now used ONLY:
 *   - to seed the store on first load, and
 *   - by API routes / utility code that just needs defaults.
 *
 * For components, always read from `useAuditStore()` instead.
 */

export const auditors: Auditor[] = [
  { id: "u1", name: "Sarah Chen", initials: "SC", avatarColor: "bg-zinc-900", title: "Audit Manager" },
  { id: "u2", name: "Marcus Weber", initials: "MW", avatarColor: "bg-zinc-700", title: "Senior Auditor" },
  { id: "u3", name: "Priya Shah", initials: "PS", avatarColor: "bg-zinc-800", title: "IT Audit Lead" },
  { id: "u4", name: "Julien Roux", initials: "JR", avatarColor: "bg-zinc-600", title: "Auditor" },
  { id: "u5", name: "Elena Ricci", initials: "ER", avatarColor: "bg-zinc-900", title: "Senior Auditor" },
  { id: "u6", name: "Daniel Ortiz", initials: "DO", avatarColor: "bg-zinc-700", title: "Auditor" },
  { id: "u7", name: "Aisha Kone", initials: "AK", avatarColor: "bg-zinc-800", title: "Compliance Specialist" },
  { id: "u8", name: "Tomás Lindqvist", initials: "TL", avatarColor: "bg-zinc-600", title: "Data Analyst" },
];

/** Convenience lookup. */
export function auditor(id: string): Auditor {
  const a = auditors.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown auditor id: ${id}`);
  return a;
}

function team(members: Array<[string, TeamMember["role"]]>): TeamMember[] {
  return members.map(([id, role]) => ({ auditor: auditor(id), role }));
}

export const audits: Audit[] = [
  {
    id: "aud-2026-001",
    title: "Q3 Financial Review",
    code: "FIN-Q3-26",
    description:
      "Quarterly close controls, revenue recognition, and journal entry testing across group entities.",
    scope:
      "Group close process for Q3 2026 across EMEA and APAC entities. Focus on revenue recognition, journal entries > €100k, and quarter-end accruals.",
    objectives: [
      "Evaluate design and operating effectiveness of Q3 close controls.",
      "Test revenue recognition against IFRS 15 performance obligations.",
      "Verify journal entry approval workflow and segregation of duties.",
    ],
    status: "fieldwork",
    risk: "high",
    progress: 62,
    workpaperCount: 24,
    completedWorkpapers: 15,
    findingsCount: 3,
    dueDate: "May 18, 2026",
    team: team([
      ["u1", "lead"],
      ["u2", "auditor"],
      ["u4", "auditor"],
    ]),
    domain: "Finance",
    createdAt: "2026-03-01",
  },
  {
    id: "aud-2026-002",
    title: "IT Security Audit",
    code: "ITS-26-02",
    description:
      "Identity & access management, privileged account review, and SOC 2 Type II readiness assessment.",
    scope:
      "All Tier-1 production systems (ERP, HRIS, CRM, core banking platform) for the period 01-Jan-2026 to 31-Mar-2026. Population: 142 privileged accounts.",
    objectives: [
      "Assess privileged access grant, monitoring, and revocation controls.",
      "Evaluate MFA coverage across cloud tenants.",
      "Confirm SOC 2 Type II readiness across the Trust Services Criteria.",
    ],
    status: "review",
    risk: "critical",
    progress: 84,
    workpaperCount: 31,
    completedWorkpapers: 28,
    findingsCount: 7,
    dueDate: "May 04, 2026",
    team: team([
      ["u3", "lead"],
      ["u5", "reviewer"],
      ["u8", "auditor"],
    ]),
    domain: "Technology",
    createdAt: "2026-02-10",
  },
  {
    id: "aud-2026-003",
    title: "Procurement & Vendor Risk",
    code: "PRC-26-01",
    description:
      "Third-party risk assessment, vendor onboarding controls, and segregation of duties review.",
    scope:
      "All vendors onboarded between 01-Jan-2025 and 31-Dec-2025 with contract value > €50k. Sample: 40 vendors.",
    objectives: [
      "Evaluate vendor onboarding due-diligence controls.",
      "Test segregation of duties in PO-to-payment cycle.",
      "Assess ongoing third-party risk monitoring.",
    ],
    status: "fieldwork",
    risk: "medium",
    progress: 41,
    workpaperCount: 18,
    completedWorkpapers: 7,
    findingsCount: 1,
    dueDate: "June 02, 2026",
    team: team([
      ["u2", "lead"],
      ["u4", "auditor"],
      ["u6", "auditor"],
    ]),
    domain: "Operations",
    createdAt: "2026-02-20",
  },
  {
    id: "aud-2026-004",
    title: "GDPR Data Processing Review",
    code: "PRV-26-01",
    description:
      "Data subject rights, processing records (Art. 30), and cross-border transfer mechanisms.",
    scope:
      "All processing activities listed in the RoPA. Focus on HR, Marketing, and Customer Service domains.",
    objectives: [
      "Confirm Art. 30 records are complete and current.",
      "Test data subject rights fulfillment SLAs.",
      "Evaluate Standard Contractual Clauses coverage for non-EU transfers.",
    ],
    status: "planning",
    risk: "high",
    progress: 12,
    workpaperCount: 14,
    completedWorkpapers: 2,
    findingsCount: 0,
    dueDate: "July 11, 2026",
    team: team([
      ["u3", "lead"],
      ["u1", "reviewer"],
      ["u7", "auditor"],
    ]),
    domain: "Compliance",
    createdAt: "2026-03-15",
  },
  {
    id: "aud-2026-005",
    title: "Treasury & Cash Management",
    code: "TRS-26-01",
    description:
      "Bank reconciliations, FX hedging policy compliance, and liquidity forecasting controls.",
    scope:
      "All operating bank accounts; FX hedging activity for FY2025; 13-week cash forecast accuracy.",
    objectives: [
      "Test bank reconciliation timeliness and review evidence.",
      "Assess FX hedging policy compliance.",
      "Evaluate liquidity forecast accuracy vs. actuals.",
    ],
    status: "reporting",
    risk: "medium",
    progress: 96,
    workpaperCount: 11,
    completedWorkpapers: 11,
    findingsCount: 2,
    dueDate: "Apr 29, 2026",
    team: team([
      ["u5", "lead"],
      ["u1", "reviewer"],
    ]),
    domain: "Finance",
    createdAt: "2026-01-20",
  },
  {
    id: "aud-2026-006",
    title: "Payroll Controls Assessment",
    code: "HRP-26-01",
    description:
      "Payroll authorization, termination workflow, and overtime approval controls.",
    scope: "Monthly payroll runs Jan–Dec 2025 for all group entities.",
    objectives: [
      "Test payroll approval and release controls.",
      "Evaluate termination-to-payroll cutoff timing.",
      "Assess overtime approval evidence.",
    ],
    status: "closed",
    risk: "low",
    progress: 100,
    workpaperCount: 9,
    completedWorkpapers: 9,
    findingsCount: 1,
    dueDate: "Mar 22, 2026",
    team: team([
      ["u4", "lead"],
      ["u2", "reviewer"],
    ]),
    domain: "Human Resources",
    createdAt: "2025-12-01",
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
    owner: auditor("u3"),
    reviewer: auditor("u1"),
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
    owner: auditor("u1"),
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
    owner: auditor("u5"),
    reviewer: auditor("u1"),
    updatedAt: "3 days ago",
    objective: "Verify MFA is enforced for all user accounts across Azure AD and AWS IAM tenants.",
    scope: "All production cloud tenants as of 31-Mar-2026.",
    rawNotes: "All controls operating effectively. No exceptions noted.",
  },
];

export const findings: Finding[] = [
  {
    id: "fnd-001",
    auditId: "aud-2026-002",
    workpaperId: "wp-001",
    title: "Privileged access off-boarding control gaps",
    condition:
      "Testing of 25 privileged access grants identified 3 accounts without documented business justification and 1 account that remained active 4 days after termination.",
    criteria:
      "Policy ITS-POL-004 requires documented justification for all privileged grants and removal within 24 hours of termination.",
    cause:
      "Off-boarding workflow depends on manual HR notification with no automated HRIS-to-IAM trigger.",
    effect:
      "Unauthorized privileged access increases risk of data exfiltration and regulatory non-compliance (SOC 2 CC6.1, CC6.3).",
    recommendation:
      "Integrate HRIS with IAM, enforce a mandatory justification field in ServiceNow, and add a centralized recertification dashboard. Target: Q3 2026.",
    severity: "high",
    status: "open",
    owner: auditor("u3"),
    dueDate: "2026-09-30",
    createdAt: "2026-04-14T10:00:00Z",
  },
];

export function getAuditById(id: string): Audit | undefined {
  return audits.find((a) => a.id === id);
}

export function getWorkpaperById(id: string): Workpaper | undefined {
  return workpapers.find((w) => w.id === id);
}
