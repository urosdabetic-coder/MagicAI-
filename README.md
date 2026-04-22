# AuditFlow AI

Ultra-modern internal audit management platform with real Claude AI for drafting and compliance review.

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
  workpapers/[id]/page.tsx      Workpaper detail
  api/ai/drafting/route.ts      🤖 Claude Sonnet 4.6 drafting
  api/ai/compliance/route.ts    🤖 Claude Sonnet 4.6 compliance

components/
  layout/      Sidebar, Topbar
  dashboard/   Kanban, cards, stats
  workpaper/   Editor, AI result views, compliance sheet
  ui/          shadcn/ui primitives

lib/           utilities + mock data
types/         TypeScript domain types
```

## 💰 Costs

With Claude Sonnet 4.6:
- Draft finding: ~$0.011 per call (~1 Cent)
- Compliance check: ~$0.018 per call (~2 Cent)
- Typical team of 5 users: ~$6-8/Monat

Vercel Hobby plan is free for this workload.

## 🔧 Local development (optional)

Nur falls du später lokal entwickeln willst:

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local and paste your ANTHROPIC_API_KEY
npm run dev
```

Öffne http://localhost:3000.
