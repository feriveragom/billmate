
export type RoleType = 'FREE_USER' | 'PREMIUM_USER' | 'ADMIN' | 'SUPER_ADMIN' | string;

export interface Permission {
    id: string;
    code: string; // ej: 'service.create'
    description: string;
    module: 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN';
}

export interface Role {
    id: string;
    name: RoleType;
    label: string; // Nombre legible ej: "Super Administrador"
    description: string;
    permissions: string[]; // Array de Permission.code
    isSystemRole: boolean; // Si es true, no se puede borrar
}

export interface UserProfile {
    id: string; // Vinculado al auth.uid
    email: string;
    fullName: string;
    avatarUrl?: string;
    roleId: string;
    isBanned: boolean;
    createdAt: string;
    lastLogin?: string;
}

export interface AuditLog {
    id: string;
    userId: string;
    action: string; // ej: 'USER_PROMOTED'
    targetId?: string; // ID del objeto afectado
    details: string; // JSON stringified o texto
    ipAddress?: string;
    createdAt: string;
}
