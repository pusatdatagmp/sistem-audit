import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChefHat, MessageCircle, PackageCheck, ShieldCheck, Ticket, Truck } from 'lucide-react';

const modules = [
    { icon: ChefHat, label: 'Dapur & Inventaris' },
    { icon: Truck, label: 'Kendaraan' },
    { icon: Ticket, label: 'Tiket Komplain' },
    { icon: PackageCheck, label: 'Equipment Request' },
    { icon: MessageCircle, label: 'Notifikasi WhatsApp' },
];

export default function Welcome() {
    const { auth, name } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Selamat Datang">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex h-screen flex-col overflow-hidden">
                <header className="mx-auto w-full max-w-5xl px-6 py-6">
                    <nav className="flex items-center justify-between">
                        <AppLogo />
                        {auth.user ? (
                            <Button asChild>
                                <Link href={route('dashboard')}>Dashboard</Link>
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link href={route('login')}>Masuk</Link>
                            </Button>
                        )}
                    </nav>
                </header>

                <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 text-center">
                    <Badge variant="secondary" className="mb-5 gap-1.5 py-1.5 pr-3 pl-2">
                        <ShieldCheck className="size-3.5" />
                        Sistem Audit GMP
                    </Badge>

                    <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                        Satu sistem untuk audit dapur, kendaraan, dan komplain operasional
                    </h1>

                    <p className="mt-4 max-w-lg text-base text-muted-foreground">
                        {name} membantu tim operasional mengelola inventaris, kendaraan, tiket komplain, dan permintaan equipment dalam satu
                        dashboard.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        {auth.user ? (
                            <Button asChild size="lg">
                                <Link href={route('dashboard')}>Buka Dashboard</Link>
                            </Button>
                        ) : (
                            <Button asChild size="lg">
                                <Link href={route('login')}>Masuk ke Sistem</Link>
                            </Button>
                        )}
                    </div>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        {modules.map(({ icon: Icon, label }) => (
                            <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Icon className="size-3.5" />
                                {label}
                            </span>
                        ))}
                    </div>
                </main>

                <footer className="mx-auto w-full max-w-5xl px-6 py-6 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} {name}
                </footer>
            </div>
        </>
    );
}
