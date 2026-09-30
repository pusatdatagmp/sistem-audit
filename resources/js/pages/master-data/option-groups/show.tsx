import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import OptionFormDialog from '@/pages/master-data/option-groups/components/option-form-dialog';
import { type BreadcrumbItem, type MasterDataGroup, type MasterDataOption } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface OptionGroupShowProps {
    group: MasterDataGroup;
    options: MasterDataOption[];
}

const PARENT_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
    kitchen_tool_category: [
        { title: 'Inventaris Dapur', href: '/inventory' },
        { title: 'Alat Dapur', href: '/inventory/kitchen-tools' },
    ],
    vehicle_type: [{ title: 'Kendaraan', href: '/vehicles' }],
    vehicle_status: [{ title: 'Kendaraan', href: '/vehicles' }],
    maintenance_type: [
        { title: 'Kendaraan', href: '/vehicles' },
        { title: 'Jadwal Perawatan', href: '/vehicles/maintenance' },
    ],
    vehicle_component: [
        { title: 'Kendaraan', href: '/vehicles' },
        { title: 'Inspeksi Komponen', href: '/vehicles/inspections' },
    ],
    complaint_category: [{ title: 'Tiket Pengaduan', href: '/tickets' }],
    ticket_priority: [{ title: 'Tiket Pengaduan', href: '/tickets' }],
};

export default function OptionGroupShow({ group, options }: OptionGroupShowProps) {
    useFlashToast();

    const breadcrumbs: BreadcrumbItem[] = [
        ...(PARENT_BREADCRUMBS[group.code] ?? [
            { title: 'Master Data', href: '/master-data/kitchens' },
            { title: 'Kategori & Opsi', href: '/master-data/option-groups' },
        ]),
        { title: group.name, href: '#' },
    ];

    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeOption, setActiveOption] = useState<MasterDataOption | null>(null);

    function openCreate() {
        setActiveOption(null);
        setDialogOpen(true);
    }

    function openEdit(option: MasterDataOption) {
        setActiveOption(option);
        setDialogOpen(true);
    }

    async function handleDelete(option: MasterDataOption) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: `Hapus opsi ${option.label}?`,
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.delete(route('master-data.options.destroy', option.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kelola Opsi - ${group.name}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">{group.name}</h1>
                        {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
                        <p className="mt-1 font-mono text-xs text-muted-foreground">{group.code}</p>
                    </div>
                    <Button onClick={openCreate}>Tambah Opsi</Button>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Urutan</TableHead>
                                <TableHead>Label</TableHead>
                                <TableHead>Kode</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {options.map((option) => (
                                <TableRow key={option.id}>
                                    <TableCell>{option.sort_order}</TableCell>
                                    <TableCell>{option.label}</TableCell>
                                    <TableCell className="font-mono text-xs">{option.code}</TableCell>
                                    <TableCell>{option.description ?? '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={option.is_active ? 'default' : 'outline'}>
                                            {option.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(option)}>
                                                Ubah
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(option)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <OptionFormDialog group={group} option={activeOption} open={dialogOpen} onOpenChange={setDialogOpen} />
        </AppLayout>
    );
}
