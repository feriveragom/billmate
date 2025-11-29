'use server';

import { revalidatePath } from 'next/cache';
// import RepositoryFactory from '@/core/infrastructure/RepositoryFactory';

/**
 * Verifica que el usuario sea SUPER_ADMIN (único con acceso a logs)
 * TODO: Implementar verificación real de sesión con Firebase Admin
 */
async function verifySuperAdmin() {
    // TEMPORAL: Bypass de auth hasta que implementemos cookies de sesión
    // En producción, aquí verificaríamos el session cookie o token.
    return "temp-admin-id"; 
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
    console.log("[MOCK] getAuditLogs", filters);
    const mockLogs = [
        {
            id: '1',
            user_id: '1',
            user_email: 'mock@example.com',
            action_type: 'LOGIN',
            action_description: 'Inicio de sesión exitoso',
            ip_address: '127.0.0.1',
            created_at: new Date().toISOString()
        }
    ];
    return { success: true, data: mockLogs };
}

/**
 * Obtiene todos los usuarios (para el filtro de logs)
 */
export async function getUsersForFilter() {
    console.log("[MOCK] getUsersForFilter");
    const mockUsers = [
        {
            id: '1',
            email: 'mock@example.com',
            full_name: 'Mock User'
        }
    ];
    return { success: true, data: mockUsers };
}

/**
 * Elimina un log específico
 */
export async function deleteAuditLog(logId: string) {
    console.log(`[MOCK] deleteAuditLog ${logId}`);
    revalidatePath('/admin/logs');
    return { success: true };
}

/**
 * Elimina múltiples logs
 */
export async function deleteMultipleAuditLogs(logIds: string[]) {
    console.log(`[MOCK] deleteMultipleAuditLogs ${logIds.length}`);
    revalidatePath('/admin/logs');
    return { success: true, count: logIds.length };
}
