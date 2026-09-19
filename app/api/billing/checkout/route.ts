import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession } from '@/lib/billing/stripe';
import { PLUS_AI_MAPS_PER_MONTH, LIFETIME_SEAT_CAP } from '@/lib/billing/plans';

const bodySchema = z.object({
  plan: z.enum(['plus-monthly', 'plus-yearly', 'founding', 'lifetime']),
  email: z.string().email().optional(),
});

type PlanConfig = {
  priceId: string;
  mode: 'subscription' | 'payment';
  planType: string;
  metadata: Record<string, string>;
};

function getPlanConfig(plan: string): PlanConfig {
  const plusMetadata = {
    ai_maps_per_month: String(PLUS_AI_MAPS_PER_MONTH),
  };

  switch (plan) {
    case 'plus-monthly':
      return {
        priceId: process.env.STRIPE_PRICE_PLUS_MONTHLY!,
        mode: 'subscription',
        planType: 'plus',
        metadata: plusMetadata,
      };
    case 'plus-yearly':
      return {
        priceId: process.env.STRIPE_PRICE_PLUS_YEARLY!,
        mode: 'subscription',
        planType: 'plus',
        metadata: plusMetadata,
      };
    case 'founding':
      return {
        priceId: process.env.STRIPE_PRICE_FOUNDING_YEARLY!,
        mode: 'subscription',
        planType: 'founding',
        metadata: plusMetadata,
      };
    case 'lifetime':
      return {
        priceId: process.env.STRIPE_PRICE_LIFETIME!,
        mode: 'payment',
        planType: 'lifetime',
        metadata: {
          ai_maps_per_month: String(PLUS_AI_MAPS_PER_MONTH),
          lifetime_seat_cap: String(LIFETIME_SEAT_CAP),
        },
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
    const config = getPlanConfig(body.plan);

    if (!config.priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for plan: ${body.plan}` },
        { status: 500 }
      );
    }

    const session = await createCheckoutSession({
      priceId: config.priceId,
      mode: config.mode,
      planType: config.planType,
      metadata: config.metadata,
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
