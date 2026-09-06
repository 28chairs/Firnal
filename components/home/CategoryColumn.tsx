import { CATEGORIES, type CategoryKey } from '@/lib/categories';
import { CategoryCard, PersonCard } from '@/components/home/CategoryCard';
import type { DailyFlowchart } from '@/lib/schemas';
import { cn } from '@/lib/utils';

type CategoryColumnProps = {
  category: CategoryKey;
  breakdown: DailyFlowchart;
  columnRef?: (el: HTMLElement | null) => void;
};

export function CategoryColumn({ category, breakdown, columnRef }: CategoryColumnProps) {
  const meta = CATEGORIES[category];
  const items = getCategoryItems(category, breakdown);

  return (
    <div ref={columnRef} data-category-column={category} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: meta.color }}
          aria-hidden
        />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {meta.label}
        </h3>
        {items.length > 0 && (
          <span className="text-xs text-muted-foreground">({items.length})</span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/[0.06] px-3 py-2 text-xs text-muted-foreground">
          Nothing here
        </p>
      ) : category === 'people' ? (
        breakdown.people.map((person) => (
          <PersonCard
            key={person.name}
            name={person.name}
            initial={person.initial}
            color={meta.color}
          />
        ))
      ) : (
        (breakdown[category] as string[]).map((item) => (
          <CategoryCard key={item} color={meta.color}>
            {item}
          </CategoryCard>
        ))
      )}
    </div>
  );
}

function getCategoryItems(category: CategoryKey, breakdown: DailyFlowchart) {
  if (category === 'people') {
    return breakdown.people;
  }
  return breakdown[category];
}

type CategoryGridProps = {
  breakdown: DailyFlowchart;
  columnRefs?: Partial<Record<CategoryKey, (el: HTMLElement | null) => void>>;
  className?: string;
};

export function CategoryGrid({ breakdown, columnRefs, className }: CategoryGridProps) {
  const categories: CategoryKey[] = [
    'commitments',
    'decisions',
    'ideas',
    'people',
    'questions',
  ];

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-4 lg:grid-cols-5',
        className,
      )}
    >
      {categories.map((category) => (
        <CategoryColumn
          key={category}
          category={category}
          breakdown={breakdown}
          columnRef={columnRefs?.[category]}
        />
      ))}
    </div>
  );
}
