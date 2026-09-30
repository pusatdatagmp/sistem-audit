import PaginationFooter from '@/components/pagination-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type KitchenTool, type Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventaris Dapur', href: '/inventory' },
    { title: 'Alat Dapur', href: '/inventory/kitchen-tools' },
];

interface KitchenToolsIndexProps {
    kitchenTools: Paginated<KitchenTool>;
}

export default function KitchenToolsIndex({ kitchenTools }: KitchenToolsIndexProps) {
    useFlashToast();

    async function handleDelete(tool: KitchenTool) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: `Hapus ${tool.name}?`,
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.delete(route('inventory.kitchen-tools.destroy', tool.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Alat Dapur" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex justify-between">
                    <h1 className="text-xl font-semibold">Alat Dapur</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('master-data.option-groups.show', 'kitchen_tool_category')}>Kelola Kategori</Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('inventory.kitchen-tools.create')}>Tambah Alat</Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Satuan</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kitchenTools.data.map((tool) => (
                                <TableRow key={tool.id}>
                                    <TableCell>{tool.code}</TableCell>
                                    <TableCell>{tool.name}</TableCell>
                                    <TableCell>{tool.unit}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{tool.category?.label ?? '-'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={tool.is_active ? 'default' : 'outline'}>{tool.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('inventory.kitchen-tools.edit', tool.id)}>Ubah</Link>
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(tool)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={kitchenTools} />
            </div>
        </AppLayout>
    );
}
