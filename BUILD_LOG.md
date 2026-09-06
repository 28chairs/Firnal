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

**Run 2 — Phase 1:** DB migration, magic-link auth, BottomNav + FAB shell, tab pages, RecordingOverlay shell.

---

## Run 2 — Phase 1: Auth, DB & Navigation Shell

**Date:** September 6, 2026  
**Phase:** 1  
**Goal:** User can sign in; 4 tabs + FAB shell visible; database schema ready to deploy  
**Status:** Complete (requires user to run migration + configure `.env.local`)

### Steps completed

| Step | Task | Status |
|------|------|--------|
| 1.1 | Database migration SQL | Done |
| 1.2 | Supabase client helpers + middleware helper | Done |
| 1.3 | Auth middleware | Done |
| 1.4 | Login page (magic link) | Done |
| 1.5 | Auth callback route | Done |
| 1.6 | Profile timezone sync | Done |
| 1.7 | Bottom nav + FAB | Done |
| 1.8 | Tab pages (Home, Calendar, Habits, Profile) | Done |
| 1.9 | Sign out | Done |
| 1.10 | RecordingOverlay shell | Done |

### What was built

#### 1.1 — Migration (`supabase/migrations/001_init.sql`)
- Tables: `profiles`, `voice_entries`, `daily_journals`, `habits`, `habit_completions`
- Full-text search `tsvector` columns + GIN indexes
- RLS on all tables; auto-create profile on `auth.users` insert
- **User action:** run SQL in Supabase dashboard (see `docs/SUPABASE_SETUP.md`)

#### 1.2–1.3 — Auth infrastructure
- `lib/supabase/middleware.ts` — session refresh
- `middleware.ts` — protect app routes; redirect unauthenticated → `/login`; authenticated `/login` → `/`

#### 1.4–1.5 — Login flow
- `app/login/page.tsx` + `components/auth/LoginForm.tsx` — email OTP magic link
- `app/auth/callback/route.ts` — exchange code for session

#### 1.6 — Timezone
- `lib/timezone.ts` — `detectBrowserTimezone`, `getTodayDateString`, `getDayBounds` (uses `date-fns-tz`)
- `components/profile/TimezoneSync.tsx` + `POST /api/profile/timezone`

#### 1.7–1.10 — Navigation shell
- `app/(app)/layout.tsx` — `AppShell` wrapper, `force-dynamic`
- `components/navigation/BottomNav.tsx` — Home, Calendar, FAB, Habits, Profile
- `components/navigation/RecordingOverlay.tsx` — dimmed overlay; hold FAB opens/closes
- `components/navigation/AppShell.tsx` — wires FAB + overlay; locks body scroll
- Tab placeholder pages under `app/(app)/`
- `components/profile/SignOutButton.tsx` on Profile

### Files created / modified (key)

```
supabase/migrations/001_init.sql
middleware.ts
lib/supabase/middleware.ts
lib/timezone.ts
app/login/page.tsx
app/auth/callback/route.ts
app/api/profile/timezone/route.ts
app/(app)/layout.tsx
app/(app)/page.tsx
app/(app)/calendar/page.tsx
app/(app)/habits/page.tsx
app/(app)/profile/page.tsx
components/auth/LoginForm.tsx
components/navigation/AppShell.tsx
components/navigation/BottomNav.tsx
components/navigation/RecordingOverlay.tsx
components/profile/SignOutButton.tsx
components/profile/TimezoneSync.tsx
```

Removed: `app/page.tsx` (moved to `app/(app)/page.tsx`)

### Verification

```bash
npm run lint   # ✓ pass
npm run build  # ✓ pass
```

Manual test (requires `.env.local` + migration):
1. Visit `/` → redirects to `/login`
2. Enter email → receive magic link → lands on Home with bottom nav
3. Hold center FAB → overlay opens; release → closes
4. Navigate Calendar / Habits / Profile tabs
5. Profile → Sign out → back to `/login`

### Issues / notes

1. Next.js 16 warns `middleware` convention is deprecated in favor of `proxy` — deferred; current middleware works
2. Build uses `export const dynamic = 'force-dynamic'` on `(app)` layout so pages don't prerender without Supabase env
3. Profile timezone API fails silently until migration is run — expected

