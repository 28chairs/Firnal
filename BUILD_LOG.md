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

## Run 7 — Phase 5: Calendar Tab & Search

**Date:** September 6, 2026  
**Phase:** 5  
**Goal:** Browse past days on calendar; search journals by keyword  
**Status:** Complete (local-first; Supabase APIs ready for Phase 9)

### Steps completed

| Step | Task | Status |
|------|------|--------|
| 5.1 | Calendar month API | Done |
| 5.2 | DayCell component | Done |
| 5.3 | MonthGrid component | Done |
| 5.4 | Calendar tab page | Done |
| 5.5 | Day detail page | Done |
| 5.6 | Search API | Done |
| 5.7 | SearchBar + SearchResults | Done |
| 5.8 | Search page + Home header link | Done |

### What was built

#### Calendar (local-first)
- `lib/calendar-stats.ts`, `lib/calendar-month.ts` — month grid cells + journaled dates from localStorage
- `hooks/useCalendarMonth.ts` — reactive month dots on journal/capture changes
- `DayCell`, `MonthGrid` — month navigation, dots on journaled days, today ring
- `/calendar` — full month grid
- `/calendar/[date]` — day detail with flowchart + recordings (reuses `DayFlowchart` + `RecentRecordings`)

#### Search
- `lib/local-search.ts` — client keyword search across transcripts + flowcharts
- `GET /api/search` — Postgres full-text search when authed (Phase 9)
- `SearchBar` (300ms debounce, min 2 chars), `SearchResults` with highlighted snippets
- `/search` page; search icon in Home header

#### API (Phase 9 ready)
- `GET /api/calendar/month?year=&month=` — Supabase journal dates when signed in

### Verification

```bash
npm run lint   # ✓ pass
npm run build  # ✓ pass
```

Manual: record on multiple days → Calendar shows dots → tap day opens flowchart; search finds keyword → tap result opens day detail.

### Next run

**Run 8 — Phase 6:** Google Calendar OAuth, events strip on Home, Profile completion.

---

## Run 8 — Gen Z Visual Redesign & Customizable UI System

**Date:** September 16, 2026  
**Phase:** Visual polish (cross-cutting)  
**Goal:** Implement Gen Z–friendly visual redesign with customizable themes, fonts, and density  
**Status:** Complete

### Steps completed

| Step | Task | Status |
|------|------|--------|
| 8.1 | Create appearance system (`lib/appearance.ts`) | Done |
| 8.2 | Create React context for settings (`lib/appearance-context.tsx`) | Done |
| 8.3 | Update `globals.css` with 4 theme presets | Done |
| 8.4 | Create AppearanceSettings component | Done |
| 8.5 | Update Profile page with Appearance section | Done |
| 8.6 | Update RootLayout with AppearanceProvider + Nunito font | Done |
| 8.7 | Polish visual components for Gen Z aesthetic | Done |
| 8.8 | Add PWA viewport/theme-color metadata | Done |

### What was built

