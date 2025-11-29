'use server';

import { revalidatePath } from 'next/cache';
// import RepositoryFactory from '@/core/infrastructure/RepositoryFactory';

/**
 * Verifica que el usuario autenticado sea ADMIN o SUPER_ADMIN
 * TODO: Implementar verificación real con Firebase Admin
 */
async function verifyAdminAccess() {
    // TEMPORAL: Bypass de auth
    return "temp-admin-id";
}

/**
 * Obtiene todos los usuarios
 */
export async function getAdminUsers() {
    console.log("[MOCK] getAdminUsers");
    const mockUsers = [
        {
            id: '1',
            email: 'mock@example.com',
            full_name: 'Mock User',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            role: 'SUPER_ADMIN',
            is_active: true,
            created_at: new Date().toISOString()
        }
    ];
    return { success: true, data: mockUsers };
}

/**
 * Actualiza el estado de un usuario
 */
export async function toggleUserStatus(userId: string, isActive: boolean) {
    console.log(`[MOCK] toggleUserStatus ${userId} to ${isActive}`);
    revalidatePath('/admin/users');
    return { success: true };
}

/**
 * Actualiza el rol de un usuario
 */
export async function updateUserRole(userId: string, newRole: string) {
    console.log(`[MOCK] updateUserRole ${userId} to ${newRole}`);
    revalidatePath('/admin/users');
    return { success: true };
}
