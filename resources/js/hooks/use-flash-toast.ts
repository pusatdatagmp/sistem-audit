import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

export function useFlashToast() {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: flash.success,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
            });
        }
    }, [flash?.success]);
}
