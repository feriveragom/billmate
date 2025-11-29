'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, Check, X, Edit2, Plus, Key } from 'lucide-react';
import RoleFormModal from './RoleFormModal';
import PermissionFormModal from './PermissionFormModal';
import type { Role, Permission } from '@/core/domain/entities';
import { useAuth } from '@/components/features/auth/AuthProvider';
import { getRolesWithPermissions, getPermissions } from '@/app/admin/roles/actions';

interface RoleWithPermissions extends Role {
    permission_codes: string[];
}

export default function RolesGrid() {
    const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { checkPermission } = useAuth();

    const fetchRolesAndPermissions = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch permissions
            const permsResult = await getPermissions();
            if (permsResult.success && permsResult.data) {
                setPermissions(permsResult.data);
            } else {
                console.error('Error fetching permissions:', permsResult.error);
            }

            // Fetch roles
            const rolesResult = await getRolesWithPermissions();
            if (rolesResult.success && rolesResult.data) {
                setRoles(rolesResult.data);
            } else {
                console.error('Error fetching roles:', rolesResult.error);
            }
        } catch (err) {
            console.error('Error fetching roles and permissions:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRolesAndPermissions();
    }, [fetchRolesAndPermissions]);

    const handleCreateRole = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
    };

    const handleEditRole = (role: RoleWithPermissions) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        fetchRolesAndPermissions();
    };

    // Verificar si puede editar
    const canManageRoles = checkPermission('admin.roles.manage');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Roles y Permisos</h2>
                <button
                    onClick={handleCreateRole}
                    disabled={!canManageRoles}
                    className={`px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition flex items-center gap-2 ${!canManageRoles ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                >
                    <Plus size={18} />
                    Nuevo Rol
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    <div className="col-span-full p-12 text-center text-foreground/50">
                        <div className="animate-pulse flex flex-col items-center gap-4">
                            <div className="h-8 w-8 bg-white/10 rounded-full animate-spin"></div>
                            Cargando roles...
                        </div>
                    </div>
                ) : roles.map((role: RoleWithPermissions) => {
                    // Determinar color según rol
                    const roleColors = {
                        'SUPER_ADMIN': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
                        'ADMIN': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
                        'PREMIUM_USER': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
                        'FREE_USER': { bg: 'bg-white/5', text: 'text-foreground/70', border: 'border-white/10' }
                    };

                    const colors = roleColors[role.name as keyof typeof roleColors] ||
                        { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' }; // Color default para nuevos roles

                    const isProtected = role.name === 'SUPER_ADMIN';

                    return (
                        <div
                            key={role.id}
                            className={`bg-card border ${colors.border} p-6 rounded-2xl hover:border-primary/50 transition group relative flex flex-col`}
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
                            <p className="text-sm text-foreground/60 mb-4 flex-grow min-h-[40px]">{role.description}</p>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-sm mt-auto">
                                <span className="text-foreground/50 flex items-center gap-1">
                                    <Check size={14} />
                                    {role.permissions.length} permisos
                                </span>
                                {canManageRoles && (
                                    <button
                                        onClick={() => handleEditRole(role)}
                                        className="text-primary font-medium hover:text-primary/80 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition"
                                    >
                                        <Edit2 size={14} />
                                        Gestionar
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Edición/Creación de Rol */}
            <RoleFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={selectedRole}
                allPermissions={permissions}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
