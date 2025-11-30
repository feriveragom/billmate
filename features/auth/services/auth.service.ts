import RepositoryFactory from '@/core/infrastructure/RepositoryFactory';
import { adminDb } from '@/lib/firebase/admin';

export class AuthService {
    async logAuthEvent(userId: string, userEmail: string, action: 'LOGIN' | 'LOGOUT', metadata?: any) {
        try {
            const auditLogRepo = RepositoryFactory.getAuditLogRepository();
            await auditLogRepo.create({
                userId,
                action,
                targetId: userId,
                details: `${action} for ${userEmail}`,
                ipAddress: metadata?.browser || 'unknown'
            });
        } catch (error) {
            console.error('[AuthService] Error logging event:', error);
        }
        return { success: true };
    }

    async getUserProfileAndPermissions(userId: string) {
        try {
            const userRepo = RepositoryFactory.getUserRepository();
            const roleRepo = RepositoryFactory.getRoleRepository();

            // 1. Buscar usuario en Firestore
            let user = await userRepo.getById(userId);

            // 2. Si no existe, obtener datos de Firebase Auth y crear con FREE_USER
            if (!user) {
                console.log(`[AuthService] Usuario ${userId} no encontrado. Creando nuevo usuario con rol FREE_USER...`);

                // Obtener datos básicos de Firebase Auth
                const admin = await import('firebase-admin');
                const authUser = await admin.auth().getUser(userId);

                // Crear usuario en Firestore
                await adminDb.collection('users').doc(userId).set({
                    email: authUser.email,
                    fullName: authUser.displayName || 'Usuario',
                    avatarUrl: authUser.photoURL || '',
                    roleId: 'FREE_USER',
                    isActive: true,
                    createdAt: new Date(),
                    lastLogin: new Date()
                });

                // Volver a consultar
                user = await userRepo.getById(userId);
            } else {
                // Actualizar lastLogin
                await adminDb.collection('users').doc(userId).update({
                    lastLogin: new Date()
                });
            }

            if (!user) {
                throw new Error('Error creando usuario');
            }

            // 3. Obtener permisos del rol
            const roles = await roleRepo.getAllWithPermissions();
            const userRole = roles.find(r => r.id === user!.roleId);
            const permissions = userRole?.permissions || [];

            return {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                role: user.roleId,
                isBanned: user.isBanned,
                permissions,
                createdAt: user.createdAt
            };
        } catch (error) {
            console.error('[AuthService] Error getting user profile:', error);
            throw error;
        }
    }
}

export const authService = new AuthService();

