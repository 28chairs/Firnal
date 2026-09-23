'use client';

import {
  FREE_AI_MAPS_PER_WEEK,
  PLUS_AI_MAPS_PER_MONTH,
  isPaidPlan,
  type PlanType,
} from './plans';

const PLAN_STORAGE_KEY = 'firnal:billing-plan';
const WEEKLY_QUOTA_KEY = 'firnal:ai-quota-weekly';
const MONTHLY_QUOTA_KEY = 'firnal:ai-quota-monthly';

export const BILLING_CHANGED_EVENT = 'firnal:billing-changed';

export interface BillingState {
  plan: PlanType;
  email: string | null;
  stripeCustomerId: string | null;
  updatedAt: string | null;
}

export interface WeeklyQuotaState {
  weekStart: string;
  used: number;
}

export interface MonthlyQuotaState {
  monthStart: string;
  used: number;
}

const DEFAULT_BILLING: BillingState = {
  plan: 'free',
  email: null,
  stripeCustomerId: null,
  updatedAt: null,
};

let billingSnapshot: BillingState = DEFAULT_BILLING;
let weeklyQuotaSnapshot: WeeklyQuotaState = { weekStart: '', used: 0 };
let monthlyQuotaSnapshot: MonthlyQuotaState = { monthStart: '', used: 0 };

function billingSignature(state: BillingState): string {
  return `${state.plan}|${state.email ?? ''}|${state.stripeCustomerId ?? ''}|${state.updatedAt ?? ''}`;
}

function weeklySignature(state: WeeklyQuotaState): string {
  return `${state.weekStart}|${state.used}`;
}

function monthlySignature(state: MonthlyQuotaState): string {
  return `${state.monthStart}|${state.used}`;
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

function getMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
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

function readWeeklyQuotaState(): WeeklyQuotaState {
  if (typeof window === 'undefined') {
    return { weekStart: getWeekStart(), used: 0 };
  }
  try {
    const raw = localStorage.getItem(WEEKLY_QUOTA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WeeklyQuotaState;
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

function writeWeeklyQuotaState(state: WeeklyQuotaState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WEEKLY_QUOTA_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(BILLING_CHANGED_EVENT));
}

function readMonthlyQuotaState(): MonthlyQuotaState {
  if (typeof window === 'undefined') {
    return { monthStart: getMonthStart(), used: 0 };
  }
  try {
    const raw = localStorage.getItem(MONTHLY_QUOTA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MonthlyQuotaState;
      if (parsed && typeof parsed === 'object') {
        const currentMonth = getMonthStart();
        if (parsed.monthStart === currentMonth) {
          return parsed;
        }
      }
    }
  } catch {
    // Fall through to fresh quota
  }
  return { monthStart: getMonthStart(), used: 0 };
}

function writeMonthlyQuotaState(state: MonthlyQuotaState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MONTHLY_QUOTA_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(BILLING_CHANGED_EVENT));
}

/** Cached snapshot for useSyncExternalStore — same reference until data changes. */
export function getBillingState(): BillingState {
  const next = readBillingState();
  if (billingSignature(billingSnapshot) === billingSignature(next)) {
    return billingSnapshot;
  }
  billingSnapshot = next;
  return billingSnapshot;
}

export function getBillingServerSnapshot(): BillingState {
  return DEFAULT_BILLING;
}

export function getCurrentPlan(): PlanType {
  return getBillingState().plan;
}

/** Cached snapshot for useSyncExternalStore — same reference until data changes. */
export function getWeeklyQuotaState(): WeeklyQuotaState {
  const next = readWeeklyQuotaState();
  if (weeklySignature(weeklyQuotaSnapshot) === weeklySignature(next)) {
    return weeklyQuotaSnapshot;
  }
  weeklyQuotaSnapshot = next;
  return weeklyQuotaSnapshot;
}

export function getWeeklyQuotaServerSnapshot(): WeeklyQuotaState {
  return { weekStart: '', used: 0 };
}

/** Cached snapshot for useSyncExternalStore — same reference until data changes. */
export function getMonthlyQuotaState(): MonthlyQuotaState {
  const next = readMonthlyQuotaState();
  if (monthlySignature(monthlyQuotaSnapshot) === monthlySignature(next)) {
    return monthlyQuotaSnapshot;
  }
  monthlyQuotaSnapshot = next;
  return monthlyQuotaSnapshot;
}

export function getFreeQuotaRemaining(): number {
  const quota = readWeeklyQuotaState();
  return Math.max(0, FREE_AI_MAPS_PER_WEEK - quota.used);
}

export function getFreeQuotaUsed(): number {
  return readWeeklyQuotaState().used;
}

export function getPaidQuotaRemaining(): number {
  const quota = readMonthlyQuotaState();
  return Math.max(0, PLUS_AI_MAPS_PER_MONTH - quota.used);
}

export function getPaidQuotaUsed(): number {
  return readMonthlyQuotaState().used;
}

export function isThrottled(): boolean {
  const plan = getCurrentPlan();
  if (!isPaidPlan(plan)) return false;
  return getPaidQuotaRemaining() <= 0;
}

export function hasAIAccess(): boolean {
  const plan = getCurrentPlan();
  if (isPaidPlan(plan)) {
    return true;
  }
  return getFreeQuotaRemaining() > 0;
}

export function consumeAIQuota(): boolean {
  const plan = getCurrentPlan();

  if (isPaidPlan(plan)) {
    const quota = readMonthlyQuotaState();
    const currentMonth = getMonthStart();

    if (quota.monthStart !== currentMonth) {
      writeMonthlyQuotaState({ monthStart: currentMonth, used: 1 });
    } else {
      writeMonthlyQuotaState({ monthStart: currentMonth, used: quota.used + 1 });
    }
    return true;
  }

  const quota = readWeeklyQuotaState();
  const currentWeek = getWeekStart();

  if (quota.weekStart !== currentWeek) {
    writeWeeklyQuotaState({ weekStart: currentWeek, used: 1 });
    return true;
  }

  if (quota.used >= FREE_AI_MAPS_PER_WEEK) {
    return false;
  }

  writeWeeklyQuotaState({ weekStart: currentWeek, used: quota.used + 1 });
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
