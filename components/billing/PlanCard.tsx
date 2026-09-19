'use client';

import { useState } from 'react';
import { Check, Sparkles, Crown, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PLANS, type PlanType, YEARLY_PRICE, FREE_AI_QUOTA } from '@/lib/billing/plans';

interface PlanCardProps {
  plan: PlanType;
  currentPlan: PlanType;
  onUpgrade: (plan: string) => void;
  loading?: boolean;
}

const PLAN_ICONS: Record<PlanType, React.ReactNode> = {
  free: <Zap className="size-5 text-muted-foreground" />,
  plus: <Sparkles className="size-5 text-blue-500" />,
  founding: <Crown className="size-5 text-amber-500" />,
  lifetime: <Star className="size-5 text-purple-500" />,
};

export function PlanCard({ plan, currentPlan, onUpgrade, loading }: PlanCardProps) {
  const config = PLANS[plan];
  const isCurrent = plan === currentPlan;
  const isUpgrade = !isCurrent && plan !== 'free';

  return (
    <Card
      className={
        isCurrent
          ? 'ring-2 ring-primary'
          : isUpgrade
            ? 'hover:ring-1 hover:ring-primary/50 transition-all'
            : ''
      }
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {PLAN_ICONS[plan]}
          <CardTitle className="text-base">{config.name}</CardTitle>
          {isCurrent && (
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Current
            </span>
          )}
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline gap-1">
          {config.price === 0 ? (
            <span className="text-2xl font-bold">Free</span>
          ) : (
            <>
              <span className="text-2xl font-bold">${config.price}</span>
              <span className="text-sm text-muted-foreground">
                {config.period === 'monthly'
                  ? '/mo'
                  : config.period === 'yearly'
                    ? '/yr'
                    : ' once'}
              </span>
            </>
          )}
        </div>

        <ul className="flex flex-col gap-1.5 text-sm">
          {config.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {isUpgrade && (
          <Button
            className="mt-2 w-full"
            onClick={() => {
              if (plan === 'plus') {
                onUpgrade('plus-monthly');
              } else if (plan === 'founding') {
                onUpgrade('founding');
              } else if (plan === 'lifetime') {
                onUpgrade('lifetime');
              }
            }}
            disabled={loading}
          >
            {loading ? 'Loading...' : `Upgrade to ${config.name}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface UpgradeSectionProps {
  currentPlan: PlanType;
  quotaUsed: number;
  quotaRemaining: number;
}

export function UpgradeSection({ currentPlan, quotaUsed, quotaRemaining }: UpgradeSectionProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (plan: string) => {
    setLoading(plan);
    setError(null);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {currentPlan === 'free' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">AI Usage This Week</CardTitle>
            <CardDescription>
              {quotaRemaining > 0
                ? `${quotaRemaining} AI day-maps remaining`
                : 'Weekly quota exhausted — upgrade for unlimited'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              {Array.from({ length: FREE_AI_QUOTA }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < quotaUsed ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <PlanCard
          plan="plus"
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
          loading={loading === 'plus-monthly'}
        />
        <PlanCard
          plan="founding"
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
          loading={loading === 'founding'}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Card className="flex-1">
          <CardContent className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium">Plus Yearly</p>
              <p className="text-sm text-muted-foreground">
                ${YEARLY_PRICE}/year — save ${(9.99 * 12 - YEARLY_PRICE).toFixed(0)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpgrade('plus-yearly')}
              disabled={loading === 'plus-yearly' || currentPlan !== 'free'}
            >
              {loading === 'plus-yearly' ? 'Loading...' : 'Choose'}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium">Lifetime</p>
              <p className="text-sm text-muted-foreground">$179 once — 100 seats max</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpgrade('lifetime')}
              disabled={loading === 'lifetime' || currentPlan !== 'free'}
            >
              {loading === 'lifetime' ? 'Loading...' : 'Choose'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
