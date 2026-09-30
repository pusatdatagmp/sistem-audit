import { useMemo, useState } from 'react';

export interface TrendPoint {
    date: string;
    total: number;
}

interface TicketTrendChartProps {
    data: TrendPoint[];
    days: number;
}

const WIDTH = 600;
const HEIGHT = 160;
const PAD_X = 4;
const PAD_TOP = 12;
const PAD_BOTTOM = 20;

function formatShortDate(isoDate: string): string {
    return new Date(`${isoDate}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

export function TicketTrendChart({ data, days }: TicketTrendChartProps) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const { path, areaPath, points, max } = useMemo(() => {
        const max = Math.max(1, ...data.map((d) => d.total));
        const stepX = data.length > 1 ? (WIDTH - PAD_X * 2) / (data.length - 1) : 0;
        const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

        const points = data.map((d, i) => ({
            ...d,
            x: PAD_X + i * stepX,
            y: PAD_TOP + innerHeight - (d.total / max) * innerHeight,
        }));

        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
        const baseline = HEIGHT - PAD_BOTTOM;
        const areaPath =
            points.length > 0 ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${baseline} L ${points[0].x.toFixed(2)} ${baseline} Z` : '';

        return { path: linePath, areaPath, points, max };
    }, [data]);

    const hovered = hoverIndex !== null ? points[hoverIndex] : null;
    const total = data.reduce((sum, d) => sum + d.total, 0);

    function handleMove(event: React.MouseEvent<SVGSVGElement>) {
        if (points.length === 0) {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const relX = ((event.clientX - rect.left) / rect.width) * WIDTH;

        let closest = 0;
        let closestDist = Infinity;
        points.forEach((p, i) => {
            const dist = Math.abs(p.x - relX);
            if (dist < closestDist) {
                closestDist = dist;
                closest = i;
            }
        });

        setHoverIndex(closest);
    }

    return (
        <div>
            <div className="mb-3 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums">{total}</span>
                <span className="text-muted-foreground text-sm">tiket masuk dalam {days} hari terakhir</span>
            </div>

            <div className="relative">
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    className="w-full overflow-visible"
                    preserveAspectRatio="none"
                    onMouseMove={handleMove}
                    onMouseLeave={() => setHoverIndex(null)}
                >
                    <defs>
                        <linearGradient id="ticketTrendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <line
                        x1={PAD_X}
                        x2={WIDTH - PAD_X}
                        y1={HEIGHT - PAD_BOTTOM}
                        y2={HEIGHT - PAD_BOTTOM}
                        stroke="var(--color-border)"
                        strokeWidth={1}
                    />

                    {areaPath && <path d={areaPath} fill="url(#ticketTrendFill)" stroke="none" />}
                    {path && <path d={path} fill="none" stroke="var(--color-chart-1)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}

                    {hovered && (
                        <>
                            <line
                                x1={hovered.x}
                                x2={hovered.x}
                                y1={PAD_TOP}
                                y2={HEIGHT - PAD_BOTTOM}
                                stroke="var(--color-border)"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                            />
                            <circle
                                cx={hovered.x}
                                cy={hovered.y}
                                r={4}
                                fill="var(--color-chart-1)"
                                stroke="var(--color-background)"
                                strokeWidth={2}
                            />
                        </>
                    )}
                </svg>

                {hovered && (
                    <div
                        className="bg-popover pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-full rounded-md border px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md"
                        style={{ left: `${(hovered.x / WIDTH) * 100}%` }}
                    >
                        <div className="text-popover-foreground font-medium">{formatShortDate(hovered.date)}</div>
                        <div className="text-muted-foreground">{hovered.total} tiket</div>
                    </div>
                )}
            </div>

            <div className="text-muted-foreground mt-1 flex justify-between text-[11px]">
                <span>{data[0] ? formatShortDate(data[0].date) : ''}</span>
                <span>{data.length > 0 ? formatShortDate(data[data.length - 1].date) : ''}</span>
            </div>

            <span className="sr-only">Puncak {max} tiket dalam satu hari selama periode ini.</span>
        </div>
    );
}
