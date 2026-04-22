# AuditFlow AI

Ultra-modern internal audit management platform with real Claude AI for drafting and compliance review.

## 🆕 What changed in Sprint 1

This iteration turns the static mock demo into a **fully interactive MVP** with persistent state. You can now drive a complete audit lifecycle end-to-end — create an audit, assemble a team, open workpapers, promote AI-drafted findings, and export a Markdown report.

**New capabilities**

- **New audit dialog** on the dashboard — scope, objectives, team, risk, due date. Claude can suggest objectives and risk from the scope.
- **Audit detail page** at `/audits/[id]` with 5 tabs: Overview, Team, Workpapers, Findings, Report.
- **Team management** — add members from the auditor pool or invite new ones, assign one of 5 roles (Lead Auditor, Auditor, Reviewer, Auditee, Observer).
- **Workpaper creation** within each audit, with auto-generated workpaper references.
- **Findings as first-class entities** — click "Accept" on a drafted finding to promote it into a tracked finding with severity, status, and owner.
- **Cross-audit findings register** at `/findings`.
- **Markdown export** of the full audit report (IIA 5-C structured).
- **Persistent state** — everything you do is saved to `localStorage` via Zustand, so a reload doesn't lose your work.

**New AI route**

- `POST /api/ai/audit-planning` — Claude suggests 3–5 audit objectives and an inherent risk rating from a free-form scope description.

**Architecture changes**

- Introduced a central `useAuditStore` (Zustand + `persist`) in `lib/store.ts`. All components now read from the store, not from `lib/mock-data.ts` directly.
- `Audit.team` is now `TeamMember[]` with `{ auditor, role }` instead of `Auditor[]`.
- New `Finding` entity, decoupled from `Workpaper.draftedFinding`. Drafts stay in the workpaper; accepting them creates a tracked `Finding`.
- The dashboard no longer links every audit card to `wp-001` — it now links to the correct audit detail page.

## 🚀 Deployment

**Für Deployment-Anweisungen siehe [DEPLOY.md](./DEPLOY.md).**

Kurzfassung:
1. Anthropic API-Key erstellen ([console.anthropic.com](https://console.anthropic.com))
2. Repository nach GitHub hochladen
3. Bei [vercel.com](https://vercel.com) importieren, `ANTHROPIC_API_KEY` als Environment Variable setzen, Deploy klicken

## 📁 Project structure

```
app/
  layout.tsx                    Root layout with sidebar + topbar
  page.tsx                      Dashboard (Audit Universe)
  audits/[id]/page.tsx          NEW — Audit detail (5 tabs)
  findings/page.tsx             NEW — Cross-audit findings register
  workpapers/[id]/page.tsx      Workpaper detail
  api/ai/drafting/route.ts      🤖 Claude Sonnet 4.6 — drafting
  api/ai/compliance/route.ts    🤖 Claude Sonnet 4.6 — compliance
  api/ai/audit-planning/route.ts NEW 🤖 Claude Sonnet 4.6 — planning

components/
  layout/      Sidebar, Topbar
  dashboard/   Kanban, cards, stats
  audit/       NEW — New-audit dialog, detail view, 5 tab components
  findings/    NEW — Cross-audit findings register
  workpaper/   Editor, AI result views, compliance sheet
  ui/          shadcn/ui primitives (+ input, label, select, dialog)

lib/
  store.ts     NEW — Zustand store with persistence
  mock-data.ts Seed data for the store
  utils.ts
types/         TypeScript domain types (+ TeamRole, Finding, FindingStatus)
```

## 💰 Costs

With Claude Sonnet 4.6:
- Draft finding: ~$0.011 per call (~1 Cent)
- Compliance check: ~$0.018 per call (~2 Cent)
- Audit planning: ~$0.005 per call (~0.5 Cent)
- Typical team of 5 users: ~$6-8/Monat

Vercel Hobby plan is free for this workload.

## 🔧 Local development

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local and paste your ANTHROPIC_API_KEY
npm run dev
```

Öffne http://localhost:3000.

> **Tipp:** If you ever want to wipe your local state and return to the seed data, open DevTools → Application → Local Storage → delete the `auditflow-store-v1` key and reload.

## 🗺️ What's next (Sprint 2 & 3)

- **Sprint 2** — Deeper workpaper/finding workflow: evidence uploads (mock), review comments, finding owner assignment with due dates.
- **Sprint 3** — AI-generated executive summary for reports, PDF export, KPI dashboard upgrades, real backend (Supabase/Postgres).
