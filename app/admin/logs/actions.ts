'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import RepositoryFactory from '@/core/infrastructure/RepositoryFactory';

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

        const auditLogRepository = RepositoryFactory.getAuditLogRepository();

        // Aplicar filtros básicos del repositorio
        const basicFilters: { userId?: string; action?: string } = {};

        if (filters?.userId && filters.userId !== 'all') {
            basicFilters.userId = filters.userId;
        }

        if (filters?.actionType && filters.actionType !== 'all') {
            basicFilters.action = filters.actionType;
        }

        let logs = await auditLogRepository.getAll(basicFilters);

        // Filtros de fecha en memoria (o podríamos agregarlos a la interfaz del repositorio)
        if (filters?.startDate) {
            const startDateTime = new Date(`${filters.startDate}T00:00:00-05:00`);
            logs = logs.filter(log => new Date(log.createdAt) >= startDateTime);
        }

        if (filters?.endDate) {
            const endDateTime = new Date(`${filters.endDate}T23:59:59-05:00`);
            logs = logs.filter(log => new Date(log.createdAt) <= endDateTime);
        }

        // Map to expected format for frontend
        const formattedLogs = logs.map(log => ({
            id: log.id,
            user_id: log.userId,
            action_type: log.action,
            action_description: log.details,
            ip_address: log.ipAddress,
            created_at: log.createdAt
        }));

        return { success: true, data: formattedLogs };
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

        const userRepository = RepositoryFactory.getUserRepository();
        const users = await userRepository.getAll();

        const formattedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.fullName
        }));

        return { success: true, data: formattedUsers };
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

        const auditLogRepository = RepositoryFactory.getAuditLogRepository();
        await auditLogRepository.delete(logId);

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

        const auditLogRepository = RepositoryFactory.getAuditLogRepository();
        await auditLogRepository.deleteMany(logIds);

        revalidatePath('/admin/logs');
        return { success: true, count: logIds.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
