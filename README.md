# UNIWAY

A Next.js 14 (App Router) + TypeScript + Supabase rebuild of the UNIWAY
university admissions / SAT / IELTS platform. This is meant to run on your
own domain (Vercel, Netlify, anywhere) — no dependency on claude.ai.

> **Honesty note before you start:** I built this project file-by-file in a
> sandboxed environment with no internet access, so I could **not** run
> `npm install` / `npm run build` myself to confirm it compiles cleanly. I
> checked every import path by hand and they all resolve, but a first-time
> `npm run build` on your machine is the real test — see "Troubleshooting"
> below for what to send me if it fails.

## What's real vs. what's a starting point

**Fully wired to Supabase (real reads/writes, not mocked):**
Auth (signup/login/logout/session), Universities (static dataset + per-user
"Add to plan"), SAT practice (reads `sat_questions`, writes `user_attempts`),
IELTS Reading (reads `ielts_reading_passages`/`_questions`), Admin Scan/
Import/Review/Database/Storage/Users, Study Plan (saved per user), Essays
(saved per user), Dashboard (aggregates your real attempts).

**Honest stubs / needs your input to be "real":**
- **AI Advisor, Study Plan roadmap, Essay feedback, IELTS Speaking feedback**
  all call one server route (`app/api/ai/route.ts`). Without an
  `ANTHROPIC_API_KEY` set, they return a plain "AI is not connected yet"
  message — never a faked answer.
- **IELTS Speaking voice** uses the browser's built-in speech synthesis
  (`SpeechSynthesisUtterance`) to read questions aloud. That's a real
  browser feature, not a paid neural voice — wire an API like ElevenLabs
  yourself if you want a more human voice.
- **PDF/scan import** (large batches of SAT/IELTS PDFs) is intentionally
  **not** done in the browser — see `supabase/functions/import-sat-ielts`,
  a Supabase Edge Function skeleton you deploy yourself. It extracts real
  text from text-layer PDFs and flags anything it can't confidently parse
  as `needs_review`/`needs_ocr` — it never invents answers.
- **Opportunities & Scholarships** are small example datasets
  (`lib/data/opportunities.ts`, `lib/data/scholarships.ts`), clearly labeled
  as examples to verify officially — move them into Supabase tables later
  if you want to edit them without redeploying.
- **Google/Apple OAuth** buttons aren't built — enable the providers in
  Supabase Dashboard → Authentication → Providers, then add
  `supabase.auth.signInWithOAuth({ provider: 'google' })` buttons.

---

## 1. Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in values, see section 3
npm run dev
```

Open http://localhost:3000.

```bash
npm run build   # production build check
npm run start   # run the production build locally
```

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "UNIWAY Next.js rebuild"
gh repo create uniway --private --source=. --push
# or, without the GitHub CLI: create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/uniway.git
git branch -M main
git push -u origin main
```

`.env.local` is in `.gitignore` — your real keys never get committed.

## 3. Environment variables

Copy `.env.example` to `.env.local` for local dev. In Vercel, add the same
variables under **Project → Settings → Environment Variables**:

| Variable | Where it's used | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | No — public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser + server | No — this is the anon key, safe to expose (RLS protects your data) |
| `ANTHROPIC_API_KEY` | server only (`app/api/ai/route.ts`) | **Yes** — never prefix with `NEXT_PUBLIC_` |

Your project's values (from your messages):
```
NEXT_PUBLIC_SUPABASE_URL=https://ummjmbqrnbqzxvfxptru.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_tmElsnpS5zjEuEQ42EDtSg_c4cjk4g9
```

**Never** add a `service_role`/secret key as a Vercel env var used by any
`"use client"` file or any `NEXT_PUBLIC_*` variable. If a future server-only
feature needs it, add it as a plain (non-public) env var and only read it
inside a Route Handler or Edge Function.

## 4. Supabase setup

Run these in **Supabase Dashboard → SQL Editor**, in order:

1. `supabase/migrations/0001_sat_ielts_pipeline.sql` — SAT/IELTS content
   tables, import tracking, review queue, `user_attempts`/`user_answers`.
2. `supabase/migrations/0002_profiles_and_admin.sql` — `profiles` table,
   auto-create-on-signup trigger, `set_admin()` RPC.
