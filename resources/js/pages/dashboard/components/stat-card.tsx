import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

type StatTone = 'default' | 'success' | 'warning' | 'critical' | 'info';

const TONE_STYLES: Record<StatTone, string> = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    critical: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
};

interface StatCardProps {
    label: string;
    value: string | number;
    hint?: string;
    icon: LucideIcon;
    tone?: StatTone;
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'default' }: StatCardProps) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
                    {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
                </div>
                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', TONE_STYLES[tone])}>
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}
