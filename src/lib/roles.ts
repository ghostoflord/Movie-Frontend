export type UserRole = string | null | undefined;

export function isAdminRole(role: UserRole): boolean {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isVipRole(role: UserRole): boolean {
    return role === 'VIP';
}

/** Chỉ VIP hoặc admin mới được dùng tính năng tiếp tục xem. */
export function canUseContinueWatching(role: UserRole): boolean {
    return isVipRole(role) || isAdminRole(role);
}

