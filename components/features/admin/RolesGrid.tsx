'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Shield, Lock, Check, X, Edit2, Plus, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import RoleFormModal from './RoleFormModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Role, Permission } from '@/core/domain/entities';
import { useAuth } from '@/core/auth/auth-provider';
import { getRolesWithPermissions, getPermissions, deleteRole } from '@/app/admin/roles/actions';
import { toast } from 'sonner';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
    type Row,
} from '@tanstack/react-table';

interface RoleWithPermissions extends Role {
    permission_codes: string[];
}

const columnHelper = createColumnHelper<RoleWithPermissions>();

// --- Componente de Tarjeta para Móvil ---
const RoleCard = ({
    row,
    onEdit,
    onDelete,
    canManageRoles
}: {
    row: Row<RoleWithPermissions>,
    onEdit: (role: RoleWithPermissions) => void,
    onDelete: (role: RoleWithPermissions) => void,
    canManageRoles: boolean
}) => {
    const role = row.original;
    const isProtected = ['SUPER_ADMIN', 'ADMIN', 'FREE_USER'].includes(role.name);

    // Determinar color según rol
    const roleColors = {
        'SUPER_ADMIN': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
        'ADMIN': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
        'PREMIUM_USER': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
        'FREE_USER': { bg: 'bg-white/5', text: 'text-foreground/70', border: 'border-white/10' }
    };

    const colors = roleColors[role.name as keyof typeof roleColors] ||
        { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };

    return (
        <div className={`p-4 rounded-xl border bg-card ${colors.border} hover:border-primary/50 transition-all`}>
            <div className="flex gap-3 items-start">
                <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                    {role.name === 'SUPER_ADMIN' ? <Lock size={20} /> : <Shield size={20} />}
                </div>

                <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-foreground truncate">
                            {role.label}
                        </span>
                        <span className="text-xs text-foreground/60 truncate">{role.description}</span>
                    </div>

                    <div className="flex justify-end items-start">
                        {role.isSystemRole && (
                            <span className="text-[9px] uppercase tracking-wider font-bold text-foreground/40 bg-white/5 px-1.5 py-0.5 rounded-md">
                                Sistema
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-foreground/50 pt-1">
                        <Check size={12} />
                        {role.permissions.length} permisos
                    </div>

                    <div className="flex justify-end items-center gap-1">
                        {canManageRoles && (
                            <>
                                <button
                                    onClick={() => onEdit(role)}
                                    className="p-1.5 text-blue-500/70 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(role)}
                                    disabled={isProtected}
                                    className={`p-1.5 rounded-lg transition ${isProtected
                                        ? 'text-foreground/30 cursor-not-allowed'
                                        : 'text-red-500/70 hover:text-red-500 hover:bg-red-500/10'
                                        }`}
                                    title={isProtected ? "Rol protegido" : "Eliminar"}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function RolesGrid() {
    const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);

    const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [roleToDelete, setRoleToDelete] = useState<RoleWithPermissions | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { checkPermission } = useAuth();
    const canManageRoles = checkPermission('admin.roles.manage');

    const fetchRolesAndPermissions = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch permissions
            const permsResult = await getPermissions();
            if (permsResult.success && permsResult.data) {
                setPermissions(permsResult.data);
            } else {
                console.error('Error fetching permissions:', permsResult.error);
                toast.error('Error al cargar permisos');
            }

            // Fetch roles
            const rolesResult = await getRolesWithPermissions();
            if (rolesResult.success && rolesResult.data) {
                setRoles(rolesResult.data);
            } else {
                console.error('Error fetching roles:', rolesResult.error);
                toast.error('Error al cargar roles');
            }
        } catch (err) {
            console.error('Error fetching roles and permissions:', err);
            toast.error('Error al cargar datos');
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

    const handleDeleteClick = (role: RoleWithPermissions) => {
        setRoleToDelete(role);
    };

    const handleConfirmDelete = async () => {
        if (!roleToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteRole(roleToDelete.id);

            if (!result.success) throw new Error(result.error);

            toast.success(`Rol ${roleToDelete.label} eliminado`);
            fetchRolesAndPermissions();
        } catch (err: any) {
            console.error('Error deleting role:', err);
            toast.error('No se pudo eliminar: ' + err.message);
        } finally {
            setIsDeleting(false);
            setRoleToDelete(null);
        }
    };

    const handleSuccess = () => {
        fetchRolesAndPermissions();
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('label', {
                header: 'Rol',
                cell: info => {
                    const role = info.row.original;
                    const roleColors = {
                        'SUPER_ADMIN': { bg: 'bg-purple-500/10', text: 'text-purple-400' },
                        'ADMIN': { bg: 'bg-blue-500/10', text: 'text-blue-400' },
                        'PREMIUM_USER': { bg: 'bg-amber-500/10', text: 'text-amber-400' },
                        'FREE_USER': { bg: 'bg-white/5', text: 'text-foreground/70' }
                    };
                    const colors = roleColors[role.name as keyof typeof roleColors] ||
                        { bg: 'bg-emerald-500/10', text: 'text-emerald-400' };

                    return (
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                                {role.name === 'SUPER_ADMIN' ? <Lock size={16} /> : <Shield size={16} />}
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{role.label}</p>
                                <p className="text-xs text-foreground/50">{role.description}</p>
                            </div>
                        </div>
                    );
                },
                size: 250,
            }),
            columnHelper.accessor('isSystemRole', {
                header: 'Tipo',
                cell: info => (
                    info.getValue() ? (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-foreground/40 bg-white/5 px-2 py-1 rounded-md">
                            Sistema
                        </span>
                    ) : (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                            Personalizado
                        </span>
                    )
                ),
                size: 100,
            }),
            columnHelper.accessor('permissions', {
                header: 'Permisos',
                cell: info => (
                    <span className="text-sm text-foreground/60 flex items-center gap-1">
                        <Check size={14} />
                        {info.getValue().length} asignados
                    </span>
                ),
                size: 150,
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }) => {
                    const role = row.original;
                    const isProtected = ['SUPER_ADMIN', 'ADMIN', 'FREE_USER'].includes(role.name);
                    return (
                        <div className="flex justify-end gap-2">
                            {canManageRoles && (
                                <>
                                    <button
                                        onClick={() => handleEditRole(role)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-primary transition"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(role)}
                                        disabled={isProtected}
                                        className={`p-2 rounded-lg transition ${isProtected
                                            ? 'text-foreground/30 cursor-not-allowed'
                                            : 'text-red-400 hover:text-red-500 hover:bg-red-500/10'
                                            }`}
                                        title={isProtected ? "Rol protegido" : "Eliminar"}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    );
                },
                size: 100,
            }),
        ],
        [canManageRoles]
    );

    const table = useReactTable({
        data: roles,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

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

            <div className="bg-transparent md:bg-card md:border md:border-foreground/10 rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-foreground/50 animate-pulse">Cargando roles...</div>
                ) : roles.length === 0 ? (
                    <div className="p-12 text-center text-foreground/50">No hay roles registrados.</div>
                ) : (
                    <>
                        {/* VISTA DE TABLA (Desktop) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-foreground/5 font-medium text-foreground/70">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    className={`p-4 ${header.id === 'actions' ? 'text-right' : 'text-left'}`}
                                                    style={{ width: header.column.columnDef.size }}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <div
                                                            className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-2' : ''}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            {header.column.getCanSort() && (
                                                                <span className="text-foreground/30">
                                                                    {{
                                                                        asc: <ArrowUp size={14} />,
                                                                        desc: <ArrowDown size={14} />,
                                                                    }[header.column.getIsSorted() as string] ?? <ArrowUpDown size={14} />}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-foreground/5">
                                    {table.getRowModel().rows.map(row => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-foreground/5 transition group"
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className={`p-4 ${cell.column.id === 'actions' ? 'text-right' : 'text-left'}`}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* VISTA DE TARJETAS (Móvil) */}
                        <div className="md:hidden space-y-3">
                            {table.getRowModel().rows.map(row => (
                                <RoleCard
                                    key={row.id}
                                    row={row}
                                    onEdit={handleEditRole}
                                    onDelete={handleDeleteClick}
                                    canManageRoles={canManageRoles}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <RoleFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={selectedRole}
                allPermissions={permissions}
                onSuccess={handleSuccess}
            />

            <ConfirmDialog
                isOpen={!!roleToDelete}
                onCancel={() => setRoleToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="¿Eliminar rol?"
                message={`Estás a punto de eliminar permanentemente el rol "${roleToDelete?.label}". Esta acción no se puede deshacer.`}
                confirmText={isDeleting ? "Eliminando..." : "Sí, eliminar"}
                type="warning"
            />
        </div>
    );
}
