# Google Calendar Setup

This guide walks you through creating Google OAuth credentials for the Calendar integration.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it (e.g., "Firnal") and click **Create**
4. Make sure your new project is selected

## Step 2: Enable the Google Calendar API

1. Go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have Google Workspace) → **Create**
3. Fill in required fields:
   - **App name**: Firnal
   - **User support email**: your email
   - **Developer contact**: your email
4. Click **Save and Continue**
5. On **Scopes** screen, click **Add or Remove Scopes**
6. Find and add: `https://www.googleapis.com/auth/calendar.readonly`
7. Click **Update** → **Save and Continue**
8. On **Test users** screen, add your Google email for testing
9. Click **Save and Continue** → **Back to Dashboard**

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: "Firnal Web Client"
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://your-domain.com/api/auth/google/callback` (production)
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

## Step 5: Configure Environment Variables

Add to your `.env.local`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## Testing

1. Start the dev server: `npm run dev`
2. Go to Profile → Google Calendar section
3. Click **Connect Google Calendar**
4. Complete the OAuth flow
5. Return to Home to see today's calendar events

## Scopes Used

| Scope | Purpose |
|-------|---------|
| `calendar.readonly` | Read-only access to calendar events (titles, times, colors) |

We request only readonly access — Firnal never modifies your calendar.

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Verify the redirect URI matches exactly (including protocol and path)
- Check that you added yourself as a test user

### "Error 400: redirect_uri_mismatch"
- The redirect URI in your `.env.local` must match one of the Authorized redirect URIs in Google Console

### No events showing
- Ensure you have events scheduled for today
- Check browser console for API errors
- Verify the OAuth token was saved (check Application → Cookies in DevTools)

## Production Notes

Before going to production:
1. Submit your app for verification in OAuth consent screen
2. Add your production domain to authorized redirect URIs
3. Update `GOOGLE_REDIRECT_URI` in your production environment
