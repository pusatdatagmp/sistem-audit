import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import QuickAddCategoryDialog from '@/pages/inventory/kitchen-tools/components/quick-add-category-dialog';
import { type BreadcrumbItem, type MasterDataOption } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventaris Dapur', href: '/inventory' },
    { title: 'Alat Dapur', href: '/inventory/kitchen-tools' },
    { title: 'Tambah', href: '/inventory/kitchen-tools/create' },
];

interface CreateKitchenToolProps {
    categoryOptions: MasterDataOption[];
}

export default function CreateKitchenTool({ categoryOptions }: CreateKitchenToolProps) {
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        unit: 'pcs',
        category_option_id: '',
        description: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('inventory.kitchen-tools.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Alat Dapur" />

            <div className="max-w-xl p-4">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Kode</Label>
                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                        <InputError message={errors.code} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Alat</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="unit">Satuan</Label>
                        <Input id="unit" value={data.unit} onChange={(e) => setData('unit', e.target.value)} />
                        <InputError message={errors.unit} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="category_option_id">Kategori</Label>
                            <button
                                type="button"
                                onClick={() => setCategoryDialogOpen(true)}
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                + Tambah Kategori
                            </button>
                        </div>
                        <Select value={data.category_option_id} onValueChange={(value) => setData('category_option_id', value)}>
                            <SelectTrigger id="category_option_id">
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categoryOptions.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.category_option_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Deskripsi (opsional)</Label>
                        <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        <InputError message={errors.description} />
                    </div>

                    <Button type="submit" disabled={processing}>
                        Simpan
                    </Button>
                </form>
            </div>

            <QuickAddCategoryDialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} />
        </AppLayout>
    );
}
