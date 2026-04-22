# AuditFlow AI — Deployment Guide

Schritt-für-Schritt-Anleitung, um deine App mit echter Claude-KI live zu stellen.

**Endergebnis:** eine öffentliche URL (z.B. `auditflow-ai-xyz.vercel.app`), die du mit deinem Team teilen kannst. Komplett im Browser einrichtbar, **keine Software-Installation auf deinem Rechner nötig**.

---

## Überblick — was wir machen

1. **Anthropic-Account erstellen** und API-Key holen (5 Min)
2. **GitHub-Account erstellen** und Code dort ablegen (10 Min)
3. **Vercel-Account erstellen** und App deployen (5 Min)
4. **Testen & teilen** (2 Min)

**Gesamtzeit: ~25 Minuten.** Alles im Browser, null Installation.

---

## Teil 1 — Anthropic API Key holen (~5 Min)

### Schritt 1.1 — Account erstellen

1. Gehe auf **[console.anthropic.com](https://console.anthropic.com)**
2. Klick **"Sign up"** — du kannst mit Google, E-Mail oder Firmen-SSO loggen
3. Bestätige deine E-Mail
4. Folge dem Onboarding (Name, Organisation eintragen)

### Schritt 1.2 — Guthaben aufladen

1. Oben links im Menü: **"Billing"** oder **"Plans & Billing"**
2. Klick **"Add credits"** oder **"Buy credits"**
3. Lade für den Start **$10** auf — das reicht für viele hundert Tests
4. Kreditkarte hinterlegen → Zahlung bestätigen

**Warum sofort Guthaben?** Ohne Guthaben schlagen die API-Calls fehl. Du kriegst zwar $5 Gratis-Credits beim Signup, aber die können begrenzt sein.

### Schritt 1.3 — API Key erstellen

1. Im linken Menü: **"API Keys"** (oder direkt [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys))
2. Klick **"Create Key"**
3. Name vergeben: z.B. `auditflow-prod`
4. **Kopiere den Key sofort** in einen Notepad oder eine Textdatei — du siehst ihn **nur einmal**!
5. Der Key sieht so aus: `sk-ant-api03-xxxxxxxxxxxxx...`

⚠️ **Sicherheitshinweis:** Diesen Key nie in Code, E-Mail oder Chat posten. Er ist wie ein Passwort und kostet Geld, wenn jemand ihn benutzt.

---

## Teil 2 — GitHub-Repo richtig einrichten (~10 Min)

Beim letzten Mal ging das GitHub-Upload schief, weil die Ordnerstruktur flach wurde. Hier der **Trick**, wie es zuverlässig klappt.

### Schritt 2.1 — Falls du schon ein altes Repo hast: löschen

1. Gehe auf dein altes Repo (falls vorhanden)
2. **Settings** → ganz unten **"Danger Zone"** → **"Delete this repository"**
3. Repo-Name zur Bestätigung eintippen → Delete

### Schritt 2.2 — Neues Repo erstellen

1. Klicke auf **[github.com/new](https://github.com/new)**
2. Name: `auditflow-ai`
3. **Wichtig:** auf **Private** lassen (wir brauchen nicht public für Vercel)
4. **NICHT** "Add a README" anhaken — wir wollen ein leeres Repo
5. **"Create repository"**

### Schritt 2.3 — Zip entpacken (richtig!)

Das ist der Teil, wo es letztes Mal schief ging. So machst du es richtig:

**Auf Windows:**
1. Finde das `auditflow-ai.zip` (meistens in Downloads)
2. **Rechtsklick** darauf → **"Alle extrahieren..."** (nicht Doppelklick, nicht 7-Zip oder andere Tools!)
3. Im Dialog: **Extrahieren**
4. Es entsteht ein Ordner `auditflow-ai/auditflow-ai/` (ja, doppelt verschachtelt)
5. Navigiere in den **innersten** `auditflow-ai` Ordner

**Struktur-Check — das musst du sehen:**
```
app/            ← Ordner (blaues Icon)
components/     ← Ordner
lib/            ← Ordner
types/          ← Ordner
.env.local.example
.gitignore
DEPLOY.md
README.md
next.config.js
package.json
postcss.config.js
tailwind.config.ts
tsconfig.json
```

Wenn du hier **Ordner mit blauen Icons** siehst → perfekt, weiter.

Wenn du hier **lose .tsx Dateien** siehst → das Zip-Tool hat es kaputt gemacht. Lade es nochmal herunter und nutze Windows-Bordmittel.

### Schritt 2.4 — Upload zu GitHub — der RICHTIGE Weg

**Wichtig: Ordner einzeln hochladen, nicht alles auf einmal.**

1. Auf deiner Repo-Seite bei GitHub: klicke den Link **"uploading an existing file"** (blauer Link im Quick-Setup-Bereich)

2. **Erste Runde — nur die Einzeldateien:**
   - Öffne im Windows-Explorer den innersten `auditflow-ai` Ordner
   - Markiere **nur** diese Einzeldateien (kein Ordner!):
     - `.env.local.example`
     - `.gitignore`
     - `DEPLOY.md`
     - `README.md`
     - `next.config.js`
     - `package.json`
     - `postcss.config.js`
     - `tailwind.config.ts`
     - `tsconfig.json`
   - Ziehe diese markierten Dateien per Drag & Drop in den GitHub-Upload-Bereich
   - Ganz unten grüner Button **"Commit changes"**
   - Warte bis es fertig ist — du landest wieder auf der Repo-Übersicht

3. **Zweite Runde — Ordner `app` hochladen:**
   - Oben auf der Repo-Seite: **"Add file"** → **"Upload files"**
   - Im Windows-Explorer: klicke auf den **Ordner `app`** (nicht reingehen!)
   - Ziehe den **ganzen Ordner** per Drag & Drop in den GitHub-Upload-Bereich
   - Du siehst jetzt Pfade wie `app/layout.tsx`, `app/page.tsx` usw. — das ist richtig!
   - **"Commit changes"**

4. **Dritte Runde — `components`:**
   - Nochmal **"Add file"** → **"Upload files"**
   - Ordner `components` reinziehen
   - **"Commit changes"**

5. **Vierte Runde — `lib`:**
   - **"Add file"** → **"Upload files"**
   - Ordner `lib` reinziehen
   - **"Commit changes"**

6. **Fünfte Runde — `types`:**
   - **"Add file"** → **"Upload files"**
   - Ordner `types` reinziehen
   - **"Commit changes"**

### Schritt 2.5 — Struktur prüfen

Auf deiner Repo-Hauptseite solltest du jetzt das hier sehen:

```
📁 app
📁 components
📁 lib
📁 types
.env.local.example
.gitignore
DEPLOY.md
README.md
next.config.js
package.json
postcss.config.js
tailwind.config.ts
tsconfig.json
```

**Ordner sind Ordner (blaues Icon), keine .tsx-Dateien direkt im Root.** Wenn das stimmt: weiter!

Falls irgendwas flach landet: nochmal löschen und Schritt 2.4 wiederholen. Der **Klick-den-Ordner-direkt-an-und-dann-Drag** ist der entscheidende Trick.

---

## Teil 3 — Vercel Deployment (~5 Min)

### Schritt 3.1 — Vercel-Account

1. Gehe auf **[vercel.com/signup](https://vercel.com/signup)**
2. Klick **"Continue with GitHub"** — das verbindet deinen GitHub-Account gleich
3. Erlaube Vercel den Zugriff auf deine Repos
4. Personal Account wählen (kein Team nötig fürs Testen)

### Schritt 3.2 — Projekt importieren

1. Auf dem Dashboard: **"Add New…"** → **"Project"**
2. Unter "Import Git Repository" solltest du dein `auditflow-ai` Repo sehen
3. Klick **"Import"** daneben

### Schritt 3.3 — Konfiguration

Vercel erkennt Next.js automatisch. Du siehst ein Formular:

1. **Framework Preset:** Next.js (sollte schon ausgewählt sein — nicht ändern)
2. **Root Directory:** lass auf `./`
3. **Build Settings:** alle Defaults lassen

**JETZT WICHTIG — Environment Variable hinzufügen:**

4. Scrolle runter zu **"Environment Variables"**
5. Klick **"Add"** oder das Plus-Icon
6. **Name:** `ANTHROPIC_API_KEY`
7. **Value:** deinen Anthropic Key einfügen (der, den du in Teil 1.3 kopiert hast)
8. Alle 3 Umgebungen ausgewählt lassen (Production, Preview, Development)

### Schritt 3.4 — Deployen

1. Klick den großen blauen Button **"Deploy"**
2. Warte 2-3 Minuten. Du siehst Build-Logs live.
3. Am Ende: **🎉 Congratulations screen** mit Feuerwerk-Animation
4. Dein Link erscheint oben, z.B. `auditflow-ai-xyz.vercel.app`

### Schritt 3.5 — Testen

1. Klick auf den Link oder **"Visit"**
2. Du siehst das Dashboard
3. Klick auf eine Audit-Karte → Workpaper-View
4. Klick **"Run AI Compliance Check"** → nach ~5-10 Sek siehst du echte Claude-generierte Insights! 🎉

---

## Teil 4 — Teilen mit deinem Team

Einfach den Vercel-Link kopieren und rumschicken:

```
https://auditflow-ai-xyz.vercel.app
```

Jeder, der den Link hat, kann die App sofort nutzen — ohne Login, ohne Installation.

**Eigene Domain (optional):** Wenn du was Professionelleres willst wie `auditflow.meinefirma.com`, kannst du das in Vercel unter **Settings → Domains** einrichten. Kostet extra wenn du die Domain bei einem Registrar kaufen musst, aber ist technisch easy.

---

## Kosten — was das wirklich kostet

**Vercel:**
- **Kostenlos** (Hobby Plan) — für 5 Leute zum Testen reicht das easy.
- Pro-Plan ($20/Monat/Seat) ist erst nötig, wenn du kommerziell oder mit Custom Domain auf Business-Niveau gehst.

**Anthropic API — echte Nutzungskosten:**
Claude Sonnet 4.6 kostet **$3 pro 1 Million Input-Tokens** und **$15 pro 1 Million Output-Tokens**.

Für deine App sieht ein typischer Call ungefähr so aus:
- **Draft Finding**: ~500 Input + ~600 Output Tokens = **~$0.011** pro Call (~1 Cent)
- **Compliance Check**: ~1000 Input + ~1000 Output Tokens = **~$0.018** pro Call (~2 Cent)

**Realistisch gerechnet für 5 Leute:**
- 10 Drafts + 10 Compliance Checks pro Person pro Woche = 100 Calls/Woche
- Kosten: ~$1.50 pro Woche = **~$6-8 pro Monat**

Mit $10 Startguthaben kommst du locker einen Monat lang mit aktivem Testen aus.

**Kostenkontrolle:** Im Anthropic Console unter **"Billing"** kannst du **Spending Limits** setzen (z.B. max. $20/Monat). Wenn das Limit erreicht ist, gehen keine weiteren Calls durch — du kannst nichts versehentlich verbrennen.

---

## Troubleshooting

### "Build failed" bei Vercel

**Ursache:** Meistens ein fehlender Ordner im GitHub-Repo.

**Fix:** Zurück zu Schritt 2.5 — prüfe dass alle 4 Ordner (`app`, `components`, `lib`, `types`) da sind. Falls einer fehlt, nochmal hochladen.

### "Failed to generate draft finding" in der App

**Ursache:** Der API-Key ist falsch oder das Anthropic-Guthaben ist aufgebraucht.

**Fix:**
1. Anthropic Console → Billing → prüfe Guthaben
2. Vercel → dein Projekt → Settings → Environment Variables → prüfe den Key
3. Wenn du den Key ändern musst: neu eintragen und dann **"Redeploy"** klicken (Deployments Tab → drei-Punkte-Menü beim letzten Deployment → **"Redeploy"**)

### AI-Response ist komisch oder unvollständig

**Ursache:** Claude versucht JSON zu produzieren, aber manchmal hat das Model Schluckauf.

**Fix:** Einfach "Regenerate" klicken. Im Regelfall klappt es beim zweiten Mal.

### Die 5 Leute können nicht gleichzeitig zugreifen

Sie können! Vercel handhabt mehrere parallele Nutzer automatisch. Falls einer eine Fehlermeldung bekommt, liegt es wahrscheinlich an Anthropic-Rate-Limits (unwahrscheinlich bei nur 5 Leuten) — kurz warten, nochmal probieren.

---

## Next Steps — wenn du weitermachen willst

Das ist ein MVP. Für eine echte Produktions-App fehlt noch:

- **Persistenz:** Workpapers werden bei Refresh nicht gespeichert. Du brauchst eine DB (z.B. Vercel Postgres oder Supabase).
- **Auth:** Aktuell kann jeder mit dem Link alles sehen. Für sensible Audit-Daten brauchst du Login (z.B. Clerk oder Auth.js).
- **Multi-Tenant:** Trennung zwischen verschiedenen Firmen/Teams.
- **Echte Audit-Daten:** Statt Mock-Daten aus `lib/mock-data.ts` aus der DB holen.
- **Dateiupload:** Evidence-Dateien an Workpapers anhängen.
- **Export:** Findings als PDF/Word exportieren.

Für all das gibt es fertige Next.js-Bausteine. Wenn du weitergehen willst, sag Bescheid — dann bauen wir's Stück für Stück.

Viel Erfolg! 🚀
