'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Verifica que el usuario sea SUPER_ADMIN (único con acceso a logs)
 */
async function verifySuperAdmin() {
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

    if (!profile || profile.role !== 'SUPER_ADMIN') {
        throw new Error('No autorizado - Solo SUPER_ADMIN');
    }

    return user.id;
}

/**
 * Obtiene logs de auditoría con filtros opcionales
 */
export async function getAuditLogs(filters?: {
    userId?: string;
    actionType?: string;
    startDate?: string;
    endDate?: string;
}) {
    try {
        await verifySuperAdmin();

        const adminClient = createAdminClient();
        let query = adminClient
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.userId && filters.userId !== 'all') {
            query = query.eq('user_id', filters.userId);
        }

        if (filters?.actionType && filters.actionType !== 'all') {
            query = query.eq('action_type', filters.actionType);
        }

        if (filters?.startDate) {
            query = query.gte('created_at', `${filters.startDate}T00:00:00-05:00`);
        }

        if (filters?.endDate) {
            query = query.lte('created_at', `${filters.endDate}T23:59:59-05:00`);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error: any) {
        console.error('Error fetching audit logs:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene todos los usuarios (para el filtro de logs)
 */
export async function getUsersForFilter() {
    try {
        await verifySuperAdmin();

        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('profiles')
            .select('id, email, full_name')
            .order('email');

        if (error) throw error;

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Elimina un log específico
 */
export async function deleteAuditLog(logId: string) {
    try {
        await verifySuperAdmin();

        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('audit_logs')
            .delete()
            .eq('id', logId);

        if (error) throw error;

        revalidatePath('/admin/logs');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Elimina múltiples logs
 */
export async function deleteMultipleAuditLogs(logIds: string[]) {
    try {
        await verifySuperAdmin();

        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('audit_logs')
            .delete()
            .in('id', logIds);

        if (error) throw error;

        revalidatePath('/admin/logs');
        return { success: true, count: logIds.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
