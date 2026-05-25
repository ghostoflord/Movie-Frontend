import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastItem = {
    id: string;
    message: string;
    variant: ToastVariant;
};

type ToastState = {
    toasts: ToastItem[];
    push: (message: string, variant?: ToastVariant) => void;
    dismiss: (id: string) => void;
};

const AUTO_DISMISS_MS = 3200;

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],
    push: (message, variant = 'info') => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
        window.setTimeout(() => {
            get().dismiss(id);
        }, AUTO_DISMISS_MS);
    },
    dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
