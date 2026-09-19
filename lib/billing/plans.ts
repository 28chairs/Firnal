export type PlanType = 'free' | 'plus' | 'founding' | 'lifetime';

export type BillingPeriod = 'monthly' | 'yearly' | 'once';

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: number;
  period: BillingPeriod;
  priceId: string | null;
  description: string;
  features: string[];
  aiMapsPerWeek: number | null;
}

export const FREE_AI_QUOTA = 2;

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
      `${FREE_AI_QUOTA} AI day-maps per week`,
    ],
    aiMapsPerWeek: FREE_AI_QUOTA,
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
      'Unlimited AI day-maps',
      'Habits from voice detection',
      'Calendar AI features',
    ],
    aiMapsPerWeek: null,
  },
  founding: {
    id: 'founding',
    name: 'Founding Annual',
    price: 49,
    period: 'yearly',
    priceId: 'STRIPE_PRICE_FOUNDING_YEARLY',
    description: 'Early supporter special — $49/yr for 30 days',
    features: [
      'Everything in Plus',
      'Locked at $49/yr forever',
      'Founding member badge',
    ],
    aiMapsPerWeek: null,
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
      'Fair-use AI (not uncapped)',
      'Limited to 100 seats',
    ],
    aiMapsPerWeek: null,
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

export function isUnlimitedPlan(plan: PlanType): boolean {
  return plan === 'plus' || plan === 'founding' || plan === 'lifetime';
}
