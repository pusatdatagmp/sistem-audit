import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

export interface BarListItem {
    key: string;
    label: string;
    value: number;
    icon?: LucideIcon;
    barClassName?: string;
    textClassName?: string;
}

interface BarListProps {
    items: BarListItem[];
    emptyLabel?: string;
}

export function BarList({ items, emptyLabel = 'Belum ada data.' }: BarListProps) {
    const max = Math.max(1, ...items.map((item) => item.value));
    const total = items.reduce((sum, item) => sum + item.value, 0);

    if (items.length === 0 || total === 0) {
        return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
    }

    return (
        <div className="flex flex-col gap-3">
            {items.map((item) => {
                const widthPct = Math.round((item.value / max) * 100);
                const sharePct = total > 0 ? Math.round((item.value / total) * 100) : 0;

                return (
                    <div key={item.key} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2 text-sm">
                            <span className={cn('flex items-center gap-1.5 font-medium', item.textClassName)}>
                                {item.icon && <item.icon className="size-3.5 shrink-0" />}
                                {item.label}
                            </span>
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                                {item.value} <span className="text-xs">({sharePct}%)</span>
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn('h-full rounded-full transition-[width]', item.barClassName ?? 'bg-primary')}
                                style={{ width: `${widthPct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
