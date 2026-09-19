'use client';

import { FREE_AI_QUOTA, isUnlimitedPlan, type PlanType } from './plans';

const PLAN_STORAGE_KEY = 'firnal:billing-plan';
const QUOTA_STORAGE_KEY = 'firnal:ai-quota';

export const BILLING_CHANGED_EVENT = 'firnal:billing-changed';

export interface BillingState {
  plan: PlanType;
  email: string | null;
  stripeCustomerId: string | null;
  updatedAt: string | null;
}

export interface QuotaState {
  weekStart: string;
  used: number;
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function readBillingState(): BillingState {
  if (typeof window === 'undefined') {
    return { plan: 'free', email: null, stripeCustomerId: null, updatedAt: null };
  }
  try {
    const raw = localStorage.getItem(PLAN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BillingState;
      if (parsed && typeof parsed === 'object' && parsed.plan) {
        return parsed;
      }
    }
  } catch {
    // Fall through to default
  }
  return { plan: 'free', email: null, stripeCustomerId: null, updatedAt: null };
}

function writeBillingState(state: BillingState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(BILLING_CHANGED_EVENT));
}

function readQuotaState(): QuotaState {
  if (typeof window === 'undefined') {
    return { weekStart: getWeekStart(), used: 0 };
  }
  try {
    const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as QuotaState;
      if (parsed && typeof parsed === 'object') {
        const currentWeek = getWeekStart();
        if (parsed.weekStart === currentWeek) {
          return parsed;
        }
      }
    }
  } catch {
    // Fall through to fresh quota
  }
  return { weekStart: getWeekStart(), used: 0 };
}

function writeQuotaState(state: QuotaState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(BILLING_CHANGED_EVENT));
}

export function getBillingState(): BillingState {
  return readBillingState();
}

export function getCurrentPlan(): PlanType {
  return readBillingState().plan;
}

export function getQuotaState(): QuotaState {
  return readQuotaState();
}

export function getAIQuotaRemaining(): number {
  const plan = getCurrentPlan();
  if (isUnlimitedPlan(plan)) {
    return Infinity;
  }
  const quota = readQuotaState();
  return Math.max(0, FREE_AI_QUOTA - quota.used);
}

export function hasAIAccess(): boolean {
  const plan = getCurrentPlan();
  if (isUnlimitedPlan(plan)) {
    return true;
  }
  return getAIQuotaRemaining() > 0;
}

export function consumeAIQuota(): boolean {
  const plan = getCurrentPlan();
  if (isUnlimitedPlan(plan)) {
    return true;
  }
  
  const quota = readQuotaState();
  const currentWeek = getWeekStart();
  
  if (quota.weekStart !== currentWeek) {
    writeQuotaState({ weekStart: currentWeek, used: 1 });
    return true;
  }
  
  if (quota.used >= FREE_AI_QUOTA) {
    return false;
  }
  
  writeQuotaState({ weekStart: currentWeek, used: quota.used + 1 });
  return true;
}

export function updateBillingState(
  update: Partial<Omit<BillingState, 'updatedAt'>>
): void {
  const current = readBillingState();
  writeBillingState({
    ...current,
    ...update,
    updatedAt: new Date().toISOString(),
  });
}

export function upgradeToPlan(
  plan: PlanType,
  email: string,
  stripeCustomerId: string
): void {
  writeBillingState({
    plan,
    email,
    stripeCustomerId,
    updatedAt: new Date().toISOString(),
  });
}

export function resetToFreePlan(): void {
  const current = readBillingState();
  writeBillingState({
    plan: 'free',
    email: current.email,
    stripeCustomerId: current.stripeCustomerId,
    updatedAt: new Date().toISOString(),
  });
}