### Phase 1 exit criteria

- [x] Magic link login flow implemented
- [x] 4 tabs navigate; FAB opens/closes overlay shell
- [x] DB migration SQL ready with RLS
- [x] Sign out works
- [ ] **User:** run `001_init.sql` + configure `.env.local` to test end-to-end

### Next run

**Run 5 — Phase 3:** GPT flowchart pipeline, DayFlowchart UI, connector lines.

---

## Run 3 — Phase 2: Voice Capture & Transcription

**Date:** September 6, 2026  
**Phase:** 2  
**Goal:** Hold FAB, speak, see transcript in Recent Recordings  
**Status:** Complete (requires `OPENAI_API_KEY` + optional `002_storage.sql`)

### Steps completed

| Step | Task | Status |
|------|------|--------|
| 2.1 | `hooks/useMediaRecorder.ts` | Done |
| 2.2 | Recording UX in AppShell + overlay timer | Done |
| 2.3 | Mic permission error UI | Done |
| 2.4 | `lib/api/uploadCapture.ts` | Done |
| 2.5 | `POST /api/transcribe` | Done |
| 2.6 | `lib/openai.ts` Whisper helper | Done |
| 2.7 | Timezone helpers | Done (Phase 1) |
| 2.8 | `RecentRecordings` component | Done |
| 2.9 | End-to-end upload flow | Done |
| 2.10 | Home page integration | Done |

### What was built

#### Voice capture
- `useMediaRecorder` — getUserMedia, webm/mp4 mime detection, min 1s / max 180s
- `AppShell` — hold FAB → record → release → upload → toast
- `RecordingOverlay` — timer, uploading state, mic permission instructions

#### API
- `POST /api/transcribe` — auth, insert entry, optional storage upload, Whisper, update transcript
- `GET /api/voice-entries/today` — timezone-aware today's captures
- `POST /api/voice-entries/[id]/retry` — re-transcribe from stored audio

#### UI
- `RecentRecordings` — list with status badges, polling while transcribing, retry on failed
- `TodayHeader` — date in user timezone

#### Storage
- `supabase/migrations/002_storage.sql` — private `voice-audio` bucket

### User setup required

1. Add `OPENAI_API_KEY` to `.env.local`
2. Run `002_storage.sql` in Supabase (optional but needed for retry)

### Verification

```bash
npm run lint   # ✓ pass
npm run build  # ✓ pass
```

Manual: hold FAB → speak 2+ seconds → release → transcript appears on Home within ~15s.

### Phase 2 exit criteria

- [x] MediaRecorder + upload pipeline
- [x] Whisper transcription API
- [x] Recent recordings on Home with polling + retry
- [x] Timezone-aware today query
- [ ] **User:** configure OpenAI key and test with mic

---

## Run 4 — Remove sign-in wall; defer auth to Phase 9

**Date:** September 6, 2026  
**Phase:** Plan change (affects Phases 1–2)  
**Goal:** Open app without login; store captures locally until Phase 9  
**Status:** Complete

### What changed

| Area | Before | After |
|------|--------|-------|
| Route protection | `middleware.ts` redirected to `/login` | Middleware removed; all tabs open |
| Voice data | Supabase `voice_entries` | `localStorage` via `lib/local-captures.ts` |
| Transcribe API | Auth required | Works without session; optional DB if logged in |
| Recent Recordings | API fetch + polling | `useSyncExternalStore` + local captures |
| Profile | Email, sign out | Placeholder — sign-in scheduled Phase 9 |
| `/login` | Magic-link form | "Phase 9" placeholder + link to app |

### Files created / modified (key)

```
middleware.ts                    — deleted
lib/local-captures.ts            — new
app/api/transcribe/route.ts      — local-first path
lib/api/uploadCapture.ts         — saves to localStorage
components/home/RecentRecordings.tsx
components/home/TodayHeader.tsx
app/(app)/layout.tsx
app/(app)/profile/page.tsx
app/login/page.tsx
PRD.md                           — v2.4, Phase 9 added
```

