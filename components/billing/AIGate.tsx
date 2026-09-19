'use client';

import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BILLING_CHANGED_EVENT,
  getBillingState,
  getAIQuotaRemaining,
  type BillingState,
} from '@/lib/billing/entitlements';
import { FREE_AI_QUOTA, isUnlimitedPlan } from '@/lib/billing/plans';

function subscribeBilling(onStoreChange: () => void) {
  window.addEventListener(BILLING_CHANGED_EVENT, onStoreChange);
  return () => window.removeEventListener(BILLING_CHANGED_EVENT, onStoreChange);
}

function getClientSnapshot(): { billing: BillingState; quotaRemaining: number } {
  return {
    billing: getBillingState(),
    quotaRemaining: getAIQuotaRemaining(),
  };
}

function getServerSnapshot(): { billing: BillingState; quotaRemaining: number } {
  return {
    billing: { plan: 'free', email: null, stripeCustomerId: null, updatedAt: null },
    quotaRemaining: FREE_AI_QUOTA,
  };
}

interface AIGateProps {
  children: React.ReactNode;
  feature?: string;
}

export function AIGate({ children, feature = 'AI day-map' }: AIGateProps) {
  const { billing, quotaRemaining } = useSyncExternalStore(
    subscribeBilling,
    getClientSnapshot,
    getServerSnapshot
  );

  const hasAccess = isUnlimitedPlan(billing.plan) || quotaRemaining > 0;

  if (hasAccess) {
    return <>{children}</>;
  }

  return <AIPaywall feature={feature} />;
}

interface AIPaywallProps {
  feature: string;
}

export function AIPaywall({ feature }: AIPaywallProps) {
  const router = useRouter();

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="size-6 text-primary" />
        </div>
        <CardTitle className="text-base">Weekly AI quota reached</CardTitle>
        <CardDescription className="max-w-xs">
          You&apos;ve used your {FREE_AI_QUOTA} free {feature}s this week. Upgrade to Plus for
          unlimited AI features.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <Button onClick={() => router.push('/profile')} className="gap-2">
          <Sparkles className="size-4" />
          Upgrade to Plus
        </Button>
        <p className="text-xs text-muted-foreground">Starting at $9.99/month</p>
      </CardContent>
    </Card>
  );
}

export function useAIAccess() {
  const { billing, quotaRemaining } = useSyncExternalStore(
    subscribeBilling,
    getClientSnapshot,
    getServerSnapshot
  );

  return {
    plan: billing.plan,
    hasAccess: isUnlimitedPlan(billing.plan) || quotaRemaining > 0,
    quotaRemaining,
    isUnlimited: isUnlimitedPlan(billing.plan),
  };
}
