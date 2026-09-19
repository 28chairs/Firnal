import { cn } from '@/lib/utils';

type CategoryCardProps = {
  children: React.ReactNode;
  color: string;
  className?: string;
};

export function CategoryCard({ children, color, className }: CategoryCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-card px-3.5 py-3 text-sm leading-relaxed shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-border',
        className
      )}
      style={{ borderLeftWidth: '3px', borderLeftColor: color }}
    >
      {children}
    </div>
  );
}

type PersonCardProps = {
  name: string;
  initial: string;
  color: string;
};

export function PersonCard({ name, initial, color }: PersonCardProps) {
  return (
    <CategoryCard color={color} className="flex items-center gap-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold text-white shadow-sm transition-transform duration-200 hover:scale-105"
        style={{ backgroundColor: color }}
      >
        {initial.slice(0, 1).toUpperCase()}
      </span>
      <span className="font-medium">{name}</span>
    </CategoryCard>
  );
}
