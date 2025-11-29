'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene todos los usuarios utilizando el Service Role Key
 * Esto evita los problemas de recursión de RLS y asegura acceso total
 * Solo debe ser llamado desde componentes protegidos por rol de Admin
 */
export async function getAdminUsers() {
    try {
        // 1. Verificar seguridad: El usuario que llama debe ser ADMIN o SUPER_ADMIN
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('No autenticado');
        }

        // Verificar rol en la DB (usando el cliente normal, si falla RLS aquí, es otro tema, 
        // pero para leer el propio perfil usualmente no hay recursión si la política es simple "auth.uid() = id")
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
            throw new Error('No autorizado');
        }

        // 2. Obtener usuarios con privilegios de administrador (Service Role)
        const adminClient = createAdminClient();
        const { data: users, error } = await adminClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, data: users };
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualiza el estado (ban/unban) de un usuario
 */
export async function toggleUserStatus(userId: string, isActive: boolean) {
    try {
        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('profiles')
            .update({ is_active: isActive })
            .eq('id', userId);

        if (error) throw error;

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
        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) throw error;

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
