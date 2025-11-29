'use server';

// import RepositoryFactory from '@/core/infrastructure/RepositoryFactory';

/**
 * Registra eventos de autenticación (LOGIN/LOGOUT)
 */
export async function logAuthEvent(
    userId: string,
    userEmail: string,
    action: 'LOGIN' | 'LOGOUT',
    metadata?: any
) {
    console.log(`[MOCK] logAuthEvent: ${action} for ${userEmail}`);
    return { success: true };
}

/**
 * Obtiene el perfil del usuario y sus permisos
 * Usado por AuthProvider para hidratar la sesión
 */
export async function getUserProfileAndPermissions(userId: string) {
    console.log(`[MOCK] getUserProfileAndPermissions for ${userId}`);
    
    // Mock Profile
    const mockProfile = {
        id: userId,
        email: 'mock@example.com',
        fullName: 'Mock User',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        roleId: 'SUPER_ADMIN',
        isBanned: false,
        createdAt: new Date().toISOString()
    };

    // Mock Permissions (Super Admin has all)
    const mockPermissions = [
        'admin.users.manage',
        'admin.roles.manage',
        'admin.logs.view',
        'service.create',
        'service.read',
        'service.update',
        'service.delete',
        'social.profile.view'
    ];

    return {
        ...mockProfile,
        role: mockProfile.roleId,
        permissions: mockPermissions
    };
}
