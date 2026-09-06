# FIRNAL

Voice-first AI journaling PWA. Hold the mic, ramble about your day, and let AI turn it into a structured daily flowchart — Commitments, Decisions, Ideas, People, and Questions.

See [PRD.md](./PRD.md) for full product spec and [BUILD_LOG.md](./BUILD_LOG.md) for implementation progress.

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Add Supabase keys — see docs/SUPABASE_SETUP.md
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS 4 · shadcn/ui
- Supabase (auth + DB) — Phase 1+
- OpenAI Whisper + GPT — Phase 2+

## Project docs

- [PRD.md](./PRD.md) — product requirements
- [BUILD_LOG.md](./BUILD_LOG.md) — build run log
- [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) — Supabase manual setup
