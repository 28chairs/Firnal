export type PlanType = 'free' | 'plus' | 'founding' | 'lifetime';

export type BillingPeriod = 'monthly' | 'yearly' | 'once';

export interface QuotaLimits {
  aiMapsPerWeek: number | null;
  aiMapsPerMonth: number | null;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: number;
  period: BillingPeriod;
  priceId: string | null;
  description: string;
  features: string[];
  quotas: QuotaLimits;
}

export const FREE_AI_MAPS_PER_WEEK = 2;
export const PLUS_AI_MAPS_PER_MONTH = 60;
export const LIFETIME_SEAT_CAP = 100;

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'monthly',
    priceId: null,
    description: 'Local capture only',
    features: [
      'Hold-to-talk voice capture',
      'Local recording storage',
      `${FREE_AI_MAPS_PER_WEEK} AI day-maps per week`,
    ],
    quotas: {
      aiMapsPerWeek: FREE_AI_MAPS_PER_WEEK,
      aiMapsPerMonth: null,
    },
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    price: 9.99,
    period: 'monthly',
    priceId: 'STRIPE_PRICE_PLUS_MONTHLY',
    description: 'Full AI features',
    features: [
      'Everything in Free',
      'AI day-maps',
      'Habits from voice detection',
      'Calendar AI features',
    ],
    quotas: {
      aiMapsPerWeek: null,
      aiMapsPerMonth: PLUS_AI_MAPS_PER_MONTH,
    },
  },
  founding: {
    id: 'founding',
    name: 'Founding Annual',
    price: 49,
    period: 'yearly',
    priceId: 'STRIPE_PRICE_FOUNDING_YEARLY',
    description: '$49/yr for 30 days only, then $79/yr',
    features: [
      'Everything in Plus',
      '$49/yr rate (30 days only)',
      'Founding member badge',
    ],
    quotas: {
      aiMapsPerWeek: null,
      aiMapsPerMonth: PLUS_AI_MAPS_PER_MONTH,
    },
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    price: 179,
    period: 'once',
    priceId: 'STRIPE_PRICE_LIFETIME',
    description: 'One-time, fair-use AI (100 seats max)',
    features: [
      'Everything in Plus',
      'One-time payment',
      'Fair-use AI',
      `Limited to ${LIFETIME_SEAT_CAP} seats`,
    ],
    quotas: {
      aiMapsPerWeek: null,
      aiMapsPerMonth: PLUS_AI_MAPS_PER_MONTH,
    },
  },
};

export const YEARLY_PRICE = 79;

export function getPlanById(id: PlanType): PlanConfig {
  return PLANS[id];
}

export function getPlanByPriceId(priceId: string): PlanConfig | null {
  const monthlyId = process.env.STRIPE_PRICE_PLUS_MONTHLY;
  const yearlyId = process.env.STRIPE_PRICE_PLUS_YEARLY;
  const foundingId = process.env.STRIPE_PRICE_FOUNDING_YEARLY;
  const lifetimeId = process.env.STRIPE_PRICE_LIFETIME;

  if (priceId === monthlyId) return PLANS.plus;
  if (priceId === yearlyId) return PLANS.plus;
  if (priceId === foundingId) return PLANS.founding;
  if (priceId === lifetimeId) return PLANS.lifetime;
  return null;
}

export function isPaidPlan(plan: PlanType): boolean {
  return plan === 'plus' || plan === 'founding' || plan === 'lifetime';
}

export function getStripeMetadata(plan: PlanType): Record<string, string> {
  const config = PLANS[plan];
  const metadata: Record<string, string> = {
    plan_type: plan,
  };

  if (config.quotas.aiMapsPerWeek !== null) {
    metadata.ai_maps_per_week = String(config.quotas.aiMapsPerWeek);
  }
  if (config.quotas.aiMapsPerMonth !== null) {
    metadata.ai_maps_per_month = String(config.quotas.aiMapsPerMonth);
  }
  if (plan === 'lifetime') {
    metadata.lifetime_seat_cap = String(LIFETIME_SEAT_CAP);
  }

  return metadata;
}
