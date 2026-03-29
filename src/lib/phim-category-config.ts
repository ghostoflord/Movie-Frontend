import type { PublicMovieListItem } from '@/lib/movies-public';
import {
    isHoatHinh,
    isPhimBo,
    isPhimChieuRap,
    isPhimLe,
    isTvShow,
} from '@/lib/home-movie-sections';

export type PhimCategorySlug = 'phim-bo' | 'phim-le' | 'phim-chieu-rap' | 'hoat-hinh' | 'tv-shows';

export type PhimCategoryDefinition = {
    title: string;
    breadcrumbLabel: string;
    emptyMessage: string;
    predicate: (m: PublicMovieListItem) => boolean;
};

export const PHIM_CATEGORY_CONFIG: Record<PhimCategorySlug, PhimCategoryDefinition> = {
    'phim-bo': {
        title: 'Phim bộ',
        breadcrumbLabel: 'Phim bộ',
        emptyMessage:
            'Không có phim bộ phù hợp (hoặc API chưa trả đủ dữ liệu thể loại / quốc gia).',
        predicate: isPhimBo,
    },
    'phim-le': {
        title: 'Phim lẻ',
        breadcrumbLabel: 'Phim lẻ',
        emptyMessage:
            'Không có phim lẻ phù hợp. Phim lẻ nhận diện theo trạng thái hoàn thành / trailer (một tập).',
        predicate: isPhimLe,
    },
    'phim-chieu-rap': {
        title: 'Phim chiếu rạp',
        breadcrumbLabel: 'Phim chiếu rạp',
        emptyMessage:
            'Chưa có phim chiếu rạp trong danh sách (cần gán thể loại tương ứng trong API, vd. «Chiếu rạp»).',
        predicate: isPhimChieuRap,
    },
    'hoat-hinh': {
        title: 'Hoạt hình',
        breadcrumbLabel: 'Hoạt hình',
        emptyMessage:
            'Chưa có phim hoạt hình (cần trường categories chứa Hoạt hình / Animation / Anime).',
        predicate: isHoatHinh,
    },
    'tv-shows': {
        title: 'TV Shows',
        breadcrumbLabel: 'TV Shows',
        emptyMessage:
            'Chưa có TV Shows (cần categories chứa TV Show / TV).',
        predicate: isTvShow,
    },
};
