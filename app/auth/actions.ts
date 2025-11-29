'use server';

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Registra eventos de autenticación (LOGIN/LOGOUT)
 * Usa admin client para evitar problemas de RLS
 */
export async function logAuthEvent(
    userId: string,
    userEmail: string,
    action: 'LOGIN' | 'LOGOUT',
    metadata?: any
) {
    try {
        const adminClient = createAdminClient();

        await adminClient.rpc('log_audit_event', {
            p_user_id: userId,
            p_user_email: userEmail,
            p_action_type: action,
            p_action_category: 'AUTH',
            p_action_description: action === 'LOGIN' ? 'Inicio de sesión exitoso' : 'Cierre de sesión voluntario',
            p_metadata: metadata || {}
        });

        return { success: true };
    } catch (error: any) {
        console.error(`Error registrando log ${action}:`, error);
        return { success: false, error: error.message };
    }
}
