'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, Lock, Check, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { Role, Permission } from '@/core/domain/entities';

interface RoleWithPermissions extends Role {
    permission_codes: string[];
}

export default function RolesGrid() {
    const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
    const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRolesAndPermissions = async () => {
            try {
                const supabase = createClient();

                // Fetch all permissions
                const { data: permsData } = await supabase
                    .from('permissions')
                    .select('*')
                    .order('module', { ascending: true });

                if (permsData) {
                    setPermissions(permsData.map(p => ({
                        id: p.id,
                        code: p.code,
                        description: p.description,
                        module: p.module as any
                    })));
                }

                // Fetch all roles with their permissions
                const { data: rolesData } = await supabase
                    .from('roles')
                    .select(`
                        id,
                        name,
                        label,
                        description,
                        is_system_role,
                        role_permissions (
                            permissions (
                                code
                            )
                        )
                    `)
                    .order('name', { ascending: true });

                if (rolesData) {
                    const formattedRoles: RoleWithPermissions[] = rolesData.map((r: any) => ({
                        id: r.id,
                        name: r.name,
                        label: r.label,
                        description: r.description,
                        isSystemRole: r.is_system_role,
                        permissions: r.role_permissions?.map((rp: any) => rp.permissions.code) || [],
                        permission_codes: r.role_permissions?.map((rp: any) => rp.permissions.code) || []
                    }));
                    setRoles(formattedRoles);
                }
            } catch (err) {
                console.error('Error fetching roles and permissions:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRolesAndPermissions();
    }, []);

    // Agrupar permisos por módulo
    const permissionsByModule = permissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
            acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    const handleViewDetails = (role: RoleWithPermissions) => {
        setSelectedRole(role);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Roles y Permisos</h2>
                <button className="px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 opacity-50 cursor-not-allowed" disabled>
                    + Nuevo Rol
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    <div className="col-span-full p-12 text-center text-foreground/50">
                        Cargando roles...
                    </div>
                ) : roles.map((role: RoleWithPermissions) => {
                    // Determinar color según rol
                    const roleColors = {
                        'SUPER_ADMIN': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
                        'ADMIN': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
                        'PREMIUM_USER': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
                        'FREE_USER': { bg: 'bg-white/5', text: 'text-foreground/70', border: 'border-white/10' }
                    };

                    const colors = roleColors[role.name as keyof typeof roleColors] || roleColors['FREE_USER'];
                    const isProtected = role.name === 'SUPER_ADMIN';

                    return (
                        <div
                            key={role.id}
                            className={`bg-card border ${colors.border} p-6 rounded-2xl hover:border-primary/50 transition group relative`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 ${colors.bg} rounded-xl ${colors.text}`}>
                                    {isProtected ? <Lock size={24} /> : <Shield size={24} />}
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    {role.isSystemRole && (
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-foreground/40 bg-white/5 px-2 py-1 rounded-md">
                                            Sistema
                                        </span>
                                    )}
                                    {isProtected && (
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">
                                            Protegido
                                        </span>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-1">{role.label}</h3>
                            <p className="text-sm text-foreground/60 mb-4 min-h-[40px]">{role.description}</p>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                                <span className="text-foreground/50">{role.permissions.length} permisos</span>
                                <button
                                    onClick={() => handleViewDetails(role)}
                                    className="text-primary font-medium hover:underline"
                                >
                                    Ver detalles
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Detalles */}
            <Modal
                isOpen={!!selectedRole}
                onClose={() => setSelectedRole(null)}
                title={selectedRole?.label || 'Detalles del Rol'}
            >
                <div className="space-y-6 pt-6">
                    {/* Información del Rol */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h3 className="font-bold text-lg mb-2">{selectedRole?.label}</h3>
                        <p className="text-sm text-foreground/60 mb-3">{selectedRole?.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                                {selectedRole?.name}
                            </span>
                            {selectedRole?.isSystemRole && (
                                <span className="px-2 py-1 bg-white/5 text-foreground/60 rounded-md font-medium">
                                    Rol de Sistema
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Permisos por Módulo */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-foreground/50">
                            Permisos ({selectedRole?.permissions.length} de {permissions.length})
                        </h4>

                        {Object.entries(permissionsByModule).map(([module, permissions]) => (
                            <div key={module} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <h5 className="font-bold text-sm mb-3 text-primary">{module}</h5>
                                <div className="space-y-2">
                                    {permissions.map(permission => {
                                        const hasPermission = selectedRole?.permissions.includes(permission.code);
                                        return (
                                            <div
                                                key={permission.id}
                                                className={`flex items-start gap-3 p-2 rounded-lg ${hasPermission ? 'bg-green-500/5' : 'bg-white/5'}`}
                                            >
                                                <div className={`flex-shrink-0 mt-0.5 ${hasPermission ? 'text-green-500' : 'text-foreground/30'}`}>
                                                    {hasPermission ? <Check size={16} /> : <X size={16} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${hasPermission ? 'text-foreground' : 'text-foreground/40'}`}>
                                                        {permission.description}
                                                    </p>
                                                    <p className={`text-xs font-mono ${hasPermission ? 'text-foreground/60' : 'text-foreground/30'}`}>
                                                        {permission.code}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
