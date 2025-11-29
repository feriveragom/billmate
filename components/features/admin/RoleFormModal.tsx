'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Check, X, Shield, Info, Lock } from 'lucide-react';
import type { Role, Permission } from '@/core/domain/entities';
import { toast } from 'sonner';
import { createRole, updateRole } from '@/app/admin/roles/actions';

interface RoleWithPermissions extends Role {
    permission_codes: string[];
}

interface RoleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: RoleWithPermissions | null;
    allPermissions: Permission[];
    onSuccess: () => void;
}

export default function RoleFormModal({
    isOpen,
    onClose,
    initialData,
    allPermissions,
    onSuccess
}: RoleFormModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        label: '',
        description: ''
    });
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inicializar datos cuando se abre el modal o cambia initialData
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    label: initialData.label,
                    description: initialData.description
                });
                setSelectedPermissions(new Set(initialData.permission_codes));
            } else {
                // Reset para nuevo rol
                setFormData({
                    name: '',
                    label: '',
                    description: ''
                });
                setSelectedPermissions(new Set());
            }
        }
    }, [isOpen, initialData]);

    const isPermissionDisabled = (roleName: string, permission: Permission) => {
        // 1. Super Admin & Admin -> Bloqueo Total
        // Los administradores heredan todo automáticamente, no se les pueden quitar permisos individuales.
        if (roleName === 'SUPER_ADMIN' || roleName === 'ADMIN') return true;

        // 2. Resto de Roles (FREE_USER, PREMIUM_USER, Roles Custom) -> LIBRE
        // La decisión de qué permisos asignar es completamente del administrador.
        // No hay bloqueos hardcoded aquí.
        return false;
    };

    const togglePermission = (code: string, permission: Permission) => {
        if (isPermissionDisabled(formData.name, permission)) return;

        const newSet = new Set(selectedPermissions);
        if (newSet.has(code)) {
            newSet.delete(code);
        } else {
            newSet.add(code);
        }
        setSelectedPermissions(newSet);
    };

    const toggleModule = (modulePermissions: Permission[]) => {
        // Solo considerar permisos que NO están deshabilitados para este rol
        const availablePermissions = modulePermissions.filter(p => !isPermissionDisabled(formData.name, p));

        if (availablePermissions.length === 0) return; // Nada que toggles

        const allSelected = availablePermissions.every(p => selectedPermissions.has(p.code));
        const newSet = new Set(selectedPermissions);

        availablePermissions.forEach(p => {
            if (allSelected) {
                newSet.delete(p.code);
            } else {
                newSet.add(p.code);
            }
        });

        setSelectedPermissions(newSet);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const permissionCodes = Array.from(selectedPermissions);

            if (initialData) {
                // Actualizar rol existente
                const result = await updateRole(initialData.id, {
                    label: formData.label,
                    description: formData.description,
                    permissionCodes
                });

                if (!result.success) throw new Error(result.error);
                toast.success('Rol actualizado correctamente');
            } else {
                // Crear nuevo rol
                const result = await createRole({
                    name: formData.name.toUpperCase().replace(/\s+/g, '_'),
                    label: formData.label,
                    description: formData.description,
                    permissionCodes
                });

                if (!result.success) throw new Error(result.error);
                toast.success('Rol creado correctamente');
            }

            onSuccess();
            onClose();

        } catch (err: any) {
            console.error('Error guardando rol:', err);
            toast.error(err.message || 'Error al guardar el rol');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Agrupar permisos por módulo para la vista
    const permissionsByModule = allPermissions.reduce((acc, permission) => {
        if (!acc[permission.module]) acc[permission.module] = [];
        acc[permission.module].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Editar Rol' : 'Nuevo Rol'}
        >
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                {/* Campos Básicos */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-foreground/80">Nombre (Código)</label>
                            <input
                                type="text"
                                required
                                disabled={!!initialData} // El código no se edita una vez creado para mantener consistencia
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="EJ: VENTAS_MANAGER"
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                            />
                            {!initialData && <p className="text-xs text-foreground/40 mt-1">Se convertirá a mayúsculas automáticamente.</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-foreground/80">Etiqueta Visible</label>
                            <input
                                type="text"
                                required
                                value={formData.label}
                                onChange={e => setFormData({ ...formData, label: e.target.value })}
                                placeholder="Ej: Gerente de Ventas"
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground/80">Descripción</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 resize-none"
                        />
                    </div>
                </div>

                {/* Matriz de Permisos */}
                <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-foreground/70">
                            Asignar Permisos
                        </h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {selectedPermissions.size} seleccionados
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {Object.entries(permissionsByModule).map(([module, permissions]) => {
                            const allSelected = permissions.every(p => selectedPermissions.has(p.code));
                            const someSelected = permissions.some(p => selectedPermissions.has(p.code));
                            const isProtectedRole = formData.name === 'SUPER_ADMIN' || formData.name === 'ADMIN';

                            // Verificar si TODOS los permisos del módulo están deshabilitados para este rol
                            const isModuleDisabled = permissions.every(p => isPermissionDisabled(formData.name, p));

                            return (
                                <div key={module} className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden ${isModuleDisabled ? 'opacity-50' : ''}`}>
                                    {/* Header del Módulo */}
                                    <div
                                        className={`px-4 py-3 flex items-center justify-between transition ${isProtectedRole || isModuleDisabled ? 'opacity-50 cursor-not-allowed bg-white/5' : 'cursor-pointer hover:bg-foreground/10 bg-foreground/5'}`}
                                        onClick={() => !isProtectedRole && !isModuleDisabled && toggleModule(permissions)}
                                    >
                                        <span className="font-bold text-sm text-primary flex items-center gap-2">
                                            {module}
                                            {isModuleDisabled && !isProtectedRole && <Lock size={12} className="text-foreground/40" />}
                                        </span>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${allSelected ? 'bg-primary border-primary text-white' :
                                                someSelected ? 'bg-primary/50 border-primary text-white' :
                                                    'border-foreground/20 bg-background'
                                            }`}>
                                            {allSelected && <Check size={14} />}
                                            {!allSelected && someSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>

                                    {/* Lista de Permisos */}
                                    <div className="p-2 space-y-1">
                                        {permissions.map(permission => {
                                            const isSelected = selectedPermissions.has(permission.code);
                                            const isDisabled = isPermissionDisabled(formData.name, permission);

                                            return (
                                                <div
                                                    key={permission.id}
                                                    onClick={() => !isProtectedRole && togglePermission(permission.code, permission)}
                                                    className={`flex items-center gap-3 p-2 rounded-lg transition ${isProtectedRole || isDisabled ? 'cursor-not-allowed opacity-50 bg-foreground/5' : 'cursor-pointer hover:bg-foreground/5'
                                                        } ${isSelected ? 'bg-primary/10 border border-primary/20' : 'border border-transparent'}`}
                                                >
                                                    <div className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition ${isSelected ? 'bg-primary border-primary text-white' : 'border-foreground/30 bg-background'
                                                        }`}>
                                                        {isSelected && <Check size={10} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-foreground/70'} flex items-center gap-2`}>
                                                            {permission.description}
                                                            {isDisabled && !isProtectedRole && <Lock size={10} className="text-foreground/40" />}
                                                        </p>
                                                        <p className="text-[10px] font-mono text-foreground/30">
                                                            {permission.code}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-white/5 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Guardando...' : (initialData ? 'Actualizar Rol' : 'Crear Rol')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

