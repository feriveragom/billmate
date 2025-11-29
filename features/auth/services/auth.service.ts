import { User } from '@/core/auth/auth-provider'; // Or define a Domain Entity

export class AuthService {
    async logAuthEvent(userId: string, userEmail: string, action: 'LOGIN' | 'LOGOUT', metadata?: any) {
        console.log(`[MOCK] AuthService.logAuthEvent: ${action} for ${userEmail}`);
        return { success: true };
    }

    async getUserProfileAndPermissions(userId: string) {
        console.log(`[MOCK] AuthService.getUserProfileAndPermissions for ${userId}`);

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
}

export const authService = new AuthService();
