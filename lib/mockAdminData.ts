import { Role, Permission, UserProfile, AuditLog } from '../core/domain/entities';

export const mockPermissions: Permission[] = [
    // CORE
    { id: 'p1', code: 'service.create', description: 'Crear servicios', module: 'CORE' },
    { id: 'p2', code: 'service.view', description: 'Ver servicios propios', module: 'CORE' },
    { id: 'p3', code: 'service.edit', description: 'Editar servicios propios', module: 'CORE' },
    { id: 'p4', code: 'service.delete', description: 'Eliminar servicios propios', module: 'CORE' },

    // ADMIN
    { id: 'p5', code: 'admin.access', description: 'Acceder al panel de admin', module: 'ADMIN' },
    { id: 'p6', code: 'admin.users.manage', description: 'Gestionar usuarios (ban/promover)', module: 'ADMIN' },
    { id: 'p7', code: 'admin.roles.manage', description: 'Gestionar roles y permisos', module: 'ADMIN' },
    { id: 'p8', code: 'admin.logs.view', description: 'Ver logs de auditoría', module: 'ADMIN' },

    // PREMIUM
    { id: 'p9', code: 'premium.features', description: 'Acceso a funciones premium', module: 'CORE' },
];

export const mockRoles: Role[] = [
    {
        id: 'role-super-admin',
        name: 'SUPER_ADMIN',
        label: 'Super Administrador',
        description: 'Control total del sistema y gestión de admins',
        permissions: mockPermissions.map(p => p.code),
        isSystemRole: true
    },
    {
        id: 'role-admin',
        name: 'ADMIN',
        label: 'Administrador',
        description: 'Gestión de usuarios y soporte',
        permissions: mockPermissions.map(p => p.code), // Todos los permisos igual que SUPER_ADMIN
        isSystemRole: true
    },
    {
        id: 'role-premium',
        name: 'PREMIUM_USER',
        label: 'Usuario Premium',
        description: 'Acceso ilimitado a funcionalidades avanzadas',
        permissions: ['service.create', 'service.view', 'service.edit', 'service.delete', 'premium.features'],
        isSystemRole: true
    },
    {
        id: 'role-free',
        name: 'FREE_USER',
        label: 'Usuario Gratuito',
        description: 'Acceso estándar con límites de uso',
        permissions: ['service.create', 'service.view', 'service.edit', 'service.delete'],
        isSystemRole: true
    }
];

export const mockUsers: UserProfile[] = [
    {
        id: 'user-123-mock', // El usuario actual
        email: 'admin@billmate.app',
        fullName: 'Admin User',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        roleId: 'role-super-admin',
        isBanned: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastLogin: new Date().toISOString()
    },
    {
        id: 'user-456-pepe',
        email: 'pepe@gmail.com',
        fullName: 'Pepe Usuario',
        roleId: 'role-free',
        isBanned: false,
        createdAt: '2025-02-15T10:00:00Z',
        lastLogin: '2025-11-20T15:30:00Z'
    },
    {
        id: 'user-789-banned',
        email: 'spammer@bad.com',
        fullName: 'Spammer Malo',
        roleId: 'role-free',
        isBanned: true,
        createdAt: '2025-03-01T09:00:00Z'
    }
];

export const mockAuditLogs: AuditLog[] = [
    {
        id: 'log-1',
        userId: 'user-123-mock',
        action: 'LOGIN',
        details: 'Inicio de sesión exitoso',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() // Hace 1 hora
    },
    {
        id: 'log-2',
        userId: 'user-123-mock',
        action: 'ROLE_UPDATE',
        targetId: 'user-456-pepe',
        details: 'Cambio de rol de GUEST a FREE_USER',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // Ayer
    }
];
