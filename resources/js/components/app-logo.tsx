import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { name, systemSettings } = usePage<SharedData>().props;

    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center overflow-hidden rounded-md">
                {systemSettings.logo_url ? (
                    <img src={systemSettings.logo_url} alt={name} className="size-full object-contain" />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-base">
                <span className="mb-0.5 truncate leading-none font-semibold">{name}</span>
            </div>
        </>
    );
}
