import { Suspense } from 'react';
import HomeMovies from '@/components/client/home-movies';
// Tesst
export default function Home() {
    return (
        <div className="min-h-screen bg-[#0b0b0f] text-white">
            <Suspense
                fallback={
                    <div className="flex min-h-[40vh] items-center justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#e50914]" />
                    </div>
                }
            >
                <HomeMovies />
            </Suspense>
        </div>
    );
}
