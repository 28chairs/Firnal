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
        'rounded-xl border border-black/[0.04] bg-card px-3 py-2.5 text-sm leading-snug shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
        className,
      )}
      style={{ borderLeft: `3px solid ${color}` }}
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
    <CategoryCard color={color} className="flex items-center gap-2.5">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        {initial.slice(0, 1).toUpperCase()}
      </span>
      <span>{name}</span>
    </CategoryCard>
  );
}
