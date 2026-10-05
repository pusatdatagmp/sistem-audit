import AppLogoIcon from '@/components/app-logo-icon';
import { SelfServiceNav } from '@/components/self-service-nav';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { type ReactNode } from 'react';
import Swal from 'sweetalert2';

interface DriverLayoutProps {
    children: ReactNode;
}

export default function DriverLayout({ children }: DriverLayoutProps) {
    const { auth, name, systemSettings } = usePage<SharedData>().props;

    async function handleLogout() {
        const confirmation = await Swal.fire({
            icon: 'question',
            title: 'Keluar dari akun?',
            showCancelButton: true,
            confirmButtonText: 'Ya, keluar',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.post(route('logout'));
        }
    }

    return (
        <div className="bg-muted/30 flex min-h-svh flex-col">
            <header className="bg-background border-b">
                <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-3">
                    <Link href={route('driver.index')} className="flex min-w-0 items-center gap-2">
                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
                            {systemSettings.logo_url ? (
                                <img src={systemSettings.logo_url} alt={name} className="size-full object-contain" />
                            ) : (
                                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                            )}
                        </div>
                        <span className="truncate font-semibold">Portal Driver</span>
                    </Link>

                    <div className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
                        <span className="hidden truncate text-muted-foreground sm:block">{auth.user.name}</span>
                        <Button variant="outline" size="sm" className="shrink-0 px-2 sm:px-3" aria-label="Keluar" onClick={handleLogout}>
                            <LogOut className="size-4" />
                            <span className="hidden sm:inline">Keluar</span>
                        </Button>
                    </div>
                </div>

                <SelfServiceNav />
            </header>

            <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
        </div>
    );
}
