import type { PublicMovieListItem } from '@/lib/movies-public';

/** Phim bộ: nhiều tập hoặc đang chiếu dài tập */
export function isSeriesMovie(m: PublicMovieListItem): boolean {
    if ((m.status || '').toLowerCase() === 'ongoing') return true;
    const tot = String(m.episode_total || '').trim();
    const digits = tot.replace(/[^\d]/g, '');
    const n = digits ? parseInt(digits, 10) : 0;
    if (n > 1) return true;
    if (/tập/i.test(tot)) return true;
    const cur = m.episode_current || '';
    if (/\d+\s*\/\s*\d+/.test(cur)) return true;
    if ((m.episodes?.length ?? 0) > 1) return true;
    return false;
}

/**
 * Phim bộ (series): đang chiếu, trailer, hoặc đã hoàn thành dạng nhiều tập.
 * Loại phim lẻ (completed, 1 tập / Full đơn).
 */
export function isPhimBo(m: PublicMovieListItem): boolean {
    const s = (m.status || '').toLowerCase();
    if (s === 'ongoing') return true;
    if (s === 'trailer') return isSeriesMovie(m);
    if (s === 'completed') return isSeriesMovie(m);
    return false;
}

/** Phim lẻ: hoàn thành / trailer dạng một tập (không phải series nhiều tập). */
export function isPhimLe(m: PublicMovieListItem): boolean {
    const s = (m.status || '').toLowerCase();
    if (s === 'completed' && !isSeriesMovie(m)) return true;
    if (s === 'trailer' && !isSeriesMovie(m)) return true;
    return false;
}

function categoryStrings(m: PublicMovieListItem): string[] {
    return (m.categories || []).map((c) => String(c).trim().toLowerCase()).filter(Boolean);
}

/** Theo thẻ categories (cần API gán thể loại). */
export function isPhimChieuRap(m: PublicMovieListItem): boolean {
    return categoryStrings(m).some(
        (c) =>
            /chiếu\s*rạp|chieu\s*rap|rạp\s*chiếu/.test(c) ||
            c.includes('theatrical') ||
            c === 'cinema',
    );
}

export function isHoatHinh(m: PublicMovieListItem): boolean {
    return categoryStrings(m).some(
        (c) =>
            /hoạt\s*hình|hoat\s*hinh/.test(c) ||
            c.includes('animation') ||
            c.includes('anime') ||
            c.includes('cartoon'),
    );
}

export function isTvShow(m: PublicMovieListItem): boolean {
    return categoryStrings(m).some(
        (c) =>
            /tv\s*show|tvshow|tv\s*series/.test(c) ||
            c.includes('truyền hình') ||
            c === 'tv',
    );
}

export type HomeSections = {
    /** Đang chiếu — status ongoing */
    phimBo: PublicMovieListItem[];
    /** Đã hoàn tất — completed + dạng series */
    hoanTat: PublicMovieListItem[];
    /** Phim lẻ — completed, không phải series nhiều tập */
    phimLe: PublicMovieListItem[];
    /** Sắp chiếu — trailer */
    sapChieu: PublicMovieListItem[];
    /** Mới cập nhật — sắp updated_at */
    moiCapNhat: PublicMovieListItem[];
};

export function partitionMoviesForHome(list: PublicMovieListItem[]): HomeSections {
    const phimBo = list.filter((m) => (m.status || '').toLowerCase() === 'ongoing');
    const completed = list.filter((m) => (m.status || '').toLowerCase() === 'completed');
    const hoanTat = completed.filter((m) => isSeriesMovie(m));
    const phimLe = completed.filter((m) => !isSeriesMovie(m));
    const sapChieu = list.filter((m) => (m.status || '').toLowerCase() === 'trailer');

    const byUpdated = [...list].sort((a, b) => {
        const ta = new Date(a.updated_at || a.created_at || 0).getTime();
        const tb = new Date(b.updated_at || b.created_at || 0).getTime();
        return tb - ta;
    });
    const seen = new Set<number>();
    const moiCapNhat: PublicMovieListItem[] = [];
    for (const m of byUpdated) {
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        moiCapNhat.push(m);
        if (moiCapNhat.length >= 12) break;
    }

    return { phimBo, hoanTat, phimLe, sapChieu, moiCapNhat };
}
