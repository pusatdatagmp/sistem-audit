import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, ClipboardCheck, PackagePlus, Truck } from 'lucide-react';

const NAV_ITEMS = [
    {
        href: '/driver',
        label: 'Pemakaian Kendaraan',
        icon: Truck,
        isActive: (url: string) =>
            url === '/driver' || (url.startsWith('/driver/') && !url.startsWith('/driver/inspeksi') && !url.startsWith('/driver/pengajuan')),
    },
    {
        href: '/driver/inspeksi',
        label: 'Inspeksi Kendaraan',
        icon: ClipboardCheck,
        isActive: (url: string) => url.startsWith('/driver/inspeksi'),
    },
    {
        href: '/driver/pengajuan',
        label: 'Pengajuan Alat',
        icon: PackagePlus,
        isActive: (url: string) => url.startsWith('/driver/pengajuan'),
    },
    {
        href: '/lapor',
        label: 'Lapor Keluhan',
        icon: AlertTriangle,
        isActive: (url: string) => url.startsWith('/lapor'),
    },
];

/**
 * Persistent tab navigation shared by the driver portal and the complaint
 * portal, so a driver moving between "/driver" and "/lapor" pages — which
 * render through two different layouts — never loses their way back.
 * Reporters (who only ever see "/lapor") don't have driver-portal.access,
 * so this renders nothing for them.
 */
export function SelfServiceNav() {
    const { auth } = usePage<SharedData>().props;
    const currentUrl = usePage().url;

    if (!auth.permissions.includes('driver-portal.access')) {
        return null;
    }

    return (
        <nav className="mx-auto flex max-w-2xl gap-1 overflow-x-auto px-4 pb-2">
            {NAV_ITEMS.map((item) => {
                const isActive = item.isActive(currentUrl);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                            isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                    >
                        <item.icon className="size-4" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
