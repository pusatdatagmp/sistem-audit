import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ChefHat,
    ClipboardCheck,
    Flag,
    History,
    LayoutGrid,
    PackagePlus,
    Paintbrush,
    ShieldCheck,
    Tags,
    ToggleRight,
    Truck,
    Users,
    Warehouse,
    Wrench,
} from 'lucide-react';
import AppLogo from './app-logo';

interface PermissionedNavItem extends NavItem {
    permission: string;
}

const dashboardNavItems: PermissionedNavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
        permission: 'dashboard.view',
    },
];

const inventoryNavItems: PermissionedNavItem[] = [
    {
        title: 'Inventaris Dapur',
        url: '/inventory',
        icon: ChefHat,
        permission: 'inventory.manage',
    },
    {
        title: 'Dapur',
        url: '/master-data/kitchens',
        icon: Warehouse,
        permission: 'master-data.manage',
    },
    {
        title: 'Pengajuan Alat',
        url: '/equipment-requests',
        icon: PackagePlus,
        permission: 'equipment-requests.manage',
    },
];

const monitoringNavItems: PermissionedNavItem[] = [
    {
        title: 'Kendaraan',
        url: '/vehicles',
        icon: Truck,
        permission: 'vehicles.manage',
    },
    {
        title: 'Kelola Jenis',
        url: '/master-data/option-groups/vehicle_type',
        icon: Tags,
        permission: 'master-data.manage',
    },
    {
        title: 'Kelola Status',
        url: '/master-data/option-groups/vehicle_status',
        icon: ToggleRight,
        permission: 'master-data.manage',
    },
    {
        title: 'Jadwal Perawatan',
        url: '/vehicles/maintenance',
        icon: Wrench,
        permission: 'vehicles.manage',
    },
    {
        title: 'Riwayat Pemakaian',
        url: '/vehicles/usage-logs',
        icon: History,
        permission: 'vehicles.manage',
    },
    {
        title: 'Inspeksi Komponen',
        url: '/vehicles/inspections',
        icon: ClipboardCheck,
        permission: 'vehicles.manage',
    },
];

const ticketingNavItems: PermissionedNavItem[] = [
    {
        title: 'Tiket Pengaduan',
        url: '/tickets',
        icon: AlertTriangle,
        permission: 'tickets.manage',
    },
    {
        title: 'Kelola Kategori',
        url: '/master-data/option-groups/complaint_category',
        icon: Tags,
        permission: 'master-data.manage',
    },
    {
        title: 'Kelola Prioritas',
        url: '/master-data/option-groups/ticket_priority',
        icon: Flag,
        permission: 'master-data.manage',
    },
];

const administrationNavItems: PermissionedNavItem[] = [
    {
        title: 'Kelola Pengguna',
        url: '/users',
        icon: Users,
        permission: 'roles.manage',
    },
    {
        title: 'Kelola Role',
        url: '/roles',
        icon: ShieldCheck,
        permission: 'roles.manage',
    },
    {
        title: 'Pengaturan Sistem',
        url: '/system-settings',
        icon: Paintbrush,
        permission: 'settings.manage',
    },
];

function filterByPermission(items: PermissionedNavItem[], permissions: string[]): NavItem[] {
    return items.filter((item) => permissions.includes(item.permission));
}

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const permissions = auth.permissions;

    const groups = [
        { label: 'Menu', items: filterByPermission(dashboardNavItems, permissions) },
        { label: 'Inventaris', items: filterByPermission(inventoryNavItems, permissions) },
        { label: 'Monitoring', items: filterByPermission(monitoringNavItems, permissions) },
        { label: 'Pengaduan', items: filterByPermission(ticketingNavItems, permissions) },
        { label: 'Administrasi', items: filterByPermission(administrationNavItems, permissions) },
    ].filter((group) => group.items.length > 0);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {groups.map((group, index) => (
                    <div key={group.label}>
                        {index > 0 && <SidebarSeparator />}
                        <NavMain items={group.items} label={group.label} />
                    </div>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
