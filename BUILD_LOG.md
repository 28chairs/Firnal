# FIRNAL — Build Log

Chronological record of each implementation run. One section per session.

---

## Run 1 — Phase 0: Project Setup

**Date:** September 6, 2026  
**Phase:** 0  
**Goal:** Empty repo runs locally with tooling configured  
**Status:** Complete (0.8 requires manual Supabase dashboard steps)

### Steps completed

| Step | Task | Status |
|------|------|--------|
| 0.1 | Initialize Next.js project | Done |
| 0.2 | Configure code quality tooling | Done |
| 0.3 | Install core dependencies | Done |
| 0.4 | Set up shadcn/ui | Done |
| 0.5 | Configure Tailwind theme tokens | Done |
| 0.6 | Create environment template | Done |
| 0.7 | Initialize git & README | Done |
| 0.8 | Create Supabase project (cloud) | **Manual** — see `docs/SUPABASE_SETUP.md` |
| 0.9 | Stub folder structure | Done |

### What was built

#### 0.1 — Next.js project
- Scaffolded **Next.js 16.3.4** with App Router, TypeScript, Tailwind CSS 4, ESLint, Turbopack
- Workaround: `create-next-app` rejects folder name `FIRNAL` (capital letters) — scaffolded into `firnal-tmp/` and merged into repo root
- Renamed package to `firnal` in `package.json`
- Replaced default home page boilerplate with FIRNAL placeholder UI

#### 0.2 — Code quality
- Added `.prettierrc` (single quotes, semi, 2-space, printWidth 100)
- Added `.prettierignore`
- Added `npm run format` script
- Verified `npm run lint` passes

#### 0.3 — Core dependencies
Installed:
- `@supabase/supabase-js`, `@supabase/ssr`
- `openai`, `zod`, `date-fns`
- `clsx`, `tailwind-merge`
- `prettier` (dev)

#### 0.4 — shadcn/ui
- Ran `npx shadcn@latest init -d -y -f` (base-nova preset, Tailwind v4)
- Added components: `button`, `input`, `card`, `skeleton`, `dialog`, `checkbox`, `sonner`
- Home page renders shadcn `Button` + `Card`

#### 0.5 — Theme tokens (`app/globals.css`)
- Cream background: `#FAF9F6`
- FAB / primary rose: `#E11D48`
- Category colors: commitments, decisions, ideas, people, questions
- `lib/categories.ts` — category constants for Phase 3

#### 0.6 — Environment
- Created `.env.local.example` with Supabase, OpenAI, Google OAuth vars
- Updated `.gitignore` to allow committing `.env.local.example` (`!.env.local.example`)
- Created `lib/env.ts` — Zod validation stubs for client/server env

#### 0.7 — Git & README
- Git was already initialized with remote `origin`
- Rewrote `README.md` with setup instructions, scripts, doc links

#### 0.8 — Supabase (manual)
- Cannot create cloud project from code — documented step-by-step in **`docs/SUPABASE_SETUP.md`**
- User action: create project, copy keys to `.env.local`, enable Email auth, set redirect URLs

#### 0.9 — Folder stubs
- `lib/supabase/client.ts` — browser client (throws if env missing)
- `lib/supabase/server.ts` — server client with cookie handlers
- `components/navigation/`, `components/home/`, `supabase/migrations/`

### Files created / modified (key)

```
app/page.tsx              — FIRNAL home with Button + Card
app/layout.tsx            — metadata, Toaster
app/globals.css           — FIRNAL theme tokens
components/ui/*           — shadcn components
lib/env.ts
lib/categories.ts
lib/supabase/client.ts
lib/supabase/server.ts
.env.local.example
.prettierrc
docs/SUPABASE_SETUP.md
BUILD_LOG.md
README.md
package.json
```

### Verification

```bash
npm run lint   # ✓ pass
npm run build  # ✓ pass
npm run dev    # → http://localhost:3000
```

### Issues / notes

1. **Next.js 16** installed (PRD specified 15; 16 is current from `create-next-app@latest` — compatible)
2. **Supabase keys** not configured yet — required before Phase 1 auth
3. **shadcn preset** is `base-nova` (shadcn v4 default) rather than PRD's "New York + zinc" — visually close; can re-init later if needed

### Phase 0 exit criteria

- [x] `npm run dev` works
- [x] shadcn Button renders on home page
- [ ] Supabase project exists — **user must complete** `docs/SUPABASE_SETUP.md`
- [x] `.env.local.example` complete

### Next run

**Run 2 — Phase 1:** DB migration, magic-link auth, BottomNav + FAB shell, tab pages, RecordingOverlay shell.

---
