'use client';

import { useState, useSyncExternalStore } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BILLING_CHANGED_EVENT,
  getBillingState,
  getBillingServerSnapshot,
  getFreeQuotaRemaining,
  type BillingState,
} from '@/lib/billing/entitlements';
import { FREE_AI_MAPS_PER_WEEK, isPaidPlan } from '@/lib/billing/plans';
import { UpgradeSheet } from './UpgradeSheet';

interface QuotaSnapshot {
  billing: BillingState;
  quotaRemaining: number;
}

let clientSnapshot: QuotaSnapshot | null = null;

const serverSnapshot: QuotaSnapshot = {
  billing: getBillingServerSnapshot(),
  quotaRemaining: FREE_AI_MAPS_PER_WEEK,
};

function snapshotSignature(s: QuotaSnapshot): string {
  return `${s.billing.plan}|${s.billing.updatedAt ?? ''}|${s.quotaRemaining}`;
}

function subscribeBilling(onStoreChange: () => void) {
  window.addEventListener(BILLING_CHANGED_EVENT, onStoreChange);
  return () => window.removeEventListener(BILLING_CHANGED_EVENT, onStoreChange);
}

function getClientSnapshot(): QuotaSnapshot {
  const next: QuotaSnapshot = {
    billing: getBillingState(),
    quotaRemaining: getFreeQuotaRemaining(),
  };
  if (clientSnapshot && snapshotSignature(clientSnapshot) === snapshotSignature(next)) {
    return clientSnapshot;
  }
  clientSnapshot = next;
  return clientSnapshot;
}

function getServerSnapshot(): QuotaSnapshot {
  return serverSnapshot;
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

  const hasAccess = isPaidPlan(billing.plan) || quotaRemaining > 0;

  if (hasAccess) {
    return <>{children}</>;
  }

  return <AIPaywall feature={feature} currentPlan={billing.plan} />;
}

interface AIPaywallProps {
  feature?: string;
  currentPlan?: 'free' | 'plus' | 'founding' | 'lifetime';
}

export function AIPaywall({ currentPlan = 'free' }: AIPaywallProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="calm-empty-card">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Mic className="size-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Hold the mic to start your day
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your voice note turns into today&apos;s map — Commitments, Decisions,
            Ideas, People, Questions.
          </p>
          <button
            onClick={() => setSheetOpen(true)}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Get Plus for AI maps
          </button>
        </div>
      </div>

      <UpgradeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        currentPlan={currentPlan}
      />
    </>
  );
}

export function UpgradeButton() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { billing } = useSyncExternalStore(
    subscribeBilling,
    getClientSnapshot,
    getServerSnapshot
  );

  if (isPaidPlan(billing.plan)) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setSheetOpen(true)} size="sm" className="gap-1.5">
        <Sparkles className="size-3.5" />
        Upgrade
      </Button>
      <UpgradeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        currentPlan={billing.plan}
      />
    </>
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
    hasAccess: isPaidPlan(billing.plan) || quotaRemaining > 0,
    quotaRemaining,
    isUnlimited: isPaidPlan(billing.plan),
  };
}
