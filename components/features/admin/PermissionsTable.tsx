'use client';

import { useState, useEffect, useCallback } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import PermissionFormModal from './PermissionFormModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Permission } from '@/core/domain/entities';
import { toast } from 'sonner';
import { useAuth } from '@/components/features/auth/AuthProvider';
import { getPermissions } from '@/app/admin/roles/actions';

export default function PermissionsTable() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

    const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { checkPermission } = useAuth();
    const canManageRoles = checkPermission('admin.roles.manage');

    const fetchPermissions = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getPermissions();

            if (result.success && result.data) {
                setPermissions(result.data);
            } else {
                console.error('Error fetching permissions:', result.error);
                toast.error('Error al cargar permisos');
            }
        } catch (err) {
            console.error('Error fetching permissions:', err);
            toast.error('Error al cargar permisos');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const handleCreate = () => {
        setSelectedPermission(null);
        setIsModalOpen(true);
    };

    const handleEdit = (permission: Permission) => {
        setSelectedPermission(permission);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (permission: Permission) => {
        setPermissionToDelete(permission);
    };

    const handleConfirmDelete = async () => {
        if (!permissionToDelete) return;

        setIsDeleting(true);
        try {
            const { deletePermission } = await import('@/app/admin/roles/actions');
            const result = await deletePermission(permissionToDelete.id);

            if (!result.success) throw new Error(result.error);

            toast.success(`Permiso ${permissionToDelete.code} eliminado`);
            fetchPermissions();
        } catch (err: any) {
            console.error('Error deleting permission:', err);
            toast.error('No se pudo eliminar: ' + err.message);
        } finally {
            setIsDeleting(false);
            setPermissionToDelete(null);
        }
    };

    const getModuleColor = (module: string) => {
        switch (module) {
            case 'CORE': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'ADMIN': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'SOCIAL': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
            case 'ECOMMERCE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-white/5 text-foreground/60 border-white/10';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestión de Permisos</h2>
                <button
                    onClick={handleCreate}
                    disabled={!canManageRoles}
                    className={`px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition flex items-center gap-2 ${!canManageRoles ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                >
                    <Plus size={18} />
                    Nuevo Permiso
                </button>
            </div>

            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5 text-sm text-foreground/60">
                                <th className="p-4 font-medium">Código</th>
                                <th className="p-4 font-medium">Descripción</th>
                                <th className="p-4 font-medium">Módulo</th>
                                <th className="p-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-foreground/40">
                                        Cargando permisos...
                                    </td>
                                </tr>
                            ) : permissions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-foreground/40">
                                        No hay permisos registrados.
                                    </td>
                                </tr>
                            ) : (
                                permissions.map((permission) => (
                                    <tr key={permission.id} className="hover:bg-white/5 transition group">
                                        <td className="p-4 font-mono text-foreground/80">
                                            {permission.code}
                                        </td>
                                        <td className="p-4 text-foreground/70">
                                            {permission.description}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getModuleColor(permission.module)}`}>
                                                {permission.module}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {canManageRoles && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(permission)}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-primary transition"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        {permission.code !== 'admin.access' ? (
                                                            <button
                                                                onClick={() => handleDeleteClick(permission)}
                                                                className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        ) : (
                                                            <div className="p-2 opacity-30 cursor-not-allowed" title="Permiso protegido">
                                                                <Trash2 size={16} />
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PermissionFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchPermissions}
                initialData={selectedPermission}
            />

            <ConfirmDialog
                isOpen={!!permissionToDelete}
                onCancel={() => setPermissionToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="¿Eliminar permiso?"
                message={`Estás a punto de eliminar permanentemente el permiso "${permissionToDelete?.code}". Esto afectará a todos los roles que lo usen.`}
                confirmText={isDeleting ? "Eliminando..." : "Sí, eliminar"}
                type="warning"
            />
        </div>
    );
}
