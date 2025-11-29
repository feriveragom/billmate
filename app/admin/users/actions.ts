'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import RepositoryFactory from '@/core/infrastructure/RepositoryFactory';

/**
 * Verifica que el usuario autenticado sea ADMIN o SUPER_ADMIN
 */
async function verifyAdminAccess() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('No autenticado');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
        throw new Error('No autorizado');
    }

    return user.id;
}

/**
 * Obtiene todos los usuarios
 */
export async function getAdminUsers() {
    try {
        await verifyAdminAccess();

        const userRepository = RepositoryFactory.getUserRepository();
        const users = await userRepository.getAll();

        // Map UserProfile to expected format
        const formattedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.fullName,
            avatar_url: user.avatarUrl,
            role: user.roleId,
            is_active: !user.isBanned,
            created_at: user.createdAt
        }));

        return { success: true, data: formattedUsers };
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualiza el estado de un usuario
 */
export async function toggleUserStatus(userId: string, isActive: boolean) {
    try {
        await verifyAdminAccess();

        const userRepository = RepositoryFactory.getUserRepository();
        await userRepository.updateStatus(userId, isActive);

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Actualiza el rol de un usuario
 */
export async function updateUserRole(userId: string, newRole: string) {
    try {
        await verifyAdminAccess();

        const userRepository = RepositoryFactory.getUserRepository();
        await userRepository.updateRole(userId, newRole);

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
