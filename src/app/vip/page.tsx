'use client';

import { useState } from 'react';
import { Check, Crown, Sparkles } from 'lucide-react';

const PLANS = [
    {
        id: 'basic',
        amount: 75_000,
        label: '75.000',
        title: 'Gói VIP Cơ bản',
        perks: ['Xem không quảng cáo', 'Chất lượng HD', 'Ưu tiên server'],
    },
    {
        id: 'premium',
        amount: 200_000,
        label: '200.000',
        title: 'Gói VIP Cao cấp',
        perks: ['Mọi quyền lợi gói cơ bản', '4K khi có sẵn', 'Phim mới sớm nhất', 'Hỗ trợ ưu tiên'],
        featured: true,
    },
] as const;

export default function VipPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selected = PLANS.find((p) => p.id === selectedId);

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
                        Chọn gói phù hợp — thanh toán sẽ được bổ sung sau.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {PLANS.map((plan) => {
                        const isSelected = selectedId === plan.id;
                        return (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() => setSelectedId(plan.id)}
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
                                        Phổ biến
                                    </span>
                                )}
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-yellow-400/90">
                                            {plan.title}
                                        </p>
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
                    <div className="mt-8 rounded-xl border border-yellow-400/30 bg-yellow-400/5 px-5 py-4 text-center">
                        <p className="text-sm text-zinc-300">
                            Bạn đã chọn:{' '}
                            <span className="font-semibold text-yellow-300">
                                {selected.title} — {selected.label}đ
                            </span>
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Tạm thời chỉ lưu lựa chọn trên trang. Bước thanh toán sẽ cập nhật sau.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