3. `supabase/migrations/0003_app_data.sql` — `application_tracker`,
   `study_plans`, `essays` (all owner-only via RLS).
4. `supabase/migrations/0004_security_hardening.sql` — admin-only content
   imports/storage access, protected profile admin roles, and admin-only
   review queues. Apply this migration before enabling public signups or
   using the admin import tools on an existing Supabase project.
5. `supabase/migrations/0005_question_bank_seed.sql` — original SAT/IELTS practice material and private IELTS writing drafts.

These migrations are designed to be safe to re-run. The security hardening
migration replaces the broad write policies from `0001`; existing projects
remain on their current policies until `0004` is run in Supabase SQL Editor.

### Bootstrapping your first admin

There's no UI for this — the very first admin has to be set directly in SQL
(after that, `/admin/users` can promote others):

```sql
update profiles set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

### Storage buckets

Your existing `sat` and `ielts` buckets are used as-is — nothing recreates
them. Storage read policies for both are included in migration `0001`;
double-check they match how you want files read (they currently allow any
`select` — tighten if you want it restricted to signed-in/admin users only).

### (Optional) Edge Function for PDF/scan import

```bash
supabase functions deploy import-sat-ielts --project-ref ummjmbqrnbqzxvfxptru
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... --project-ref ummjmbqrnbqzxvfxptru
```
Get the service_role key from **Dashboard → Project Settings → API** — it
only ever lives in Supabase's secret store and inside the function, never in
this repo or in Vercel.

## 5. Deploy to Vercel

1. **New Project → Import** your GitHub repo.
2. Framework preset: Next.js (auto-detected).
3. Add the environment variables from section 3.
4. Deploy.

Every subsequent `git push` to `main` triggers a new deploy automatically.

## 6. Importing your SAT/IELTS materials

1. Sign up, then run the bootstrap SQL above to make yourself admin.
2. Go to `/admin/scan` — confirms the Supabase connection and shows real
   file counts in `sat`/`ielts` and real row counts in the question tables.
3. Go to `/admin/import` — for `.csv`/`.json` files already in your buckets,
   click **Import**; for anything else (PDF, DOCX, images, audio), click
   **Queue** (writes an `import_jobs` row with `status: 'queued'` for the
   Edge Function to pick up later) or download a template and hand-convert.
4. Go to `/admin/review` to confirm/fix anything flagged `needs_review`.
5. Run migration `0005_question_bank_seed.sql` to add 16 original SAT questions, an original IELTS reading passage with 8 questions, 4 Writing tasks, and 8 Speaking prompts. These are independent UNIWAY practice items, not official exam questions.
6. `/sat` and `/ielts` read reviewed material from the database. IELTS writing drafts are private to the signed-in student; AI feedback needs `ANTHROPIC_API_KEY`.

## 7. Troubleshooting

- **`npm run build` fails** — copy the exact error and send it back; the
  most likely causes are a typo I made in a prop name or a missing
  `"use client"` directive, both quick fixes.
- **Admin pages redirect you to `/dashboard`** — your `profiles.is_admin` is
  false; run the bootstrap SQL in section 4.
- **`/admin/scan` shows "Connected: NO"** — check that migrations 1–4 ran
  without error, and that your `.env.local`/Vercel env vars match section 3
  exactly (no quotes, no trailing spaces).
- **Bucket shows "No files found"** but you know files are there — check the
  bucket name is exactly `sat` / `ielts` (case-sensitive) and that the
  storage `select` policy from migration `0001` was created.
- **CSV import fails with "missing column(s)"** — download the template
  from `/admin/import` and match its header row exactly.

## Project structure

```
uniway/
├── app/                  # Next.js App Router pages + API routes
│   ├── admin/            # scan, import, review, database, storage, users
│   ├── api/ai/           # server-only AI proxy (Anthropic)
│   ├── universities/     # list + [id] detail
│   └── ...               # sat, ielts, scholarships, study-plan, essays, ...
├── components/           # shared React components
├── lib/
│   ├── data/             # static datasets (universities, scholarships, opportunities)
│   ├── supabase/         # browser + server Supabase clients
│   └── types.ts
├── supabase/
│   ├── migrations/       # 0001–0005 — run in order
│   └── functions/import-sat-ielts/  # Edge Function skeleton for PDFs
├── middleware.ts         # session refresh + /admin route protection
└── .env.example
```
