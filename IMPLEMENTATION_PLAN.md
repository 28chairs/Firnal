# Firnal — Implementation Plan (from gap.md)

**Date:** 2026-09-15 (PT)  
**North star:** *Hold the mic. Get your day structured. Habits that hear you.*  
**Source:** [gap.md](./gap.md)  
**Constraint:** Stay local-first until Phase 9; ship deliverable loops before Google Calendar (old Phase 6).

---

## Guiding rules

1. **P0 before polish sprawl** — Never lose a recording; structure must appear fast.
2. **Artifact > chat** — Flowchart cards are the product; don’t become a therapy chatbot.
3. **Each slice ends on localhost** — Claire reviews at http://localhost:3000 before the next slice.
4. **Demo path** — Core loop works with only `OPENAI_API_KEY` (or a documented mock/demo mode).
5. **No therapy claims** — Insights are organizational, not clinical.

---

## Current baseline (already built)

| Area | Status |
|------|--------|
| Hold-FAB voice → Whisper (`/api/transcribe`) | Exists |
| Local captures (`lib/local-captures.ts`) | Exists |
| GPT flowchart + DayFlowchart UI | Exists |
| Habit CRUD + voice detect (`/api/habits/detect`) | Exists |
| Calendar + search (local) | Exists |
| Appearance themes (PR #1 redesign branch) | Exists |
| Auth / sync | Deferred (Phase 9) |
| Google Calendar | Not started (deprioritize vs gaps) |

---

## Phase A — P0 Capture reliability (G4)

**Goal:** Talking into Firnal never silently loses an entry.

### A1 — Local audio draft before network
- On FAB release, write blob/metadata to IndexedDB (or existing local store) **before** calling `/api/transcribe`.
- Persist status: `recording` → `queued` → `uploading` → `transcribed` | `failed`.
- Touch: `hooks/useMediaRecorder.ts`, `lib/local-captures.ts`, `lib/api/uploadCapture.ts`, `components/navigation/AppShell.tsx`.

### A2 — Retry + failure UX
- Failed rows show **Retry** (already partly there) + human error (“Mic OK, OpenAI failed”).
- Auto-retry once on transient network errors; keep audio for manual retry.
- Touch: `components/home/RecentRecordings.tsx`, `app/api/transcribe/route.ts`.

### A3 — Offline / missing-key honesty
- If offline or no `OPENAI_API_KEY`, keep local draft + clear banner (“Transcription needs key / network”).
- Optional: store transcript stub so UI doesn’t look empty.

**Done when:** Kill network mid-upload → recording still listed → Retry succeeds after network returns.  
**Localhost check:** Record 3 clips; fail one on purpose; confirm none disappear.

---

## Phase B — P0 Structured voice → flowchart (G1)

**Goal:** Tired-user path: speak → scannable day map in under ~30s perceived wait.

### B1 — Time-to-structure
- Keep 30s debounce but add **“Update day map”** manual button.
- Skeleton / progress on DayFlowchart while generating.
- Touch: `hooks/useDayJournal.ts`, `components/home/DayFlowchart.tsx`, `app/(app)/page.tsx`.

### B2 — Editable artifact (trust)
- Tap card → edit text / move category / delete / mark done (commitments).
- Persist edits in `lib/local-journal.ts`; don’t silently overwrite user edits on regen (merge strategy or “Regenerate (keeps edits)” confirm).
- Touch: `CategoryCard.tsx`, `lib/schemas.ts`, journal APIs if needed.

### B3 — Empty / first-run states
- First-open coach: one tip “Hold the rose button and ramble 20s.”
- Empty flowchart explains the five categories once.

**Done when:** New user can produce an edited flowchart without reading docs.  
**Localhost check:** Fresh profile → record → edit a misfiled card → refresh → edit sticks.

---

## Phase C — P1 Habits that listen (G2)

**Goal:** Habits feel magical once, then trustworthy forever.

### C1 — Detection visibility
- After transcript, toast: “Checked *Meditate* via voice” with Undo (10s).
- Habit chips show confidence / source badge already partially there — make consistent.
- Touch: `uploadCapture` → detect pipeline, `HabitReminders.tsx`, `lib/habit-detection.ts`.

### C2 — Onboarding demo habit
- Seed or prompt “Add one habit” → scripted example line in empty state.
- Settings toggle: Auto-detect on/off.

### C3 — Weekly “heard you” strip (lightweight)
- Habits tab: “This week, voice checked X times” from local completions metadata.
- Touch: `lib/habit-stats.ts` / `lib/local-habits.ts`, habits page.

**Done when:** Say habit name in a recording → chip flips → Undo works.  
**Localhost check:** Create habit → record phrase → verify + undo.

---

## Phase D — P1 Artifact-first polish (G5) + keep Appearance

**Goal:** Feel like a planner-journal hybrid, not a chat bot or checkbox app.

### D1 — Home information architecture
- Order: Today header → Habit chips → Day flowchart (hero) → Recent recordings (secondary).
- Reduce chrome; keep FAB dominant.

### D2 — Motion + density
- Respect `prefers-reduced-motion`; use Appearance density tokens from redesign.
- Soft connectors only when they aid scan (desktop).

### D3 — Positioning copy
- Profile / empty states use wedge line; no therapy language.

**Done when:** Screenshot test: stranger understands product in 5 seconds.  
**Localhost check:** Profile Appearance themes still work after layout tweaks.

---

## Phase E — P2 Privacy & AI boundary (G3)

**Goal:** Clear optional-AI story before sync/auth.

### E1 — In-app Privacy card (Profile)
- What leaves device (audio/transcript → OpenAI when key set).
- What’s local-only (captures, habits, journal cache).
- Link to short `docs/PRIVACY.md`.

### E2 — AI controls
- Toggle: Transcription + flowchart AI on/off.
- Off mode: keep recordings local; show “AI off — add key/enable to structure.”

**Done when:** Privacy section is accurate and matches real code paths.  
**Localhost check:** Toggle AI off → record → no OpenAI call (network tab / server logs).

---

## Phase F — P2 PWA deliverability (G6)

**Goal:** Installable phone demo.

### F1 — Manifest / icons / install affordance (partially started in redesign)
### F2 — Offline shell (app chrome + last local data)
### F3 — Mobile perf pass on Home + FAB

**Done when:** Add to Home Screen on iOS/Android Safari/Chrome; open offline chrome.  
**Localhost check:** DevTools offline + phone on LAN later if needed.

---

## Explicitly deferred (from gap.md “do not chase”)

| Item | Why defer |
|------|-----------|
| Google Calendar OAuth (old Phase 6) | Planner adjacency; not the wedge |
| Full Supabase auth sync (Phase 9) | After local loop is bulletproof |
| Therapy frameworks / coach chat | Wrong lane vs artifact UI |
| Day One–style media vault | Scope explosion |
| Habitica RPG | Different audience |

---

## Suggested build order (sprints)

| Sprint | Phase | Outcome | Localhost gate |
|--------|-------|---------|----------------|
| **1** | A1–A3 | Never-lose capture | Fail/retry demo |
| **2** | B1–B3 | Editable day map | Edit persists |
| **3** | C1–C2 | Habit via voice delight | Undo toast |
| **4** | D + E1 | Positioning + privacy | Copy + Privacy card |
| **5** | C3 + E2 + F | Insights toggle + PWA | Install + AI off |

Each sprint → PR on top of `cursor/genz-redesign-customizable-ui-57e8` (or merge redesign to main first) → pull to `/Users/clairehuang/Projects/Firnal` → Claire reviews localhost → next sprint.

---

## Merge / branch hygiene

1. Review & merge [PR #1](https://github.com/28chairs/Firnal/pull/1) (Appearance redesign) when happy.
2. Commit `gap.md` + this `IMPLEMENTATION_PLAN.md` to the working branch.
3. One PR per sprint above (small, reviewable).
4. Update `BUILD_LOG.md` per sprint.

---

## Success metrics (lightweight)

- **Activation:** First flowchart within first session.
- **Reliability:** 0 silent losses in test scripts of 20 recordings.
- **Habit magic:** ≥1 successful voice-check in first session when a habit exists.
- **Clarity:** Unprompted tester describes product as “voice → structured day” (not “AI chatbot”).

---

## Immediate next action

**Start Sprint 1 (Phase A)** — local audio draft + retry hardening — unless Claire reprioritizes.
