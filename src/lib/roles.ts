export type UserRole = string | null | undefined;

export function isAdminRole(role: UserRole): boolean {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

