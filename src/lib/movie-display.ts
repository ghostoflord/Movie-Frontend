/** Bỏ thẻ HTML trong description từ API */
export function stripHtml(html: string | null | undefined): string {
    if (html == null || html === '') return '';
    if (typeof window === 'undefined') {
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    const d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || d.innerText || '').replace(/\s+/g, ' ').trim();
}

export function formatCategories(categories: unknown): string[] {
    if (categories == null) return [];
    if (Array.isArray(categories)) {
        return categories.filter((c) => c != null && String(c).trim() !== '').map(String);
    }
    return [];
}

/** actors / directors: mảng string hoặc null */
export function formatPeopleList(people: unknown): string {
    if (people == null) return '';
    if (Array.isArray(people)) {
        const parts = people.filter((p) => p != null && String(p).trim() !== '').map(String);
        return parts.length ? parts.join(', ') : '';
    }
    return String(people);
}

export function formatDateVi(iso: string | undefined): string {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}