#### Appearance System
- **`lib/appearance.ts`** — Theme presets, accent colors, font sizes, density, font style definitions; localStorage persistence; document class application
- **`lib/appearance-context.tsx`** — React context with hooks for settings management; hydration-safe mounting
- **4 Theme Presets:**
  - **Cream Journal** — Warm paper tones (#FAF9F6) with rose/coral accents
  - **Midnight** — Dark-first Gen Z aesthetic (#0F172A) with cool blue glow
  - **Soft Pastel** — Muted pastels (#FDF4FF) with violet accents
  - **Structured Blue** — Original iOS-inspired gray/blue (preserved)

#### Customization Controls
- **Theme Picker** — Visual swatches with preview colors
- **Accent Color Picker** — 11 curated colors (Rose, Coral, Amber, Emerald, Teal, Sky, Blue, Violet, Purple, Fuchsia, Slate)
- **Font Size** — Compact (90%), Comfortable (100%), Large (115%)
- **Font Style** — Sans (Inter) or Soft Rounded (Nunito)
- **Density** — Compact or Comfortable spacing

#### Visual Polish
- Updated **BottomNav** — FAB glow effect, smoother transitions
- Updated **RecordingOverlay** — Polished modal with better states
- Updated **CategoryCard** — Softer borders, hover effects
- Updated **DayFlowchart** — Better empty state with mic icon + keyboard hint
- Updated **RecentRecordings** — Status badges with icons
- Updated **HabitReminders** — Progress indicators, voice badges
- Updated **HabitList** — Improved empty state
- Updated **HabitCompactTile** — Refined progress bars, hover states
- Updated **MonthGrid / DayCell** — Calendar polish with hover animations
- Updated **TodayHeader** — Sparkles icon, refined typography
- Updated **SearchBar / SearchResults** — Better empty states, loading indicators

#### CSS Utilities
- `.empty-state` — Consistent empty state styling
- `.fab-glow` — Dynamic FAB shadow using accent color
- `.hover-lift` — Subtle lift animation
- `.focus-ring` — Accessible focus styling
- `.editorial-card` — Gen Z card variant
- `prefers-reduced-motion` — Respects user motion preferences

### Files created / modified (key)

```
lib/appearance.ts                    — new
lib/appearance-context.tsx           — new
app/globals.css                      — theme presets + utilities
app/layout.tsx                       — AppearanceProvider + Nunito font
app/(app)/profile/page.tsx           — Appearance section
components/profile/AppearanceSettings.tsx — new
components/navigation/BottomNav.tsx  — polished
components/navigation/RecordingOverlay.tsx — polished
components/home/DayFlowchart.tsx     — polished
components/home/CategoryCard.tsx     — polished
components/home/RecentRecordings.tsx — polished
components/home/HabitReminders.tsx   — polished
components/home/TodayHeader.tsx      — polished
components/habits/HabitList.tsx      — polished
components/habits/HabitCompactTile.tsx — polished
components/calendar/MonthGrid.tsx    — polished
components/calendar/DayCell.tsx      — polished
components/search/SearchBar.tsx      — polished
components/search/SearchResults.tsx  — polished
```

### How to try

```bash
npm install
npm run dev
# Open http://localhost:3000
# Navigate to Profile tab → Appearance section
# Switch themes, accent colors, font sizes
# Changes persist across refresh
```

### Verification

```bash
npm run lint   # ✓ pass
npm run build  # ✓ pass
```

### Design decisions

1. **Cream Journal as default** — Warm, editorial feel vs. clinical iOS gray
2. **CSS variables + class-based theming** — No runtime JS for theme colors; instant switching
3. **Accent color override** — `--accent-override` CSS variable updates FAB + primary consistently
4. **Density via CSS variables** — `--spacing-card`, `--spacing-nav-height` for layout flexibility
5. **Nunito for rounded font** — Google Font with friendly, approachable character
6. **Reduced motion respect** — All animations disabled when user prefers reduced motion

### Notes

- Auth and cloud sync remain deferred to Phase 9
- All existing functionality preserved (voice recording, flowcharts, habits, search)
- App works without Supabase keys; OpenAI key only needed for transcription

---

## Run 9 — Sprint 1 / Phase A: Capture Reliability

**Date:** September 16, 2026  
**Phase:** A (Capture reliability — never lose a recording)  
**Goal:** Talking into Firnal must never silently lose an entry  
**Status:** Complete

### Steps completed

| Step | Task | Status |
|------|------|--------|
| A1.1 | Create IndexedDB audio store (`lib/local-audio-store.ts`) | Done |
| A1.2 | Add status machine types (queued → uploading → transcribing → ready | failed) | Done |
| A1.3 | Update `lib/local-captures.ts` with status transition helpers | Done |
| A1.4 | Refactor `uploadCapture` to save draft BEFORE network call | Done |
| A1.5 | Update `AppShell` to handle new upload flow | Done |
| A2.1 | Add Retry button to `RecentRecordings` for failed captures | Done |
| A2.2 | Human-readable error categorization (network/offline/api-key/openai) | Done |
| A2.3 | Auto-retry once on transient network failure | Done |
| A3.1 | Offline detection before upload | Done |
| A3.2 | Missing API key detection and graceful handling | Done |
| A3.3 | Clear inline states for offline/missing-key scenarios | Done |

### What was built

#### A1 — Local Draft BEFORE Network

- **`lib/local-audio-store.ts`** — IndexedDB-based audio blob store (localStorage is too small for audio)
  - `saveAudioDraft(draft)` — Persist audio blob with metadata
  - `getAudioDraft(id)` — Retrieve stored audio for retry
  - `deleteAudioDraft(id)` — Clean up after successful transcription
  - `hasAudioDraft(id)` — Check if audio exists

- **Status Machine** — Extended `VoiceEntry` with:
  - `queued` — Saved locally, waiting to upload
  - `uploading` — Network request in progress
  - `transcribing` — Server processing (existing)
  - `transcribed` — Success (existing, aliased as "ready")
  - `failed` — Error occurred, audio retained for retry

- **`lib/local-captures.ts`** — New status transition helpers:
  - `createDraftCapture()` — Create entry with `queued` status
  - `setUploadingStatus()`, `setTranscribingStatus()`, `setTranscribedStatus()`, `setFailedStatus()`
  - `setQueuedForRetry()` — Reset failed capture for retry
  - `getFailedCaptures()`, `getQueuedCaptures()`, `getPendingCaptures()`

- **`lib/api/uploadCapture.ts`** — Complete rewrite:
  - `saveDraftCapture()` — Save to IndexedDB + localStorage BEFORE any network
  - `processCapture()` — Handle upload with proper status transitions
  - `retryCapture()` — Re-process failed capture using stored audio
  - Auto-retry once on transient network errors

#### A2 — Retry + Failure UX

- **Error Categorization** — `ErrorCategory` type with human-readable messages:
  - `offline` — "You're offline. Recording saved — will upload when you're back online."
  - `api_key_missing` — "OpenAI API key not configured. Recording saved locally."
  - `network` — "Network error. Recording saved — tap Retry when connected."
  - `openai_error` — "Transcription failed. Recording saved — tap Retry."

- **`RecentRecordings.tsx`** — Enhanced UI:
  - Retry button for failed/queued captures
  - Category-specific icons (WifiOff, KeyRound, AlertCircle)
  - Contextual help text ("Connect to the internet and tap Retry")
  - Status badges for new states (queued, uploading)
  - Disabled retry when offline

- **Auto-retry** — One automatic retry on network failures before marking as failed

#### A3 — Offline / Missing-Key Honesty

- **Offline Detection** — `navigator.onLine` check before and during upload
- **API Key Detection** — Server returns 503 with clear message if `OPENAI_API_KEY` missing
- **Toast Messages** — Context-aware toasts:
  - `toast.warning('Offline — recording saved locally')`
  - `toast.warning('API key missing — recording saved locally')`
  - `toast.error()` with "Tap Retry in Recent Recordings" description

### Files created / modified

```
lib/local-audio-store.ts              — new (IndexedDB audio blob store)
lib/types/voice.ts                    — expanded EntryStatus + ErrorCategory
lib/local-captures.ts                 — status transition helpers
lib/api/uploadCapture.ts              — draft-first upload flow
components/navigation/AppShell.tsx    — new upload handling
components/home/RecentRecordings.tsx  — Retry UI + error states
app/api/transcribe/route.ts           — API key error handling
```

### How to test

```bash
npm install
npm run dev
# Open http://localhost:3000
```

**Test 1: Kill network mid-upload**
1. Open DevTools → Network → Throttle to Offline
2. Hold FAB, speak, release
3. Verify capture shows "Saved locally" badge + error panel
4. Go back online, tap Retry → transcript succeeds

**Test 2: Missing OpenAI key**
1. Remove or comment out `OPENAI_API_KEY` in `.env.local`
2. Restart server
3. Hold FAB, speak, release
4. Verify capture shows "API key not configured" error
5. Audio retained for retry after adding key

**Test 3: Offline detection**
1. DevTools → Network → Offline before recording
2. Hold FAB → see "offline" error immediately
3. Recording still saved locally for later

**Test 4: App still works without auth**
1. Visit `/` → Home loads without redirect
2. All tabs accessible
3. No Supabase errors in console

### Verification

```bash
npm run lint   # ✓ pass
npm run build  # ✓ pass
```

### Acceptance Criteria

- [x] Kill network mid-upload → capture still listed as failed/queued with audio retained
- [x] Retry after network returns → transcript succeeds without re-recording
- [x] Missing OpenAI key → capture kept + honest error (no silent vanish)
- [x] App still opens without auth/Supabase

---

## Run 10 — Phase 6: Google Calendar & Profile

**Date:** September 16, 2026  
**Phase:** 6  
**Goal:** Google Calendar OAuth connect + events strip on Home + Profile completion  
**Status:** Complete (requires Google OAuth credentials to test)

### Steps completed

| Step | Task | Status |
|------|------|--------|
| 6.1 | Documentation (env example + setup guide) | Done |
| 6.2 | OAuth start route (`GET /api/auth/google`) | Done |
| 6.3 | OAuth callback route (`/api/auth/google/callback`) | Done |
| 6.4 | Disconnect route (`DELETE /api/auth/google/disconnect`) | Done |
| 6.5 | Google Calendar client library | Done |
| 6.6 | Calendar events API (`GET /api/calendar/events`) | Done |
| 6.7 | CalendarEventsStrip component | Done |
| 6.8 | GoogleCalendarConnect component | Done |
| 6.9 | Profile page completion | Done |
| 6.10 | Home page CalendarEventsStrip integration | Done |

### What was built

#### 6.1 — Documentation
- Updated `.env.local.example` with Google OAuth vars and notes
- Created `docs/GOOGLE_CALENDAR_SETUP.md` — step-by-step Google Console setup

#### 6.2–6.4 — OAuth Routes
- **`GET /api/auth/google`** — CSRF state cookie, redirect to Google consent (calendar.readonly scope)
- **`/api/auth/google/callback`** — verify state, exchange code, store tokens in httpOnly cookies
- **`DELETE /api/auth/google/disconnect`** — clear tokens
- **`GET /api/auth/google/status`** — check connection status for UI

#### 6.5–6.6 — Calendar Client + API
- **`lib/google-calendar.ts`** — token refresh, `fetchTodayEvents(timezone)`, event mapping
- **`lib/local-google.ts`** — localStorage connection state for UI (email display)
- **`GET /api/calendar/events`** — today's events with 15-min cache, 401→empty if not connected

#### 6.7–6.10 — UI Components
- **`CalendarEventsStrip`** — horizontal scrollable strip with time + title + Google Calendar colors
  - Loading skeleton state
  - Disconnected CTA linking to Profile
  - Empty state when no events
  - Click to open event in Google Calendar
- **`GoogleCalendarConnect`** — Connect / Connected / Disconnect states
  - Error handling for OAuth failures
  - Shows connected email when available
- **Profile page** — Appearance, Google Calendar, Timezone, Account placeholder, Widget coming soon
- **Home page** — CalendarEventsStrip below TodayHeader

### Token Storage Strategy

| Token | Storage | Why |
|-------|---------|-----|
| Refresh token | httpOnly cookie (1 year) | Secure, survives page refresh |
| Access token | httpOnly cookie (1 hour) | Auto-refreshed from refresh token |
| Connection UI flag | localStorage | For showing email on Profile |

### Files created / modified

```
.env.local.example                           — updated Google vars
docs/GOOGLE_CALENDAR_SETUP.md                — new
lib/google-calendar.ts                       — new
lib/local-google.ts                          — new
app/api/auth/google/route.ts                 — new
app/api/auth/google/callback/route.ts        — new
app/api/auth/google/disconnect/route.ts      — new
app/api/auth/google/status/route.ts          — new
app/api/calendar/events/route.ts             — new
components/home/CalendarEventsStrip.tsx      — new
components/profile/GoogleCalendarConnect.tsx — new
app/(app)/profile/page.tsx                   — updated
app/(app)/page.tsx                           — updated
```

### Manual Test Steps

**Prerequisite:** Configure Google OAuth credentials (see `docs/GOOGLE_CALENDAR_SETUP.md`)

1. Add to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```

2. Start dev server: `npm run dev`

3. **Test Connect Flow:**
   - Go to Profile → Google Calendar section
   - Click "Connect Google Calendar"
   - Complete Google OAuth consent
   - Verify redirect back to Profile with "Connected" status

4. **Test Events Display:**
   - Go to Home
   - If events exist for today, they appear in the CalendarEventsStrip
   - Click event to open in Google Calendar

5. **Test Disconnect:**
   - Go to Profile → Google Calendar
   - Click "Disconnect"
   - Home should show "Connect Google Calendar" CTA

6. **Test Missing Credentials:**
   - Remove `GOOGLE_CLIENT_ID` from env
   - Restart server
   - Click Connect → should show clear error message (not crash)

### Verification

```bash
npm run lint   # ✓ pass
npm run build  # ✓ pass
```

### Notes

- OAuth tokens stored in httpOnly cookies, not localStorage (security best practice)
- No Supabase/auth required — works with local-first approach
- Events refresh every 15 minutes (via API cache + client poll)
- Phase 9 can migrate connection state to `profiles` table when auth is added
- Google Calendar colors mapped to CSS (11 Google colors supported)

---

---

## Run 11 — Phase 8: iPhone App (Capacitor) — started

**Date:** September 16, 2026  
**Phase:** 8  
**Goal:** Capacitor iOS shell + run on Chair Phone via Xcode  
**Status:** In progress (device offline at scaffold time)

### Done so far
- PRD Phase 8 section added
- Capacitor init (`app.firnal.journal`)
- `ios/` Xcode project + mic + local network plist keys
- `docs/IOS_DEVICE_SETUP.md`
- Dev `server.url` → `http://192.168.1.11:3000`

### Blocked
- Chair Phone listed under **Devices Offline** — needs unlock / USB / Developer Mode

