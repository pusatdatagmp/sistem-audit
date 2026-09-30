import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const CATEGORY_GROUP_CODE = 'kitchen_tool_category';

interface QuickAddCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function QuickAddCategoryDialog({ open, onOpenChange }: QuickAddCategoryDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        label: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('master-data.options.store', CATEGORY_GROUP_CODE), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Kategori Alat Dapur</DialogTitle>
                    <DialogDescription>Kategori baru langsung bisa dipilih setelah disimpan, tanpa perlu keluar dari form ini.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="quick_category_label">Nama Kategori</Label>
                        <Input
                            id="quick_category_label"
                            value={data.label}
                            onChange={(e) => setData('label', e.target.value)}
                            autoFocus
                        />
                        <InputError message={errors.label} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            Simpan Kategori
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
