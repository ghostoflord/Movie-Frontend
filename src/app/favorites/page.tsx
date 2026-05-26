'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { favoritesAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import { MoviePosterGrid } from '@/components/client/movie-poster-grid';
import type { RecommendationMovie } from '@/types/admin-entities';

export default function FavoritesPage() {
    const { user, token, isLoading, isAuthenticated } = useAuth();
    const [movies, setMovies] = useState<RecommendationMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadFavorites = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const list = await favoritesAPI.list();
            setMovies(list);
        } catch (e) {
            setMovies([]);
            setError(
                toUserErrorMessage((e as { response?: { data?: unknown } })?.response?.data ?? e, {
                    fallback: 'Không tải được danh sách yêu thích.',
                }),
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (isAuthenticated && token) {
            void loadFavorites();
        }
    }, [isAuthenticated, token, loadFavorites]);

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
                        <Heart className="h-7 w-7" aria-hidden />
                    </div>
                    <h1 className="text-xl font-bold text-white">Phim yêu thích</h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Đăng nhập để xem các phim bạn đã thêm vào mục yêu thích.
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

    return (
        <div className="mx-auto max-w-[1200px] px-3 pb-20 pt-8 sm:px-4">
            <header className="mb-10 border-b border-white/10 pb-4">
                <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    <span className="h-8 w-1.5 shrink-0 rounded-sm bg-[#e50914]" aria-hidden />
                    <Heart className="h-7 w-7 text-red-500/90" aria-hidden />
                    Phim yêu thích
                </h1>
                <p className="mt-2 text-sm text-zinc-500">
                    Các phim bạn đã lưu — hiển thị theo tài khoản đang đăng nhập.
                </p>
            </header>

            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <p className="text-sm text-zinc-400">
                    {movies.length > 0 ? `${movies.length} phim` : 'Danh sách trống'}
                </p>
                <button
                    type="button"
                    onClick={() => void loadFavorites()}
                    disabled={loading}
                    className="shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 transition hover:text-[#e50914] disabled:opacity-50"
                >
                    Làm mới
                </button>
            </div>

            {loading && movies.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-white/5 bg-[#0d0d12]/80">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-[#e50914]" />
                </div>
            ) : error ? (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-6 text-center text-sm text-red-200/90">
                    {error}
                </div>
            ) : movies.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-[#0d0d12]/50 px-4 py-10 text-center">
                    <User className="mx-auto mb-3 h-8 w-8 text-zinc-600" aria-hidden />
                    <p className="text-sm text-zinc-500">
                        Chưa có phim yêu thích. Hãy thêm phim từ trang chi tiết khi tính năng lưu yêu thích sẵn sàng.
                    </p>
                    <Link
                        href="/"
                        className="mt-4 inline-block text-sm font-semibold text-[#e50914] transition hover:text-red-400"
                    >
                        Khám phá phim
                    </Link>
                </div>
            ) : (
                <MoviePosterGrid movies={movies} />
            )}
        </div>
    );
}
