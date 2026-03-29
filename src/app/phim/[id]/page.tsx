'use client';

import { useParams } from 'next/navigation';
import MovieDetailView from '@/components/client/movie-detail-view';

export default function PhimDetailPage() {
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
