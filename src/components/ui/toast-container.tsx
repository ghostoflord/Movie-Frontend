'use client';

import { useToastStore } from '@/hooks/useToastStore';

const variantStyles = {
    success: {
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-950/95',
        icon: '✓',
        iconClass: 'text-emerald-400',
    },
    error: {
        border: 'border-red-500/40',
        bg: 'bg-red-950/95',
        icon: '!',
        iconClass: 'text-red-400',
    },
    info: {
        border: 'border-zinc-500/40',
        bg: 'bg-zinc-900/95',
        icon: 'i',
        iconClass: 'text-zinc-400',
    },
} as const;

export function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);
    const dismiss = useToastStore((s) => s.dismiss);

    if (toasts.length === 0) return null;

    return (
        <div
            className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2 px-4 sm:bottom-6 sm:right-6 sm:px-0"
            aria-live="polite"
            aria-relevant="additions"
        >
            {toasts.map((t) => {
                const style = variantStyles[t.variant];
                return (
                    <div
                        key={t.id}
                        role="status"
                        className={[
                            'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-md',
                            'transition-all duration-300 ease-out',
                            style.border,
                            style.bg,
                        ].join(' ')}
                    >
                        <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-sm font-bold ${style.iconClass}`}
                            aria-hidden
                        >
                            {style.icon}
                        </span>
                        <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-white">{t.message}</p>
                        <button
                            type="button"
                            onClick={() => dismiss(t.id)}
                            className="shrink-0 rounded px-1 text-lg leading-none text-zinc-500 transition hover:bg-white/10 hover:text-white"
                            aria-label="Đóng"
                        >
                            ×
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
