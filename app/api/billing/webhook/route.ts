import { NextResponse } from 'next/server';
import { constructWebhookEvent, getStripe } from '@/lib/billing/stripe';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(payload, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    console.error('Webhook verification error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', {
    sessionId: session.id,
    customerId: session.customer,
    customerEmail: session.customer_email ?? session.customer_details?.email,
    mode: session.mode,
    subscriptionId: session.subscription,
    paymentIntentId: session.payment_intent,
  });

  const stripe = getStripe();

  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
      { expand: ['items.data.price'] }
    );

    const priceId = subscription.items.data[0]?.price?.id;
    const plan = determinePlanFromPriceId(priceId);

    console.log(`User upgraded to ${plan} plan via subscription`);
  }

  if (session.mode === 'payment') {
    console.log('User purchased lifetime plan');
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('Subscription changed:', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    priceId: subscription.items.data[0]?.price?.id,
  });

  const priceId = subscription.items.data[0]?.price?.id;
  const plan = determinePlanFromPriceId(priceId);

  console.log(`Subscription ${subscription.status}: ${plan} plan`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amountPaid: invoice.amount_paid,
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    attemptCount: invoice.attempt_count,
  });
}

function determinePlanFromPriceId(priceId: string | undefined): string {
  if (!priceId) return 'unknown';

  const monthlyId = process.env.STRIPE_PRICE_PLUS_MONTHLY;
  const yearlyId = process.env.STRIPE_PRICE_PLUS_YEARLY;
  const foundingId = process.env.STRIPE_PRICE_FOUNDING_YEARLY;
  const lifetimeId = process.env.STRIPE_PRICE_LIFETIME;

  if (priceId === monthlyId) return 'plus';
  if (priceId === yearlyId) return 'plus';
  if (priceId === foundingId) return 'founding';
  if (priceId === lifetimeId) return 'lifetime';

  return 'unknown';
}
