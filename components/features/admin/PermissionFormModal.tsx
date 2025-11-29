'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';
import type { Permission } from '@/core/domain/entities';
import { createPermission, updatePermission } from '@/app/admin/roles/actions';

interface PermissionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Permission | null;
}

export default function PermissionFormModal({
    isOpen,
    onClose,
    onSuccess,
    initialData
}: PermissionFormModalProps) {
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        module: 'CORE' as 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Effect para cargar datos iniciales al editar
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    code: initialData.code,
                    description: initialData.description,
                    module: initialData.module as any
                });
            } else {
                // Reset para crear
                setFormData({
                    code: '',
                    description: '',
                    module: 'CORE'
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validación básica de código
            if (!/^[a-z0-9.]+$/.test(formData.code)) {
                throw new Error('El código solo puede contener minúsculas, números y puntos (ej: service.create)');
            }

            if (initialData) {
                // Update
                const result = await updatePermission(initialData.id, {
                    description: formData.description,
                    module: formData.module
                });

                if (!result.success) throw new Error(result.error);
                toast.success('Permiso actualizado correctamente');
            } else {
                // Insert
                const result = await createPermission({
                    code: formData.code,
                    description: formData.description,
                    module: formData.module
                });

                if (!result.success) throw new Error(result.error);
                toast.success('Permiso creado correctamente');
                toast.info('Se ha asignado automáticamente a Super Admin y Admin');
            }

            onSuccess();
            onClose();

        } catch (err: any) {
            console.error('Error creando permiso:', err);
            toast.error(err.message || 'Error al crear el permiso');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Editar Permiso" : "Nuevo Permiso"}
        >
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground/80">Código del Permiso</label>
                        <input
                            type="text"
                            required
                            disabled={!!initialData} // No editar código una vez creado para evitar romper referencias
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                            placeholder="ej: reports.view"
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                        />
                        <p className="text-xs text-foreground/40 mt-1">
                            Identificador único para uso en código (solo minúsculas y puntos).
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground/80">Descripción</label>
                        <input
                            type="text"
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="ej: Ver reportes financieros"
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground/80">Módulo</label>
                        <select
                            value={formData.module}
                            onChange={e => setFormData({ ...formData, module: e.target.value as any })}
                            disabled={initialData?.code === 'admin.access'}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="CORE">CORE (Funcionalidad Principal)</option>
                            <option value="SOCIAL">SOCIAL (Interacciones)</option>
                            <option value="ECOMMERCE">ECOMMERCE (Pagos/Servicios)</option>
                            <option value="ADMIN">ADMIN (Gestión interna)</option>
                        </select>
                        {initialData?.code === 'admin.access' && (
                            <p className="text-xs text-amber-500/80 mt-1">
                                El módulo de este permiso crítico no puede ser modificado.
                            </p>
                        )}
                    </div>
                </div>

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
                        {isSubmitting ? (initialData ? 'Actualizando...' : 'Creando...') : (initialData ? 'Actualizar Permiso' : 'Crear Permiso')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

