import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2026-08-26.dahlia',
    });
  }
  return stripeInstance;
}

export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured');
  }
  return key;
}

export interface CheckoutParams {
  priceId: string;
  email?: string;
  successUrl: string;
  cancelUrl: string;
  mode: 'subscription' | 'payment';
}

export async function createCheckoutSession(
  params: CheckoutParams
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: params.mode,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  };

  if (params.email) {
    sessionParams.customer_email = params.email;
  }

  if (params.mode === 'subscription') {
    sessionParams.subscription_data = {
      metadata: {
        source: 'firnal-pwa',
      },
    };
  }

  if (params.mode === 'payment') {
    sessionParams.payment_intent_data = {
      metadata: {
        source: 'firnal-pwa',
      },
    };
  }

  return stripe.checkout.sessions.create(sessionParams);
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
