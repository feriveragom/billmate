'use server';

import { authService } from './services/auth.service';

/**
 * Registra eventos de autenticación (LOGIN/LOGOUT)
 */
export async function logAuthEvent(
    userId: string,
    userEmail: string,
    action: 'LOGIN' | 'LOGOUT',
    metadata?: any
) {
    return await authService.logAuthEvent(userId, userEmail, action, metadata);
}

/**
 * Obtiene el perfil del usuario y sus permisos
 * Usado por AuthProvider para hidratar la sesión
 */
export async function getUserProfileAndPermissions(userId: string) {
    return await authService.getUserProfileAndPermissions(userId);
}

