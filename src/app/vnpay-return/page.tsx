'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Crown, Home, Loader2, XCircle } from 'lucide-react';
import { authAPI, vnpayAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/hooks/useAuthStore';
import { unwrapData } from '@/lib/unwrap-api';

type ReturnState =
    | { phase: 'loading' }
    | {
          phase: 'done';
          ok: boolean;
          orderId: string;
          responseCode: string;
          message: string;
      }
    | { phase: 'error'; message: string };

function isSuccessFlag(value: string | null): boolean {
    return value === '1' || value === 'true';
}

function VnpayReturnContent() {
    const searchParams = useSearchParams();
    const token = useAuthStore((s) => s.token);
    const [state, setState] = useState<ReturnState>({ phase: 'loading' });

    const querySnapshot = useMemo(() => {
        const entries: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            entries[key] = value;
        });
        return entries;
    }, [searchParams]);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const simplifiedSuccess = searchParams.get('success');
            const hasVnpayParams =
                searchParams.has('vnp_SecureHash') ||
                searchParams.has('vnp_TxnRef') ||
                searchParams.has('vnp_ResponseCode');

            if (simplifiedSuccess !== null && !hasVnpayParams) {
                const ok = isSuccessFlag(simplifiedSuccess);
                const orderId = searchParams.get('order_id') ?? '';
                const responseCode = searchParams.get('vnp_ResponseCode') ?? '';
                const message =
                    searchParams.get('message') ??
                    (ok ? 'Thanh toán thành công.' : 'Thanh toán không thành công.');

                if (!cancelled) {
                    setState({
                        phase: 'done',
                        ok,
                        orderId,
                        responseCode,
                        message: decodeURIComponent(message.replace(/\+/g, ' ')),
                    });
                }

                if (ok && token) {
                    try {
                        const userRes = await authAPI.getUser();
                        useAuthStore.setState({ user: userRes.data, token });
                    } catch {
                        /* giữ user cũ */
                    }
                }
                return;
            }

            if (!hasVnpayParams) {
                if (!cancelled) {
                    setState({
                        phase: 'error',
                        message: 'Không có thông tin thanh toán trên liên kết trả về.',
                    });
                }
                return;
            }

            try {
                const res = await vnpayAPI.callback(querySnapshot);
                const data = unwrapData<VnpayCallbackResult>(res);
                const ok = data?.status === 'success';
                const orderId =
                    data?.payment?.order_id ?? searchParams.get('vnp_TxnRef') ?? '';
                const responseCode = searchParams.get('vnp_ResponseCode') ?? '';
                const message =
                    data?.message ??
                    (ok ? 'Thanh toán thành công.' : 'Thanh toán không thành công.');

                if (!cancelled) {
                    setState({
                        phase: 'done',
                        ok,
                        orderId,
                        responseCode,
                        message,
                    });
                }

                if (ok && token) {
                    try {
                        const userRes = await authAPI.getUser();
                        useAuthStore.setState({ user: userRes.data, token });
                    } catch {
                        /* giữ user cũ */
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setState({
                        phase: 'error',
                        message: toUserErrorMessage(
                            (err as { response?: { data?: unknown } })?.response?.data ?? err,
                            { fallback: 'Không xác nhận được kết quả thanh toán.' },
                        ),
                    });
                }
            }
        };

        void run();
        return () => {
            cancelled = true;
        };
    }, [querySnapshot, searchParams, token]);

    if (state.phase === 'loading') {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
                <Loader2 className="h-10 w-10 animate-spin text-yellow-400" aria-hidden />
                <p className="text-sm text-zinc-400">Đang xác nhận kết quả thanh toán…</p>
            </div>
        );
    }

    if (state.phase === 'error') {
        return (
            <ResultCard
                ok={false}
                title="Không xác nhận được giao dịch"
                message={state.message}
                orderId=""
                responseCode=""
            />
        );
    }

    return (
        <ResultCard
            ok={state.ok}
            title={state.ok ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
            message={state.message}
            orderId={state.orderId}
            responseCode={state.responseCode}
        />
    );
}

function ResultCard({
    ok,
    title,
    message,
    orderId,
    responseCode,
}: {
    ok: boolean;
    title: string;
    message: string;
    orderId: string;
    responseCode: string;
}) {
    return (
        <div className="mx-auto flex min-h-[50vh] max-w-lg items-center px-4 py-12">
            <div
                className={[
                    'w-full rounded-2xl border p-8 text-center shadow-xl shadow-black/40',
                    ok
                        ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-[#12121a]'
                        : 'border-red-500/30 bg-gradient-to-b from-red-500/10 to-[#12121a]',
                ].join(' ')}
            >
                <div
                    className={[
                        'mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full',
                        ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400',
                    ].join(' ')}
                >
                    {ok ? (
                        <CheckCircle2 className="h-9 w-9" aria-hidden />
                    ) : (
                        <XCircle className="h-9 w-9" aria-hidden />
                    )}
                </div>

                <h1 className="text-xl font-bold text-white md:text-2xl">{title}</h1>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{message}</p>

                {(orderId || responseCode) && (
                    <dl className="mt-6 space-y-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm">
                        {orderId ? (
                            <div className="flex justify-between gap-3">
                                <dt className="text-zinc-500">Mã đơn</dt>
                                <dd className="font-mono text-xs text-zinc-200 break-all text-right">
                                    {orderId}
                                </dd>
                            </div>
                        ) : null}
                        {responseCode ? (
                            <div className="flex justify-between gap-3">
                                <dt className="text-zinc-500">Mã phản hồi VNPay</dt>
                                <dd className="font-mono text-zinc-200">{responseCode}</dd>
                            </div>
                        ) : null}
                    </dl>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
                    >
                        <Home className="h-4 w-4" aria-hidden />
                        Trang chủ
                    </Link>
                    {ok ? (
                        <Link
                            href="/vip"
                            className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-300"
                        >
                            <Crown className="h-4 w-4" aria-hidden />
                            Gói VIP
                        </Link>
                    ) : (
                        <Link
                            href="/vip"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#e50914] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Thử thanh toán lại
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VnpayReturnPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-yellow-400" aria-hidden />
                </div>
            }
        >
            <VnpayReturnContent />
        </Suspense>
    );
}
