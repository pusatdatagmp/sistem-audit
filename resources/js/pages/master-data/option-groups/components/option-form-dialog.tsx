import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type MasterDataGroup, type MasterDataOption } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

interface OptionFormDialogProps {
    group: MasterDataGroup;
    option: MasterDataOption | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function OptionFormDialog({ group, option, open, onOpenChange }: OptionFormDialogProps) {
    const isEditing = option !== null;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        label: string;
        description: string;
        sort_order: number;
        is_active: boolean;
    }>({
        label: '',
        description: '',
        sort_order: 0,
        is_active: true,
    });

    useEffect(() => {
        if (open) {
            setData({
                label: option?.label ?? '',
                description: option?.description ?? '',
                sort_order: option?.sort_order ?? 0,
                is_active: option?.is_active ?? true,
            });
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, option]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const onSuccess = () => {
            reset();
            onOpenChange(false);
        };

        if (isEditing) {
            put(route('master-data.options.update', option.id), { onSuccess });
        } else {
            post(route('master-data.options.store', group.code), { onSuccess });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Ubah Opsi' : 'Tambah Opsi'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="option_label">Label</Label>
                        <Input id="option_label" value={data.label} onChange={(e) => setData('label', e.target.value)} />
                        <InputError message={errors.label} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="option_description">Deskripsi (opsional)</Label>
                        <Input id="option_description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="option_sort_order">Urutan Tampil</Label>
                        <Input
                            id="option_sort_order"
                            type="number"
                            min={0}
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', Number(e.target.value))}
                        />
                        <InputError message={errors.sort_order} />
                    </div>

                    {isEditing && (
                        <div className="flex items-center gap-2">
                            <input
                                id="option_is_active"
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-input"
                            />
                            <Label htmlFor="option_is_active">Aktif</Label>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
