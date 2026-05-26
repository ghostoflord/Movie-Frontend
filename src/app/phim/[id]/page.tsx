'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import MovieDetailView from '@/components/client/movie-detail-view';

function PhimDetailContent() {
    const params = useParams();
    const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
    if (!id) {
        return (
            <div className="py-20 text-center text-zinc-400">
                <p>Không có mã phim.</p>
            </div>
        );
    }
    return <MovieDetailView movieId={id} />;
}

export default function PhimDetailPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[50vh] items-center justify-center bg-black">
                    <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-800 border-t-[#e50914]" />
                </div>
            }
        >
            <PhimDetailContent />
        </Suspense>
    );
}
