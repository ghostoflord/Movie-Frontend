/** Laravel thường bọc `{ data: T }`, một số endpoint trả thẳng `T` */
export function unwrapData<T>(res: T | { data: T } | null | undefined): T | null {
    if (res == null) return null;
    if (typeof res === 'object' && res !== null && 'data' in res) {
        const inner = (res as { data: T }).data;
        return inner ?? null;
    }
    return res as T;
}
