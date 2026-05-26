'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Crown, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { vnpayAPI, type VnpayPlanId } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import { unwrapData } from '@/lib/unwrap-api';
import { canUseContinueWatching } from '@/lib/roles';

type BillingPlan = {
    id: VnpayPlanId;
    title: string;
    periodLabel: string;
    amount: number;
    label: string;
    perks: string[];
    featured?: boolean;
};

const DEFAULT_PLANS: BillingPlan[] = [
    {
        id: 'monthly',
        title: 'VIP 1 tháng',
        periodLabel: 'Tháng',
        amount: 79_000,
        label: '79.000',
        perks: ['Xem không quảng cáo', 'Chất lượng HD', 'Ưu tiên server'],
    },
    {
        id: 'yearly',
        title: 'VIP 1 năm',
        periodLabel: 'Năm',
        amount: 790_000,
        label: '790.000',
        perks: ['Mọi quyền lợi gói tháng', 'Tiết kiệm hơn gói tháng', '4K khi có sẵn', 'Hỗ trợ ưu tiên'],
        featured: true,
    },
];

function formatVnd(amount: number) {
    return amount.toLocaleString('vi-VN');
}

export default function VipPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [plans, setPlans] = useState<BillingPlan[]>(DEFAULT_PLANS);
    const [selectedId, setSelectedId] = useState<VnpayPlanId | null>(null);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        void vnpayAPI
            .getPlans()
            .then((res) => {
                if (cancelled) return;
                const data = unwrapData<Record<VnpayPlanId, { amount: number; days: number; label: string }>>(
                    res as { data: Record<VnpayPlanId, { amount: number; days: number; label: string }> },
                );
                if (!data) return;
                setPlans((prev) =>
                    prev.map((p) => {
                        const fromApi = data[p.id];
                        if (!fromApi) return p;
                        return {
                            ...p,
                            title: fromApi.label || p.title,
                            amount: fromApi.amount,
                            label: formatVnd(fromApi.amount),
                        };
                    }),
                );
            })
            .catch(() => {
                /* giữ giá mặc định */
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const selected = plans.find((p) => p.id === selectedId);
    const isAlreadyVipOrAdmin = Boolean(user && canUseContinueWatching(user.role));

    const handlePay = useCallback(async () => {
        if (!selectedId) return;
        setError(null);

        if (isAlreadyVipOrAdmin) {
            setError('Tài khoản của bạn đã có quyền VIP/Admin nên không cần mua thêm.');
            return;
        }

        if (!isAuthenticated) {
            router.push(`/login?next=${encodeURIComponent('/vip')}`);
            return;
        }

        setPaying(true);
        try {
            const res = await vnpayAPI.createPayment(selectedId);
            const payload = unwrapData<{ payment_url: string; order_id: string }>(res);
            const paymentUrl = payload?.payment_url;
            if (!paymentUrl) {
                setError('Không nhận được link thanh toán. Vui lòng thử lại.');
                return;
            }
            window.location.href = paymentUrl;
        } catch (err) {
            setError(
                toUserErrorMessage((err as { response?: { data?: unknown } })?.response?.data ?? err, {
                    fallback: 'Không tạo được thanh toán. Vui lòng đăng nhập và thử lại.',
                }),
            );
        } finally {
            setPaying(false);
        }
    }, [isAuthenticated, isAlreadyVipOrAdmin, router, selectedId]);

    return (
        <div className="min-h-screen bg-[#0b0b0f] text-white">
            <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
                <div className="mb-10 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/30 to-amber-600/20 ring-1 ring-yellow-400/40">
                        <Crown className="h-7 w-7 text-yellow-300" aria-hidden />
                    </div>
                    <h1 className="text-2xl font-black tracking-wide text-white md:text-3xl">
                        Nâng cấp <span className="text-yellow-300">VIP</span>
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400 md:text-base">
                        Chọn gói theo tháng hoặc năm — thanh toán qua VNPay.
                    </p>
                    {isAlreadyVipOrAdmin ? (
                        <p className="mx-auto mt-3 max-w-xl rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                            Tài khoản của bạn đã có quyền <span className="font-semibold">VIP/Admin</span>. Nút thanh toán đã được tắt.
                        </p>
                    ) : null}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {plans.map((plan) => {
                        const isSelected = selectedId === plan.id;
                        return (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() => {
                                    setSelectedId(plan.id);
                                    setError(null);
                                }}
                                className={[
                                    'group relative w-full rounded-2xl border p-6 text-left transition-all duration-200',
                                    'bg-[#12121a] hover:border-yellow-400/40',
                                    plan.featured
                                        ? 'border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.08)]'
                                        : 'border-white/10',
                                    isSelected
                                        ? 'border-yellow-400 ring-2 ring-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.15)]'
                                        : '',
                                ].join(' ')}
                            >
                                {plan.featured && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                                        Tiết kiệm
                                    </span>
                                )}
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-yellow-400/90">
                                            {plan.periodLabel}
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-white">{plan.title}</p>
                                        <p className="mt-2 flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-white">{plan.label}</span>
                                            <span className="text-lg font-semibold text-zinc-400">đ</span>
                                        </p>
                                    </div>
                                    <div
                                        className={[
                                            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                            isSelected
                                                ? 'border-yellow-400 bg-yellow-400 text-black'
                                                : 'border-zinc-600 group-hover:border-yellow-400/60',
                                        ].join(' ')}
                                        aria-hidden
                                    >
                                        {isSelected && <Check size={14} strokeWidth={3} />}
                                    </div>
                                </div>
                                <ul className="mt-5 space-y-2">
                                    {plan.perks.map((perk) => (
                                        <li
                                            key={perk}
                                            className="flex items-center gap-2 text-sm text-zinc-400"
                                        >
                                            <Sparkles
                                                size={14}
                                                className="flex-shrink-0 text-yellow-400/80"
                                                aria-hidden
                                            />
                                            {perk}
                                        </li>
                                    ))}
                                </ul>
                            </button>
                        );
                    })}
                </div>

                {selected && (
                    <div className="mt-8 space-y-4 rounded-xl border border-yellow-400/30 bg-yellow-400/5 px-5 py-5">
                        <p className="text-center text-sm text-zinc-300">
                            Bạn đã chọn:{' '}
                            <span className="font-semibold text-yellow-300">
                                {selected.title} — {selected.label}đ
                            </span>
                        </p>

                        {!authLoading && !isAuthenticated ? (
                            <p className="text-center text-xs text-amber-300/90">
                                Bạn cần{' '}
                                <Link href="/login" className="font-semibold underline hover:text-amber-200">
                                    đăng nhập
                                </Link>{' '}
                                để thanh toán.
                            </p>
                        ) : null}

                        {error ? (
                            <p className="text-center text-sm text-red-300/90" role="alert">
                                {error}
                            </p>
                        ) : null}

                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={() => void handlePay()}
                                disabled={paying || authLoading || isAlreadyVipOrAdmin}
                                className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {paying ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                        Đang chuyển VNPay…
                                    </>
                                ) : (
                                    isAlreadyVipOrAdmin ? 'Đã có VIP' : 'Thanh toán VNPay'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
