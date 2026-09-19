# Stripe Billing Setup

Firnal uses Stripe for subscription billing. This guide explains how to set up Stripe in test mode and production.

## Pricing Plans

| Plan | Price | Type | Price ID Env Var |
|------|-------|------|------------------|
| **Free** | $0 | — | — |
| **Plus Monthly** | $9.99/mo | Subscription | `STRIPE_PRICE_PLUS_MONTHLY` |
| **Plus Yearly** | $79/yr | Subscription | `STRIPE_PRICE_PLUS_YEARLY` |
| **Founding Annual** | $49/yr | Subscription | `STRIPE_PRICE_FOUNDING_YEARLY` |
| **Lifetime** | $179 once | One-time | `STRIPE_PRICE_LIFETIME` |

### Plan Rules

- **Free**: Local voice capture works, AI day-map limited to 2/week
- **Plus/Founding/Lifetime**: Unlimited AI day-maps, habits-from-voice detection, calendar AI

## Stripe Dashboard Setup

### 1. Create Products

In [Stripe Dashboard > Products](https://dashboard.stripe.com/test/products):

1. **Firnal Plus**
   - Create product "Firnal Plus"
   - Add price: $9.99 USD, recurring monthly
   - Add price: $79 USD, recurring yearly
   
2. **Firnal Founding Annual**
   - Create product "Firnal Founding Annual"
   - Add price: $49 USD, recurring yearly
   - Note: This is a limited-time offer (30 days from launch)

3. **Firnal Lifetime**
   - Create product "Firnal Lifetime"
   - Add price: $179 USD, one-time
   - Note: Hard cap at 100 seats

### 2. Copy Price IDs

Each price has an ID like `price_1ABC123...`. Copy these to your `.env.local`:

```bash
STRIPE_PRICE_PLUS_MONTHLY=price_xxxxx
STRIPE_PRICE_PLUS_YEARLY=price_xxxxx
STRIPE_PRICE_FOUNDING_YEARLY=price_xxxxx
STRIPE_PRICE_LIFETIME=price_xxxxx
```

### 3. Get API Keys

From [Stripe Dashboard > Developers > API Keys](https://dashboard.stripe.com/test/apikeys):

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### 4. Set Up Webhooks

#### Local Development

Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
stripe login
```

Forward webhooks to local:
```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

Copy the webhook signing secret:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

#### Production

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `https://your-domain.com/api/billing/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## Testing Checkout

### Test Cards

| Number | Description |
|--------|-------------|
| `4242 4242 4242 4242` | Succeeds |
| `4000 0000 0000 3220` | Requires 3D Secure |
| `4000 0000 0000 9995` | Declined |

Use any future expiry date and any 3-digit CVC.

### Test Flow

1. Start the dev server: `npm run dev`
2. Start Stripe CLI: `stripe listen --forward-to localhost:3000/api/billing/webhook`
3. Go to `/profile`
4. Click "Upgrade to Plus"
5. Complete checkout with test card `4242 4242 4242 4242`
6. You should be redirected to `/profile?billing=success`
7. Plan status should update to "Plus"

## Architecture

### Client-Side State

Plan state is stored in `localStorage` (key: `firnal:billing-plan`) until Phase 9 auth:

```typescript
{
  plan: 'free' | 'plus' | 'founding' | 'lifetime',
  email: string | null,
  stripeCustomerId: string | null,
  updatedAt: string | null
}
```

AI quota is tracked in `localStorage` (key: `firnal:ai-quota`):

```typescript
{
  weekStart: string, // ISO date of Monday
  used: number       // 0-2 for free tier
}
```

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/billing/checkout` | POST | Create Stripe Checkout session |
| `/api/billing/webhook` | POST | Handle Stripe webhook events |
| `/api/billing/verify` | POST | Verify checkout session after redirect |

### Entitlement Checks

```typescript
import { hasAIAccess, consumeAIQuota } from '@/lib/billing/entitlements';

// Check if user can use AI features
if (hasAIAccess()) {
  // Make AI call
  consumeAIQuota(); // Decrement quota for free users
}
```

## Going Live

1. Switch to production API keys in Stripe Dashboard
2. Create production products/prices (same setup as test)
3. Update environment variables with production values
4. Set up production webhook endpoint
5. Test with real card (small amount, refund after)

## Founding Annual Offer

The founding annual rate ($49/yr instead of $79/yr) is a 30-day launch special:

1. After 30 days, hide the "Founding Annual" option from the UI
2. Existing founding subscribers keep their rate
3. Archive the founding price in Stripe Dashboard (don't delete)
