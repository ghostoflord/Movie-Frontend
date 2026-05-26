'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { commentAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import { resolveUserAvatarUrl } from '@/lib/avatar';
import { parseComments } from '@/lib/parse-comments';
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
        const d = new Date(iso);
        if (!iso || Number.isNaN(d.getTime())) return '';
        return d.toLocaleString('vi-VN', {
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

function commentUserId(comment: PublicMovieComment): number | undefined {
    return comment.user_id ?? comment.user?.id;
}

function authorLabel(comment: PublicMovieComment, currentUserId?: number): string {
    const uid = commentUserId(comment);
    if (currentUserId != null && uid === currentUserId) {
        return 'Bạn';
    }
    const name = comment.user?.name?.trim();
    if (name) return name;
    if (uid != null) {
        return `Thành viên #${uid}`;
    }
    return 'Khách';
}

function commentAvatarSrc(
    comment: PublicMovieComment,
    me?: { id: number; avatar?: string | null },
): string | null {
    const fromUser = resolveUserAvatarUrl(comment.user?.avatar_url ?? undefined);
    if (fromUser) return fromUser;

    const uid = commentUserId(comment);
    if (me?.id != null && uid === me.id) {
        return resolveUserAvatarUrl(me.avatar);
    }
    return null;
}

function CommentAvatar({
    comment,
    currentUserId,
    me,
}: {
    comment: PublicMovieComment;
    currentUserId?: number;
    me?: { id: number; avatar?: string | null };
}) {
    const src = commentAvatarSrc(comment, me);
    const label = authorLabel(comment, currentUserId);

    return (
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
            {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <div
                    className="flex h-full w-full items-center justify-center text-[11px] font-bold text-zinc-200"
                    aria-hidden
                >
                    {nameInitials(label)}
                </div>
            )}
        </div>
    );
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
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        setComments(initialComments);
    }, [initialComments]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoadingComments(true);
            try {
                const raw = await commentAPI.listByMovie(movieId);
                const parsed = parseComments(raw);
                if (!cancelled) {
                    setComments(parsed);
                }
            } catch {
                if (!cancelled) {
                    setComments(initialComments);
                }
            } finally {
                if (!cancelled) setLoadingComments(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ refetch khi đổi phim
    }, [movieId]);

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
                created_at: created.created_at || new Date().toISOString(),
                likes_count: created.likes_count,
                user_id: created.user_id ?? created.user?.id ?? user?.id,
                user: created.user
                    ? {
                          id: created.user.id,
                          name: created.user.name,
                          avatar_url: created.user.avatar_url ?? null,
                      }
                    : user
                      ? {
                            id: user.id,
                            name: user.name,
                            avatar_url: resolveUserAvatarUrl(user.avatar),
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

    const me = user ? { id: user.id, avatar: user.avatar } : undefined;

    return (
        <section className="border-t border-white/10 pt-8">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold uppercase tracking-wide text-amber-300 md:text-lg">
                <MessageSquare className="h-5 w-5" aria-hidden />
                Bình luận
                <span className="text-sm font-normal normal-case text-zinc-500">
                    ({comments.length})
                    {loadingComments ? ' · đang tải…' : ''}
                </span>
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
                <p className="text-sm text-zinc-500">
                    {loadingComments ? 'Đang tải bình luận…' : 'Chưa có bình luận. Hãy là người đầu tiên!'}
                </p>
            ) : (
                <ul className="space-y-4">
                    {comments.map((c) => (
                        <li
                            key={c.id}
                            className="rounded-lg border border-white/5 bg-zinc-900/40 px-4 py-3"
                        >
                            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex min-w-0 items-center gap-2">
                                    <CommentAvatar comment={c} currentUserId={user?.id} me={me} />
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
