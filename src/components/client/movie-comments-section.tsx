'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { commentAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import type { PublicMovieComment } from '@/types/public-movie-detail';
import { useAuth } from '@/hooks/useAuth';

function nameInitials(name: string): string {
    const parts = (name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return (first + last).toUpperCase() || '?';
}

function formatCommentTime(iso: string): string {
    try {
        return new Date(iso).toLocaleString('vi-VN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '';
    }
}

function authorLabel(comment: PublicMovieComment, currentUserId?: number): string {
    if (currentUserId != null && comment.user_id === currentUserId) {
        return 'Bạn';
    }
    const name = comment.user?.name?.trim();
    if (name) return name;
    if (comment.user_id != null) {
        return `Thành viên #${comment.user_id}`;
    }
    return 'Khách';
}

function commentAvatarSrc(comment: PublicMovieComment, me?: { id: number; avatar?: string | null }): string | null {
    if (me?.id != null && comment.user_id === me.id) {
        const a = (me.avatar ?? '').trim();
        return a ? a : null;
    }
    const a = (comment.user?.avatar ?? '').trim();
    return a ? a : null;
}

export function MovieCommentsSection({
    movieId,
    episodeId,
    initialComments,
    onCommentAdded,
}: {
    movieId: number;
    episodeId?: number | null;
    initialComments: PublicMovieComment[];
    onCommentAdded?: (comment: PublicMovieComment) => void;
}) {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState<PublicMovieComment[]>(initialComments);

    useEffect(() => {
        setComments(initialComments);
    }, [initialComments]);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = content.trim();
        if (!text) return;
        if (!isAuthenticated) {
            setError('Vui lòng đăng nhập để bình luận.');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const created = await commentAPI.create({
                movie_id: movieId,
                episode_id: episodeId ?? null,
                content: text,
            });
            const row: PublicMovieComment = {
                id: created.id,
                content: created.content,
                created_at: created.created_at,
                user_id: created.user_id ?? user?.id,
                user: user
                    ? {
                          id: user.id,
                          name: user.name,
                          avatar: user.avatar,
                      }
                    : null,
                movie_id: created.movie_id ?? movieId,
                episode_id: created.episode_id ?? null,
            };
            setComments((prev) => [row, ...prev]);
            setContent('');
            onCommentAdded?.(row);
        } catch (err) {
            setError(
                toUserErrorMessage((err as { response?: { data?: unknown } })?.response?.data ?? err, {
                    fallback: 'Gửi bình luận thất bại.',
                }),
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="border-t border-white/10 pt-8">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold uppercase tracking-wide text-amber-300 md:text-lg">
                <MessageSquare className="h-5 w-5" aria-hidden />
                Bình luận
                <span className="text-sm font-normal normal-case text-zinc-500">({comments.length})</span>
            </h2>

            {isAuthenticated ? (
                <form onSubmit={(e) => void handleSubmit(e)} className="mb-6 space-y-3">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Viết bình luận của bạn…"
                        rows={3}
                        maxLength={2000}
                        className="w-full resize-y rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#e50914]/50 focus:outline-none focus:ring-1 focus:ring-[#e50914]/40"
                    />
                    {error ? (
                        <p className="text-sm text-red-400" role="alert">
                            {error}
                        </p>
                    ) : null}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting || !content.trim()}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#e50914] px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            ) : (
                                <Send className="h-4 w-4" aria-hidden />
                            )}
                            Gửi bình luận
                        </button>
                    </div>
                </form>
            ) : (
                <p className="mb-6 rounded-lg border border-white/10 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
                    <Link href="/login" className="font-semibold text-[#e50914] hover:underline">
                        Đăng nhập
                    </Link>{' '}
                    để tham gia bình luận cùng mọi người.
                </p>
            )}

            {comments.length === 0 ? (
                <p className="text-sm text-zinc-500">Chưa có bình luận. Hãy là người đầu tiên!</p>
            ) : (
                <ul className="space-y-4">
                    {comments.map((c) => (
                        <li
                            key={c.id}
                            className="rounded-lg border border-white/5 bg-zinc-900/40 px-4 py-3"
                        >
                            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                                        {commentAvatarSrc(c, user ? { id: user.id, avatar: user.avatar } : undefined) ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={commentAvatarSrc(c, user ? { id: user.id, avatar: user.avatar } : undefined) ?? ''}
                                                alt=""
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                                decoding="async"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[11px] font-bold text-zinc-200">
                                                {nameInitials(authorLabel(c, user?.id))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="truncate font-semibold text-amber-300/90">
                                        {authorLabel(c, user?.id)}
                                    </span>
                                </div>
                                <time className="text-zinc-500" dateTime={c.created_at}>
                                    {formatCommentTime(c.created_at)}
                                </time>
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                                {c.content}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
