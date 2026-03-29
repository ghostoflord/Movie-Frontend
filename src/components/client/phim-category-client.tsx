'use client';

import CategoryMoviesView from '@/components/client/category-movies-view';
import { PHIM_CATEGORY_CONFIG, type PhimCategorySlug } from '@/lib/phim-category-config';

export function PhimCategoryClient({ slug }: { slug: PhimCategorySlug }) {
    const c = PHIM_CATEGORY_CONFIG[slug];
    return (
        <CategoryMoviesView
            pathSegment={slug}
            title={c.title}
            breadcrumbLabel={c.breadcrumbLabel}
            emptyMessage={c.emptyMessage}
            predicate={c.predicate}
        />
    );
}
