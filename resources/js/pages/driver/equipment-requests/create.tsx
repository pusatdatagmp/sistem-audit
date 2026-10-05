import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DriverLayout from '@/layouts/driver-layout';
import { type Kitchen, type KitchenTool, type MasterDataOption } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface DriverEquipmentRequestsCreateProps {
    kitchen: Kitchen;
    kitchenTools: KitchenTool[];
    categoryOptions: MasterDataOption[];
}

export default function DriverEquipmentRequestsCreate({ kitchen, kitchenTools, categoryOptions }: DriverEquipmentRequestsCreateProps) {
    const [useNewTool, setUseNewTool] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        kitchen_tool_id: '',
        new_tool_name: '',
        new_tool_unit: '',
        new_tool_category_option_id: '',
        quantity: '1',
        reason: '',
    });

    function toggleSource(toNewTool: boolean) {
        setUseNewTool(toNewTool);

        if (toNewTool) {
            setData('kitchen_tool_id', '');
        } else {
            setData('new_tool_name', '');
            setData('new_tool_unit', '');
            setData('new_tool_category_option_id', '');
        }
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('driver.equipment-requests.store'));
    };

    return (
        <DriverLayout>
            <Head title="Buat Pengajuan Alat Dapur" />

            <h1 className="mb-4 text-xl font-semibold">Buat Pengajuan Alat Dapur</h1>

            <form onSubmit={submit} className="bg-background space-y-4 rounded-xl border p-4">
                <div className="grid gap-2">
                    <Label htmlFor="kitchen">Dapur</Label>
                    <Input id="kitchen" value={kitchen.name} disabled readOnly />
                </div>

                <div className="grid gap-2">
                    <Label>Sumber Alat</Label>
                    <div className="flex gap-2">
                        <Button type="button" variant={!useNewTool ? 'default' : 'outline'} size="sm" onClick={() => toggleSource(false)}>
                            Pilih dari katalog
                        </Button>
                        <Button type="button" variant={useNewTool ? 'default' : 'outline'} size="sm" onClick={() => toggleSource(true)}>
                            Tulis alat baru
                        </Button>
                    </div>
                </div>

                {!useNewTool ? (
                    <div className="grid gap-2">
                        <Label htmlFor="kitchen_tool_id">Alat Dapur</Label>
                        <Select value={data.kitchen_tool_id} onValueChange={(value) => setData('kitchen_tool_id', value)}>
                            <SelectTrigger id="kitchen_tool_id">
                                <SelectValue placeholder="Pilih alat" />
                            </SelectTrigger>
                            <SelectContent>
                                {kitchenTools.map((tool) => (
                                    <SelectItem key={tool.id} value={String(tool.id)}>
                                        {tool.name} ({tool.unit})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.kitchen_tool_id} />
                    </div>
                ) : (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="new_tool_name">Nama Alat Baru</Label>
                            <Input id="new_tool_name" value={data.new_tool_name} onChange={(e) => setData('new_tool_name', e.target.value)} />
                            <InputError message={errors.new_tool_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="new_tool_unit">Satuan</Label>
                            <Input
                                id="new_tool_unit"
                                placeholder="pcs, unit, set, dll"
                                value={data.new_tool_unit}
                                onChange={(e) => setData('new_tool_unit', e.target.value)}
                            />
                            <InputError message={errors.new_tool_unit} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="new_tool_category_option_id">Kategori</Label>
                            <Select
                                value={data.new_tool_category_option_id}
                                onValueChange={(value) => setData('new_tool_category_option_id', value)}
                            >
                                <SelectTrigger id="new_tool_category_option_id">
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
                            <InputError message={errors.new_tool_category_option_id} />
                        </div>
                    </>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="quantity">Jumlah</Label>
                    <Input id="quantity" type="number" min={1} value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} />
                    <InputError message={errors.quantity} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="reason">Alasan Pengajuan</Label>
                    <Textarea id="reason" rows={4} value={data.reason} onChange={(e) => setData('reason', e.target.value)} />
                    <InputError message={errors.reason} />
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>
                        Kirim Pengajuan
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href={route('driver.equipment-requests.index')}>Batal</Link>
                    </Button>
                </div>
            </form>
        </DriverLayout>
    );
}
