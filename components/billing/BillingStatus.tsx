'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Crown, Star, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UpgradeSection } from './PlanCard';
import {
  BILLING_CHANGED_EVENT,
  getBillingState,
  getQuotaState,
  upgradeToPlan,
  type BillingState,
  type QuotaState,
} from '@/lib/billing/entitlements';
import { FREE_AI_QUOTA, PLANS, type PlanType } from '@/lib/billing/plans';

const PLAN_ICONS: Record<PlanType, React.ReactNode> = {
  free: null,
  plus: <Sparkles className="size-5 text-blue-500" />,
  founding: <Crown className="size-5 text-amber-500" />,
  lifetime: <Star className="size-5 text-purple-500" />,
};

function subscribeBilling(onStoreChange: () => void) {
  window.addEventListener(BILLING_CHANGED_EVENT, onStoreChange);
  return () => window.removeEventListener(BILLING_CHANGED_EVENT, onStoreChange);
}

function getClientBillingSnapshot(): BillingState {
  return getBillingState();
}

function getServerBillingSnapshot(): BillingState {
  return { plan: 'free', email: null, stripeCustomerId: null, updatedAt: null };
}

function getClientQuotaSnapshot(): QuotaState {
  return getQuotaState();
}

function getServerQuotaSnapshot(): QuotaState {
  return { weekStart: '', used: 0 };
}

export function BillingStatus() {
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const verifyingRef = useRef(false);

  const billing = useSyncExternalStore(
    subscribeBilling,
    getClientBillingSnapshot,
    getServerBillingSnapshot
  );

  const quota = useSyncExternalStore(
    subscribeBilling,
    getClientQuotaSnapshot,
    getServerQuotaSnapshot
  );

  useEffect(() => {
    const billingStatus = searchParams.get('billing');
    const sessionId = searchParams.get('session_id');

    if (billingStatus === 'success' && sessionId && !verifyingRef.current) {
      verifyingRef.current = true;

      const verifySession = async () => {
        setVerifying(true);
        try {
          const res = await fetch('/api/billing/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          if (data.plan && data.plan !== 'free') {
            upgradeToPlan(data.plan, data.email ?? '', data.customerId ?? '');
            setSuccessMessage(`Welcome to ${PLANS[data.plan as PlanType]?.name ?? 'your new plan'}!`);
          }
        } catch (err) {
          console.error('Failed to verify session:', err);
        } finally {
          setVerifying(false);
          verifyingRef.current = false;
          const url = new URL(window.location.href);
          url.searchParams.delete('billing');
          url.searchParams.delete('session_id');
          window.history.replaceState({}, '', url.toString());
        }
      };

      verifySession();
    }
  }, [searchParams]);

  const quotaUsed = quota.used;
  const quotaRemaining = Math.max(0, FREE_AI_QUOTA - quotaUsed);

  return (
    <div className="flex flex-col gap-4">
      {successMessage && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="flex items-center gap-3 py-3">
            <CheckCircle className="size-5 text-green-500" />
            <p className="font-medium text-green-700 dark:text-green-400">{successMessage}</p>
          </CardContent>
        </Card>
      )}

      {verifying && (
        <Card>
          <CardContent className="py-3">
            <p className="text-sm text-muted-foreground">Verifying your purchase...</p>
          </CardContent>
        </Card>
      )}

      {billing.plan !== 'free' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {PLAN_ICONS[billing.plan]}
              <CardTitle className="text-base">{PLANS[billing.plan].name} Plan</CardTitle>
            </div>
            <CardDescription>
              {billing.email
                ? `Subscribed as ${billing.email}`
                : 'All AI features unlocked'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              {billing.plan === 'lifetime'
                ? 'Lifetime access with fair-use AI.'
                : billing.plan === 'founding'
                  ? 'Founding annual rate locked in forever.'
                  : 'Full access to AI day-maps, habits detection, and calendar AI.'}
            </p>
          </CardContent>
        </Card>
      )}

      {billing.plan === 'free' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscription</CardTitle>
              <CardDescription>Upgrade to unlock unlimited AI features</CardDescription>
            </CardHeader>
          </Card>

          <UpgradeSection
            currentPlan={billing.plan}
            quotaUsed={quotaUsed}
            quotaRemaining={quotaRemaining}
          />
        </>
      )}
    </div>
  );
}