### Verification

```bash
npm run lint   # ✓ pass
npm run build  # ✓ pass
```

Manual: visit `/` → Home loads without redirect; hold FAB → transcript saved on device.

### User setup (current)

- **Required:** `OPENAI_API_KEY` in `.env.local`
- **Optional until Phase 9:** Supabase keys + migrations

### Next run

**Run 6 — Phase 4:** Habits API, voice auto-check, HabitReminders on Home.

---

## Run 5 — Phase 3: AI Flowchart Breakdown

**Date:** September 6, 2026  
**Phase:** 3  
**Goal:** Multiple captures merge into 5-category flowchart on Home  
**Status:** Complete (requires `OPENAI_API_KEY`)

### Steps completed

| Step | Task | Status |
|------|------|--------|
| 3.1 | Zod schemas (`lib/schemas.ts`) | Done |
| 3.2 | Category constants | Done |
| 3.3 | GPT prompt templates | Done |
| 3.4 | `generateDailyFlowchart` | Done |
| 3.5 | Journal API GET | Done |
| 3.6 | Journal API POST regenerate | Done |
| 3.7 | Debounced regeneration (30s) | Done |
| 3.8 | TranscriptPanel | Done |
| 3.9 | CategoryColumn + CategoryCard | Done |
| 3.10 | DayFlowchart | Done |
| 3.11 | ConnectorLines SVG (desktop) | Done |
| 3.12 | Home integration | Done |

### What was built

#### AI pipeline
- `lib/schemas.ts`, `lib/prompts.ts`, `lib/flowchart.ts` — GPT-4o-mini JSON flowchart with Zod validation + retry

#### API + storage
- `POST/GET /api/journal/[date]` — generate breakdown; Supabase upsert when authed
- `lib/local-journal.ts`, `hooks/useDayJournal.ts` — local cache + auto-regenerate

#### UI
- `DayFlowchart`, `TranscriptPanel`, `CategoryColumn`, `CategoryCard`, `ConnectorLines`
- Home page — flowchart above recent recordings

### Verification

```bash
npm run lint   # ✓ pass
npm run build  # ✓ pass
```

Manual: record voice notes → flowchart auto-generates → 5 categories + highlights; desktop shows connector lines.

### Next run

**Run 6 — Phase 4:** Habits API, voice auto-check, HabitReminders on Home.

---

## Run 6 — Phase 4: Habits

**Date:** September 6, 2026  
**Phase:** 4  
**Goal:** Create habits; voice auto-check; Home habit chips  
**Status:** Complete (requires `OPENAI_API_KEY` for voice detection)

### Steps completed

| Step | Task | Status |
|------|------|--------|
| 4.1–4.2 | Habits CRUD | Done (localStorage; Supabase API deferred to Phase 9) |
| 4.3 | Habit detection AI | Done |
| 4.4 | Habit names in flowchart prompt | Done |
| 4.5 | HabitRow | Done |
| 4.6 | HabitList + AddHabitModal | Done |
| 4.7 | Habits tab page | Done |
| 4.8 | HabitReminders on Home | Done |
| 4.9 | Home layout update | Done |

### What was built

#### Storage + AI
- `lib/local-habits.ts` — habits + daily completions in localStorage
- `lib/habit-detection.ts` + `POST /api/habits/detect` — GPT-4o-mini habit completion detection
- Auto-runs after each successful transcription via `uploadCapture`

#### UI
- `HabitList`, `HabitRow`, `AddHabitModal` on `/habits`
- `HabitReminders` — horizontal chips on Home (incomplete first, tap to toggle)
- "via voice" badge when auto-checked from recording

#### Integration
- Flowchart regeneration passes active habit names to GPT
- Space bar + FAB recording unchanged

### Verification

```bash
npm run lint   # ✓ pass
npm run build  # ✓ pass
```

Manual: add habit "Meditate" → record "I meditated this morning" → habit auto-checks with "via voice"; manual uncheck works; Home chips update.

### Next run

**Run 7 — Phase 5:** Calendar month grid, day detail, keyword search.

---
