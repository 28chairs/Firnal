# FIRNAL — Launch Checklist

Pre-production checklist for deploying FIRNAL.

---

## 1. Environment Variables

Ensure these are set in your deployment platform (Vercel, etc.):

| Variable | Required | Notes |
|----------|----------|-------|
| `OPENAI_API_KEY` | Yes | For Whisper transcription and GPT flowchart |
| `NEXT_PUBLIC_SUPABASE_URL` | No* | Optional until Phase 9 auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No* | Optional until Phase 9 auth |
| `SUPABASE_SERVICE_ROLE_KEY` | No* | Server-only; optional until Phase 9 |
| `GOOGLE_CLIENT_ID` | No | For Google Calendar integration |
| `GOOGLE_CLIENT_SECRET` | No | For Google Calendar integration |
| `GOOGLE_REDIRECT_URI` | No | Must match OAuth console config |

\* App works local-first without Supabase credentials

---

## 2. Pre-Deploy Checks

### Build

```bash
npm run lint     # Ensure no lint errors
npm run build    # Verify production build succeeds
```

### PWA Assets

- [ ] `public/icon-192.png` exists
- [ ] `public/icon-512.png` exists
- [ ] `public/manifest.json` has correct app name and colors
- [ ] Service worker generated in `public/sw.js` after build

### Critical Paths

- [ ] Home page loads without errors
- [ ] Recording overlay opens on FAB hold
- [ ] Voice capture completes (requires mic + OpenAI key)
- [ ] Flowchart generates from transcripts
- [ ] Calendar tab shows month grid
- [ ] Habits tab shows habit list
- [ ] Search returns results
- [ ] Profile settings persist (appearance, timezone)

---

## 3. Deploy to Vercel

### Initial Setup

1. Connect GitHub repo to Vercel
2. Add environment variables in Project Settings → Environment Variables
3. Deploy from main branch

### Deploy Command

Vercel auto-detects Next.js. Ensure:
- Build Command: `npm run build` (uses `next build --webpack` for SW generation)
- Output Directory: `.next`
- Install Command: `npm install`

### Post-Deploy Verification

- [ ] Production URL loads
- [ ] HTTPS enforced
- [ ] Service worker registers (check DevTools → Application → Service Workers)
- [ ] PWA installable (check install prompt or "Add to Home Screen")

---

## 4. Smoke Tests (Production)

### Core Flow

1. Open production URL on mobile device
2. "Add to Home Screen" if prompted
3. Launch from home screen (standalone mode)
4. Hold FAB → record for 3+ seconds → release
5. Verify transcript appears in Recent Recordings
6. Verify flowchart generates with categories

### Offline Behavior

1. Enable Airplane Mode (or DevTools offline)
2. Navigate between cached tabs (Home, Calendar, Habits)
3. Attempt recording → verify "offline" message appears
4. Recording saved locally with retry option
5. Restore network → tap Retry → transcript completes

### Cross-Browser

- [ ] Chrome (desktop + mobile)
- [ ] Safari (iOS)
- [ ] Firefox (optional)

---

## 5. Performance (Manual)

Lighthouse audit not run in CI. Run manually:

1. Open Chrome DevTools → Lighthouse
2. Run audit on mobile preset
3. Check:
   - Performance score
   - Accessibility score
   - Best Practices score
   - PWA compliance

**Note:** Lighthouse scores not measured in automated pipeline. Run manually post-deploy.

---

## 6. Known Limitations

### Current Phase

- **No authentication** — All data stored locally (Phase 9)
- **No cloud sync** — Recordings/habits stay on device
- **Google Calendar** — Requires OAuth setup in Google Console

### Service Worker

- Serwist requires `--webpack` build flag (Turbopack not supported)
- SW only generated in production builds
- Dev mode uses Turbopack without SW

### Mobile

- iOS Safari: Must use HTTPS for microphone access
- Android: Chrome recommended for best PWA experience

---

## 7. Rollback Plan

If critical issues discovered:

1. Vercel: Instant Rollback to previous deployment in dashboard
2. Or revert commit and redeploy

---

## 8. Post-Launch

- Monitor error logging (add Sentry if desired)
- Watch for service worker cache issues on updates
- Gather user feedback on voice capture reliability

---

**Last updated:** Phase 7 — PWA Polish & Launch
