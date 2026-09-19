'use client';

import { useState } from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Check, Sparkles, Crown, Star, X } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { YEARLY_PRICE, type PlanType } from '@/lib/billing/plans';

type UpgradePlan = 'plus-monthly' | 'plus-yearly' | 'founding' | 'lifetime';

interface PlanOption {
  id: UpgradePlan;
  name: string;
  price: string;
  period: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'plus-monthly',
    name: 'Plus',
    price: '$9.99',
    period: '/mo',
    icon: <Sparkles className="size-5 text-primary" />,
  },
  {
    id: 'plus-yearly',
    name: 'Plus',
    price: `$${YEARLY_PRICE}`,
    period: '/yr',
    badge: 'Best value',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: <Sparkles className="size-5 text-primary" />,
  },
  {
    id: 'founding',
    name: 'Founding',
    price: '$49',
    period: '/yr',
    badge: '30 days only',
    badgeColor: 'bg-primary/10 text-primary dark:bg-primary/20',
    icon: <Crown className="size-5 text-primary" />,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$179',
    period: ' once',
    badge: '100 seats',
    badgeColor: 'bg-primary/10 text-primary dark:bg-primary/20',
    icon: <Star className="size-5 text-primary" />,
  },
];

interface UpgradeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: PlanType;
}

export function UpgradeSheet({ open, onOpenChange, currentPlan = 'free' }: UpgradeSheetProps) {
  const [selected, setSelected] = useState<UpgradePlan>('plus-yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
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
      setLoading(false);
    }
  };

  const selectedOption = PLAN_OPTIONS.find((o) => o.id === selected);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-black/40 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />
        <DialogPrimitive.Popup
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl bg-[#FFFBF5] p-5 pb-8 shadow-xl duration-300 outline-none data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom dark:bg-[#1C1917]"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <DialogPrimitive.Title className="text-xl font-semibold tracking-tight">
                Unlock your day map
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                Keep riffing for free. Plus turns voice into today&apos;s flowchart.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              render={
                <button className="rounded-full p-1.5 hover:bg-black/5 dark:hover:bg-white/10" />
              }
            >
              <X className="size-5 text-muted-foreground" />
            </DialogPrimitive.Close>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {PLAN_OPTIONS.map((option) => {
              const isSelected = selected === option.id;
              const isPlusPlan = option.id === 'plus-monthly' || option.id === 'plus-yearly';
              const isCurrentPlan =
                (currentPlan === 'plus' && isPlusPlan) ||
                (currentPlan === 'founding' && option.id === 'founding') ||
                (currentPlan === 'lifetime' && option.id === 'lifetime');

              return (
                <button
                  key={option.id}
                  onClick={() => !isCurrentPlan && setSelected(option.id)}
                  disabled={isCurrentPlan}
                  className={cn(
                    'relative flex flex-col items-start rounded-2xl border-2 p-3 text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-black/[0.08] bg-white hover:border-black/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20',
                    isCurrentPlan && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {option.badge && (
                    <span
                      className={cn(
                        'absolute -top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        option.badgeColor
                      )}
                    >
                      {option.badge}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span className="font-medium">{option.name}</span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-0.5">
                    <span className="text-xl font-bold">{option.price}</span>
                    <span className="text-sm text-muted-foreground">{option.period}</span>
                  </div>

                  {isSelected && (
                    <div className="absolute right-2 bottom-2">
                      <div className="flex size-5 items-center justify-center rounded-full bg-primary">
                        <Check className="size-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <Button
            className="mt-5 w-full gap-2"
            size="lg"
            onClick={handleUpgrade}
            disabled={loading || currentPlan !== 'free'}
          >
            {loading ? (
              'Loading...'
            ) : (
              <>
                {selectedOption?.icon}
                Continue with {selectedOption?.name}
              </>
            )}
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Mic stays free. Cancel anytime on Plus.
          </p>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface UpgradeSheetTriggerProps {
  children: React.ReactNode;
  currentPlan?: PlanType;
}

export function UpgradeSheetTrigger({ children, currentPlan }: UpgradeSheetTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </span>
      <UpgradeSheet open={open} onOpenChange={setOpen} currentPlan={currentPlan} />
    </>
  );
}
