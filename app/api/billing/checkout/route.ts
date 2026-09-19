import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession } from '@/lib/billing/stripe';

const bodySchema = z.object({
  plan: z.enum(['plus-monthly', 'plus-yearly', 'founding', 'lifetime']),
  email: z.string().email().optional(),
});

function getPriceIdForPlan(plan: string): { priceId: string; mode: 'subscription' | 'payment' } {
  switch (plan) {
    case 'plus-monthly':
      return {
        priceId: process.env.STRIPE_PRICE_PLUS_MONTHLY!,
        mode: 'subscription',
      };
    case 'plus-yearly':
      return {
        priceId: process.env.STRIPE_PRICE_PLUS_YEARLY!,
        mode: 'subscription',
      };
    case 'founding':
      return {
        priceId: process.env.STRIPE_PRICE_FOUNDING_YEARLY!,
        mode: 'subscription',
      };
    case 'lifetime':
      return {
        priceId: process.env.STRIPE_PRICE_LIFETIME!,
        mode: 'payment',
      };
    default:
      throw new Error(`Unknown plan: ${plan}`);
  }
}

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const { priceId, mode } = getPriceIdForPlan(body.plan);

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for plan: ${body.plan}` },
        { status: 500 }
      );
    }

    const session = await createCheckoutSession({
      priceId,
      mode,
      email: body.email,
      successUrl: `${appUrl}/profile?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/profile?billing=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    const message = err instanceof Error ? err.message : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
