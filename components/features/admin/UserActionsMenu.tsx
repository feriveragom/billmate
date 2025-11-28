'use client';

import { useRef, useEffect } from 'react';
import { MoreVertical, Shield, FileText, Ban, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface UserActionsMenuProps {
    user: any;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    onToggleStatus: (user: any) => void;
    onOpenRoleModal: (user: any) => void;
}

export default function UserActionsMenu({
    user,
    isOpen,
    onToggle,
    onClose,
    onToggleStatus,
    onOpenRoleModal
}: UserActionsMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // Determinar si el usuario es SUPER_ADMIN (protegido)
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                className={`p-2 rounded-lg transition text-foreground/60 hover:text-foreground ${isOpen ? 'bg-white/10 text-foreground' : 'hover:bg-white/10'}`}
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 w-56 bg-card border border-primary/20 rounded-2xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Cambiar Rol - Deshabilitado para SUPER_ADMIN */}
                    {!isSuperAdmin ? (
                        <button
                            onClick={() => {
                                onClose();
                                onOpenRoleModal(user);
                            }}
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-primary/5 text-foreground/70 hover:text-primary transition w-full text-left"
                        >
                            <Shield size={16} />
                            <span>Cambiar Rol</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-foreground/30 cursor-not-allowed w-full text-left opacity-50">
                            <Shield size={16} />
                            <span>Cambiar Rol</span>
                        </div>
                    )}

                    {/* Ver Logs - Siempre disponible */}
                    <Link
                        href={`/admin/logs?user=${user.id}`}
                        onClick={() => onClose()}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-primary/5 text-foreground/70 hover:text-primary transition w-full text-left cursor-pointer"
                    >
                        <FileText size={16} />
                        <span>Ver Logs</span>
                    </Link>

                    {/* Separador - Solo si hay opciones de cambio de estado */}
                    {!isSuperAdmin && <div className="h-px bg-primary/10 my-1" />}

                    {/* Deshabilitar/Habilitar Acceso - NO disponible para SUPER_ADMIN */}
                    {!isSuperAdmin ? (
                        <button
                            onClick={() => {
                                onClose();
                                onToggleStatus(user);
                            }}
                            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-primary/5 transition w-full text-left ${user.is_active !== false ? 'text-red-500 hover:text-red-600 hover:bg-red-500/5' : 'text-green-500 hover:text-green-600 hover:bg-green-500/5'
                                }`}
                        >
                            {user.is_active !== false ? (
                                <>
                                    <Ban size={16} />
                                    <span>Deshabilitar Acceso</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} />
                                    <span>Habilitar Acceso</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-foreground/30 cursor-not-allowed w-full text-left opacity-50">
                            <Ban size={16} />
                            <span>Deshabilitar Acceso</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
