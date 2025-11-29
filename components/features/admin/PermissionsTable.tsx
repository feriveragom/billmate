'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Edit2, Trash2, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import PermissionFormModal from './PermissionFormModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Permission } from '@/core/domain/entities';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/auth-provider';
import { getPermissions } from '@/app/admin/roles/actions';
import SelectInput from '@/components/ui/SelectInput';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
    type Row,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<Permission>();

// --- Componente de Tarjeta para Móvil ---
const PermissionCard = ({
    row,
    onEdit,
    onDelete,
    canManageRoles
}: {
    row: Row<Permission>,
    onEdit: (permission: Permission) => void,
    onDelete: (permission: Permission) => void,
    canManageRoles: boolean
}) => {
    const permission = row.original;
    const isProtected = permission.code === 'admin.access';

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
        <div className="p-3 rounded-xl border bg-card border-foreground/10 hover:border-foreground/20 transition-all">
            <div className="flex gap-3 items-start">
                {/* Content Grid */}
                <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                    {/* Row 1: Code | Module Badge */}
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-mono font-medium text-foreground truncate">
                            {permission.code}
                        </span>
                        <span className="text-xs text-foreground/60 truncate">{permission.description}</span>
                    </div>

                    <div className="flex justify-end items-start">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase border ${getModuleColor(permission.module)}`}>
                            {permission.module}
                        </span>
                    </div>

                    {/* Row 2: Actions */}
                    <div className="col-span-2 flex justify-end items-center gap-1 pt-2">
                        {canManageRoles && (
                            <>
                                <button
                                    onClick={() => onEdit(permission)}
                                    className="p-1.5 text-blue-500/70 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(permission)}
                                    disabled={isProtected}
                                    className={`p-1.5 rounded-lg transition ${isProtected
                                        ? 'text-foreground/30 cursor-not-allowed'
                                        : 'text-red-500/70 hover:text-red-500 hover:bg-red-500/10'
                                        }`}
                                    title={isProtected ? "Permiso protegido" : "Eliminar"}
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

export default function PermissionsTable() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchFilter, setSearchFilter] = useState<string>('');

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

    // Filtrar permisos según búsqueda
    const filteredPermissions = useMemo(() => {
        if (!searchFilter) return permissions;
        const lowerFilter = searchFilter.toLowerCase();
        return permissions.filter(p =>
            p.code.toLowerCase().includes(lowerFilter) ||
            p.description.toLowerCase().includes(lowerFilter) ||
            p.module.toLowerCase().includes(lowerFilter)
        );
    }, [permissions, searchFilter]);

    const getModuleColor = (module: string) => {
        switch (module) {
            case 'CORE': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'ADMIN': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'SOCIAL': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
            case 'ECOMMERCE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-white/5 text-foreground/60 border-white/10';
        }
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('code', {
                header: 'Código',
                cell: info => <span className="font-mono text-foreground/80">{info.getValue()}</span>,
                size: 200,
            }),
            columnHelper.accessor('description', {
                header: 'Descripción',
                cell: info => <span className="text-foreground/70">{info.getValue()}</span>,
                size: 300,
            }),
            columnHelper.accessor('module', {
                header: 'Módulo',
                cell: info => (
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getModuleColor(info.getValue())}`}>
                        {info.getValue()}
                    </span>
                ),
                size: 100,
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }) => {
                    const permission = row.original;
                    const isProtected = permission.code === 'admin.access';
                    return (
                        <div className="flex justify-end gap-2">
                            {canManageRoles && (
                                <>
                                    <button
                                        onClick={() => handleEdit(permission)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-primary transition"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(permission)}
                                        disabled={isProtected}
                                        className={`p-2 rounded-lg transition ${isProtected
                                            ? 'text-foreground/30 cursor-not-allowed'
                                            : 'text-red-400 hover:text-red-500 hover:bg-red-500/10'
                                            }`}
                                        title={isProtected ? "Permiso protegido" : "Eliminar"}
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
        data: filteredPermissions,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const permissionOptions = [
        { value: '', label: 'Todos los permisos' },
        ...permissions.map(p => ({
            value: p.code, // Usamos el código para filtrar, pero el filtro real es texto libre
            label: `${p.code} - ${p.description}`
        }))
    ];

    // Adaptador para el SelectInput que espera un filtro de ID pero aquí filtramos por texto
    // En este caso, simplificaremos usando un input de texto normal para búsqueda global o adaptamos el SelectInput
    // Dado que SelectInput es para seleccionar una opción específica, mejor usamos un input de búsqueda simple o
    // mantenemos el SelectInput pero su comportamiento de filtrado debe coincidir.
    // Para mantener consistencia con UsersTable, usaremos SelectInput pero el filtro será texto.
    // Sin embargo, UsersTable filtra por ID exacto. Aquí queremos búsqueda general.
    // Vamos a usar un input de texto simple para búsqueda rápida, o adaptar el SelectInput.
    // Por simplicidad y UX en tablas de permisos (muchos items), un input de texto es mejor,
    // pero el usuario pidió "la misma técnica/experiencia".
    // UsersTable usa SelectInput. Vamos a usar SelectInput pero permitiendo búsqueda.
    // El SelectInput actual filtra por valor exacto en UsersTable.
    // Haremos que el SelectInput seleccione un permiso específico para filtrar solo ese,
    // o podríamos cambiar a un input de texto.
    // Para ser fiel a "la misma técnica", usaremos SelectInput para buscar un permiso específico.

    // Ajuste: El SelectInput filtra por ID en UsersTable. Aquí filtraremos por Código.
    // Pero filteredPermissions usa searchFilter como string para búsqueda parcial?
    // En UsersTable: users.filter(u => u.id === searchFilter)
    // Aquí haremos lo mismo: si hay searchFilter, mostramos solo ese permiso.
    const filteredPermissionsExact = useMemo(() => {
        return searchFilter
            ? permissions.filter(p => p.code === searchFilter)
            : permissions;
    }, [permissions, searchFilter]);

    // Re-instanciamos la tabla con el filtro exacto para mantener consistencia con UsersTable
    const tableExact = useReactTable({
        data: filteredPermissionsExact,
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Gestión de Permisos</h2>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full md:w-80 text-foreground">
                        <SelectInput
                            value={searchFilter}
                            onChange={setSearchFilter}
                            options={permissionOptions}
                            placeholder="Buscar permiso..."
                            isClearable={true}
                            isSearchable={true}
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={!canManageRoles}
                        className={`px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition flex items-center justify-center gap-2 ${!canManageRoles ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">Nuevo Permiso</span>
                        <span className="md:hidden">Nuevo</span>
                    </button>
                </div>
            </div>

            <div className="bg-transparent md:bg-card md:border md:border-foreground/10 rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-foreground/50 animate-pulse">Cargando permisos...</div>
                ) : filteredPermissionsExact.length === 0 ? (
                    <div className="p-12 text-center text-foreground/50">No se encontraron permisos.</div>
                ) : (
                    <>
                        {/* VISTA DE TABLA (Desktop) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-foreground/5 font-medium text-foreground/70">
                                    {tableExact.getHeaderGroups().map(headerGroup => (
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
                                    {tableExact.getRowModel().rows.map(row => (
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
                            {tableExact.getRowModel().rows.map(row => (
                                <PermissionCard
                                    key={row.id}
                                    row={row}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteClick}
                                    canManageRoles={canManageRoles}
                                />
                            ))}
                        </div>
                    </>
                )}
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
