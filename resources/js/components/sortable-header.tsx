import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface SortableFilters {
    sort?: string | null;
    direction?: 'asc' | 'desc' | null;
}

interface SortableHeaderProps {
    label: string;
    sortKey: string;
    routeName: string;
    routeParams?: Record<string, string | number>;
    filters: SortableFilters;
    className?: string;
}

export default function SortableHeader({ label, sortKey, routeName, routeParams, filters, className }: SortableHeaderProps) {
    const active = filters.sort === sortKey;
    const nextDirection: 'asc' | 'desc' = active && filters.direction === 'asc' ? 'desc' : 'asc';
    const Icon = !active ? ArrowUpDown : filters.direction === 'asc' ? ArrowUp : ArrowDown;

    function handleSort() {
        router.get(
            route(routeName, routeParams),
            { ...filters, sort: sortKey, direction: nextDirection },
            { preserveState: true, replace: true },
        );
    }

    return (
        <TableHead className={className}>
            <button
                type="button"
                onClick={handleSort}
                className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
            >
                {label}
                <Icon className={cn('h-3.5 w-3.5', active ? 'opacity-100' : 'opacity-40')} />
            </button>
        </TableHead>
    );
}
