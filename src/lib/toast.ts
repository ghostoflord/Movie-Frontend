import { useToastStore, type ToastVariant } from '@/hooks/useToastStore';

function show(message: string, variant: ToastVariant = 'info') {
    useToastStore.getState().push(message, variant);
}

export const toast = {
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
    info: (message: string) => show(message, 'info'),
};
