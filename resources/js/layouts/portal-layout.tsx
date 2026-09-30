import AppLogoIcon from '@/components/app-logo-icon';
import { SelfServiceNav } from '@/components/self-service-nav';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface PortalLayoutProps {
    children: ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="bg-muted/30 flex min-h-svh flex-col">
            <header className="bg-background border-b">
                <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
                    <Link href={route('portal.index')} className="flex items-center gap-2">
                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                            <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                        </div>
                        <span className="font-semibold">Portal Pengaduan</span>
                    </Link>

                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{auth.user.name}</span>
                        <Link href={route('logout')} method="post" as="button" className="text-muted-foreground hover:text-foreground">
                            Keluar
                        </Link>
                    </div>
                </div>

                <SelfServiceNav />
            </header>

            <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
        </div>
    );
}
