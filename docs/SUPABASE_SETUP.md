# Supabase Setup (Phase 0.8)

Complete these steps in the [Supabase Dashboard](https://supabase.com/dashboard) before Phase 1.

## 1. Create project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name (e.g. `firnal-dev`), password, and region
3. Wait for the project to finish provisioning

## 2. Copy API keys

1. **Project Settings** → **API**
2. Copy into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` → service_role key (server only)

## 3. Enable Email auth (magic link)

1. **Authentication** → **Providers** → **Email**
2. Enable Email provider
3. Confirm **Confirm email** is off for magic-link OTP (or configure per preference)

## 4. Configure URLs

1. **Authentication** → **URL Configuration**
2. **Site URL:** `http://localhost:3000`
3. **Redirect URLs:** add `http://localhost:3000/auth/callback`

## 5. Run migration (Phase 1)

After Phase 1 creates `supabase/migrations/001_init.sql`, run it via:

- Supabase Dashboard → **SQL Editor** → paste and run, or
- Supabase CLI: `supabase db push`

---

Production: repeat URL steps with your Vercel domain when deploying (Phase 7).
