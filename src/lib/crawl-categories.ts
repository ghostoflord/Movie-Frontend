/** Thể loại từ GET /api/categories (label, slug, movies_count) — dùng cho crawl theo genre */
export type CrawlCategoryOption = {
    slug: string;
    label: string;
    movies_count?: number;
};

function unwrapCategoryList(raw: unknown): unknown[] {
    if (!raw || typeof raw !== 'object') return [];
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data;
    if (o.data && typeof o.data === 'object') {
        const inner = o.data as Record<string, unknown>;
        if (Array.isArray(inner.data)) return inner.data;
    }
    if (Array.isArray(raw)) return raw;
    return [];
}

export function parseCrawlCategories(raw: unknown): CrawlCategoryOption[] {
    return unwrapCategoryList(raw)
        .map((row): CrawlCategoryOption | null => {
            if (!row || typeof row !== 'object') return null;
            const o = row as Record<string, unknown>;
            const slug = typeof o.slug === 'string' ? o.slug.trim() : '';
            if (!slug) return null;
            const label =
                (typeof o.label === 'string' && o.label.trim()) ||
                (typeof o.name === 'string' && o.name.trim()) ||
                slug;
            const movies_count =
                o.movies_count != null && Number.isFinite(Number(o.movies_count))
                    ? Number(o.movies_count)
                    : undefined;
            return { slug, label, movies_count };
        })
        .filter((x): x is CrawlCategoryOption => Boolean(x))
        .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
}
