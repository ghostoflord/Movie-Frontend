'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Heart, Mail, Shield, Sparkles, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { recommendationsAPI } from '@/lib/api';
import { resolveUserAvatarUrl } from '@/lib/avatar';
import { canUseContinueWatching, isAdminRole } from '@/lib/roles';
import { toUserErrorMessage } from '@/lib/api-error';
import type { RecommendationMovie } from '@/types/admin-entities';
import { MoviePosterGrid } from '@/components/client/movie-poster-grid';

function roleLabel(role: string | undefined) {
    if (isAdminRole(role)) return 'Quản trị viên';
    return 'Thành viên';
}

function formatJoined(iso: string | undefined) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return '—';
    }
}

export default function ProfilePage() {
    const { user, token, isLoading, isAuthenticated } = useAuth();
    const [recs, setRecs] = useState<RecommendationMovie[]>([]);
    const [recLoading, setRecLoading] = useState(false);
    const [recError, setRecError] = useState<string | null>(null);

    const loadRecommendations = useCallback(async () => {
        if (!token) return;
        setRecLoading(true);
        setRecError(null);
        try {
            const list = await recommendationsAPI.get();
            setRecs(list);
        } catch (e) {
            setRecs([]);
            setRecError(
                toUserErrorMessage((e as { response?: { data?: unknown } })?.response?.data ?? e, {
                    fallback: 'Không tải được gợi ý. Bạn có thể thử lại sau.',
                }),
            );
        } finally {
            setRecLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (isAuthenticated && token) {
            void loadRecommendations();
        }
    }, [isAuthenticated, token, loadRecommendations]);

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center bg-[#0b0b0f]">
                <div
                    className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-700 border-t-[#e50914]"
                    aria-hidden
                />
            </div>
        );
    }

    if (!user || !token) {
        return (
            <div className="mx-auto max-w-lg px-4 py-16 text-center">
                <div className="rounded-2xl border border-white/10 bg-[#12121a] p-10 shadow-xl shadow-black/40">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-600/20 text-red-400">
                        <User className="h-7 w-7" aria-hidden />
                    </div>
                    <h1 className="text-xl font-bold text-white">Hồ sơ của tôi</h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Đăng nhập để xem thông tin tài khoản và gợi ý phim cá nhân hóa.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/login"
                            className="rounded-lg bg-[#e50914] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-lg border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
                        >
                            Đăng ký
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const profileAvatarUrl = resolveUserAvatarUrl(user.avatar);

    return (
        <div className="mx-auto max-w-[1200px] px-3 pb-20 pt-8 sm:px-4">
            <header className="mb-10 border-b border-white/10 pb-4">
                <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    <span className="h-8 w-1.5 shrink-0 rounded-sm bg-[#e50914]" aria-hidden />
                    Hồ sơ của tôi
                </h1>
                <p className="mt-2 text-sm text-zinc-500">Quản lý tài khoản và khám phá phim dành cho bạn.</p>
            </header>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start">
                <aside className="space-y-4">
                    <div
                        className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#16161f] to-[#0d0d12] p-6 shadow-lg shadow-black/30"
                        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03)' }}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="relative">
                                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-red-500 to-red-800 text-3xl font-bold text-white shadow-lg shadow-red-900/40">
                                    {profileAvatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={profileAvatarUrl}
                                            alt=""
                                            className="absolute inset-0 h-full w-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'
                                    )}
                                </div>
                                <span
                                    className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-[#12121a] bg-emerald-500"
                                    title="Đang hoạt động"
                                />
                            </div>
                            <h2 className="mt-4 text-lg font-bold text-white">{user.name}</h2>
                            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-zinc-400">
                                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                <span className="break-all">{user.email}</span>
                            </p>
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 ring-1 ring-white/10">
                                    {isAdminRole(user.role) ? (
                                        <Shield className="h-3.5 w-3.5 text-amber-400/90" aria-hidden />
                                    ) : (
                                        <User className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
                                    )}
                                    {roleLabel(user.role)}
                                </span>
                                {user.email_verified_at ? (
                                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400/90">
                                        Đã xác minh email
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400/90">
                                        Chưa xác minh email
                                    </span>
                                )}
                            </div>
                        </div>

                        <dl className="mt-6 space-y-3 border-t border-white/5 pt-6 text-sm">
                            <div className="flex justify-between gap-3">
                                <dt className="flex items-center gap-2 text-zinc-500">
                                    <Calendar className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                                    Tham gia
                                </dt>
                                <dd className="text-right text-zinc-200">{formatJoined(user.created_at)}</dd>
                            </div>
                            {user.gender ? (
                                <div className="flex justify-between gap-3">
                                    <dt className="text-zinc-500">Giới tính</dt>
                                    <dd className="text-right text-zinc-200">{user.gender}</dd>
                                </div>
                            ) : null}
                        </dl>
                    </div>

                    <nav className="rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-2">
                        {canUseContinueWatching(user.role) ? (
                            <Link
                                href="/continue"
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
                            >
                                <Clock className="h-4 w-4 text-amber-400/80" aria-hidden />
                                Tiếp tục xem
                            </Link>
                        ) : null}
                        <Link
                            href="/favorites"
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
                        >
                            <Heart className="h-4 w-4 text-red-500/80" aria-hidden />
                            Phim yêu thích
                        </Link>
                        {isAdminRole(user.role) ? (
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
                            >
                                <Shield className="h-4 w-4 text-amber-500/80" aria-hidden />
                                Quản trị
                            </Link>
                        ) : null}
                    </nav>
                </aside>

                <section className="min-w-0">
                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wide text-white sm:text-lg">
                            <span className="h-6 w-1 shrink-0 rounded-sm bg-[#e50914]" aria-hidden />
                            <Sparkles className="h-5 w-5 text-amber-400/80" aria-hidden />
                            Gợi ý cho bạn
                        </h2>
                        <button
                            type="button"
                            onClick={() => void loadRecommendations()}
                            disabled={recLoading}
                            className="shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 transition hover:text-[#e50914] disabled:opacity-50"
                        >
                            Làm mới
                        </button>
                    </div>

                    {recLoading && recs.length === 0 ? (
                        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-white/5 bg-[#0d0d12]/80">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-[#e50914]" />
                        </div>
                    ) : recError ? (
                        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-6 text-center text-sm text-red-200/90">
                            {recError}
                        </div>
                    ) : recs.length === 0 ? (
                        <p className="rounded-xl border border-white/5 bg-[#0d0d12]/50 px-4 py-10 text-center text-sm text-zinc-500">
                            Chưa có gợi ý. Xem thêm phim để hệ thống học sở thích của bạn.
                        </p>
                    ) : (
                        <MoviePosterGrid movies={recs} />
                    )}
                </section>
            </div>
        </div>
    );
}
