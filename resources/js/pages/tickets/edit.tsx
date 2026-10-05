import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ComplaintTicket, type Kitchen, type KitchenTool, type MasterDataOption, type Vehicle } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface EditTicketProps {
    ticket: ComplaintTicket;
    kitchens: Kitchen[];
    categoryOptions: MasterDataOption[];
    priorityOptions: MasterDataOption[];
    kitchenTools: KitchenTool[];
    vehicles: Vehicle[];
}

export default function EditTicket({ ticket, kitchens, categoryOptions, priorityOptions, kitchenTools, vehicles }: EditTicketProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tiket Pengaduan', href: '/tickets' },
        { title: ticket.ticket_number, href: route('tickets.show', ticket.id) },
        { title: 'Ubah', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        kitchen_id: ticket.kitchen_id ? String(ticket.kitchen_id) : '',
        category_option_id: String(ticket.category_option_id ?? ticket.category.id),
        priority_option_id: String(ticket.priority_option_id ?? ticket.priority.id),
        related_kitchen_tool_id: ticket.related_kitchen_tool_id ? String(ticket.related_kitchen_tool_id) : '',
        related_vehicle_id: ticket.related_vehicle_id ? String(ticket.related_vehicle_id) : '',
        subject: ticket.subject,
        description: ticket.description,
    });

    const selectedCategory = categoryOptions.find((option) => String(option.id) === data.category_option_id);
    const isKitchenToolIssue = selectedCategory?.code === 'kerusakan-alat-dapur';
    const isVehicleIssue = selectedCategory?.code === 'kendala-kendaraan';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('tickets.update', ticket.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ubah ${ticket.ticket_number}`} />

            <div className="max-w-xl p-4">
                {ticket.photo_url && (
                    <div className="mb-4 grid gap-2">
                        <Label>Foto Bukti</Label>
                        <a href={ticket.photo_url} target="_blank" rel="noopener noreferrer" className="block w-fit">
                            <img src={ticket.photo_url} alt="Foto bukti laporan" className="max-h-64 rounded-lg border object-contain" />
                        </a>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="category_option_id">Kategori Masalah</Label>
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
                        <Label htmlFor="priority_option_id">Tingkat Darurat</Label>
                        <Select value={data.priority_option_id} onValueChange={(value) => setData('priority_option_id', value)}>
                            <SelectTrigger id="priority_option_id">
                                <SelectValue placeholder="Pilih prioritas" />
                            </SelectTrigger>
                            <SelectContent>
                                {priorityOptions.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.priority_option_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="kitchen_id">Dapur Terkait</Label>
                        <Select value={data.kitchen_id} onValueChange={(value) => setData('kitchen_id', value)}>
                            <SelectTrigger id="kitchen_id">
                                <SelectValue placeholder="Pilih dapur" />
                            </SelectTrigger>
                            <SelectContent>
                                {kitchens.map((kitchen) => (
                                    <SelectItem key={kitchen.id} value={String(kitchen.id)}>
                                        {kitchen.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.kitchen_id} />
                    </div>

                    {isKitchenToolIssue && (
                        <div className="grid gap-2">
                            <Label htmlFor="related_kitchen_tool_id">Alat Dapur Terkait (opsional)</Label>
                            <Select
                                value={data.related_kitchen_tool_id || 'none'}
                                onValueChange={(value) => setData('related_kitchen_tool_id', value === 'none' ? '' : value)}
                            >
                                <SelectTrigger id="related_kitchen_tool_id">
                                    <SelectValue placeholder="Tidak ada" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Tidak ada</SelectItem>
                                    {kitchenTools.map((tool) => (
                                        <SelectItem key={tool.id} value={String(tool.id)}>
                                            {tool.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.related_kitchen_tool_id} />
                        </div>
                    )}

                    {isVehicleIssue && (
                        <div className="grid gap-2">
                            <Label htmlFor="related_vehicle_id">Kendaraan Terkait (opsional)</Label>
                            <Select
                                value={data.related_vehicle_id || 'none'}
                                onValueChange={(value) => setData('related_vehicle_id', value === 'none' ? '' : value)}
                            >
                                <SelectTrigger id="related_vehicle_id">
                                    <SelectValue placeholder="Tidak ada" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Tidak ada</SelectItem>
                                    {vehicles.map((vehicle) => (
                                        <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                                            {vehicle.plate_number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.related_vehicle_id} />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="subject">Judul Masalah</Label>
                        <Input id="subject" value={data.subject} onChange={(e) => setData('subject', e.target.value)} />
                        <InputError message={errors.subject} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Deskripsi Masalah</Label>
                        <Textarea id="description" rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        <InputError message={errors.description} />
                    </div>

                    <Button type="submit" disabled={processing}>
                        Simpan Perubahan
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
