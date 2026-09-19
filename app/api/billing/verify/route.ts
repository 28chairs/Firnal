import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/billing/stripe';

const bodySchema = z.object({
  sessionId: z.string().min(1),
});

function determinePlanFromPriceId(priceId: string | undefined): string {
  if (!priceId) return 'free';

  const monthlyId = process.env.STRIPE_PRICE_PLUS_MONTHLY;
  const yearlyId = process.env.STRIPE_PRICE_PLUS_YEARLY;
  const foundingId = process.env.STRIPE_PRICE_FOUNDING_YEARLY;
  const lifetimeId = process.env.STRIPE_PRICE_LIFETIME;

  if (priceId === monthlyId) return 'plus';
  if (priceId === yearlyId) return 'plus';
  if (priceId === foundingId) return 'founding';
  if (priceId === lifetimeId) return 'lifetime';

  return 'free';
}

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(body.sessionId, {
      expand: ['subscription', 'subscription.items.data.price', 'line_items.data.price'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const customerEmail =
      session.customer_email ?? session.customer_details?.email ?? null;
    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id ?? null;

    let plan = 'free';

    if (session.mode === 'subscription' && session.subscription) {
      const subscription = session.subscription as {
        items?: { data?: Array<{ price?: { id?: string } }> };
      };
      const priceId = subscription.items?.data?.[0]?.price?.id;
      plan = determinePlanFromPriceId(priceId);
    }

    if (session.mode === 'payment') {
      const lineItems = session.line_items?.data ?? [];
      const priceId =
        typeof lineItems[0]?.price === 'object' ? lineItems[0].price?.id : undefined;
      plan = determinePlanFromPriceId(priceId);
    }

    return NextResponse.json({
      plan,
      email: customerEmail,
      customerId,
    });
  } catch (err) {
    console.error('Verify session error:', err);
    const message = err instanceof Error ? err.message : 'Failed to verify session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
