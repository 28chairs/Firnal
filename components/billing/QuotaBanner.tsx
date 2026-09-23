'use client';

import { useState, useSyncExternalStore } from 'react';
import { Sparkles } from 'lucide-react';
import {
  BILLING_CHANGED_EVENT,
  getBillingState,
  getBillingServerSnapshot,
  getFreeQuotaRemaining,
  type BillingState,
} from '@/lib/billing/entitlements';
import { isPaidPlan, FREE_AI_MAPS_PER_WEEK } from '@/lib/billing/plans';
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

export function QuotaBanner() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { billing, quotaRemaining } = useSyncExternalStore(
    subscribeBilling,
    getClientSnapshot,
    getServerSnapshot
  );

  if (isPaidPlan(billing.plan)) {
    return null;
  }

  const quotaText =
    quotaRemaining === 0
      ? 'AI maps used this week'
      : quotaRemaining === 1
        ? '1 AI map left this week'
        : `${quotaRemaining} AI maps left this week`;

  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        className="flex w-full items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">{quotaText}</span>
        </div>
        <span className="text-xs font-medium text-primary">Upgrade</span>
      </button>

      <UpgradeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        currentPlan={billing.plan}
      />
    </>
  );
}
