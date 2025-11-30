'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Ban, CheckCircle, UserCog, ArrowUpDown, ArrowUp, ArrowDown, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import SelectInput from '@/components/ui/SelectInput';
import { getAdminUsers, toggleUserStatus, updateUserRole } from '@/app/admin/users/actions';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
    type Row,
} from '@tanstack/react-table';

interface User {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

const columnHelper = createColumnHelper<User>();

// --- Componente de Tarjeta para Móvil ---
const UserCard = ({
    row,
    onToggleStatus,
    onEditRole
}: {
    row: Row<User>,
    onToggleStatus: (user: User) => void,
    onEditRole: (user: User) => void
}) => {
    const user = row.original;
    const isSuperOwner = user.email === 'feriveragom@gmail.com';

    return (
        <div className="p-3 rounded-xl border bg-card border-foreground/10 hover:border-foreground/20 transition-all">
            <div className="flex gap-3 items-start">
                {/* Avatar */}
                <div className="pt-1">
                    {user.avatar_url ? (
                        <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-full bg-muted object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user.full_name?.[0] || user.email?.[0] || '?'}
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                    {/* Row 1: User Info | Role Badge */}
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">
                            {user.full_name || 'Sin Nombre'}
                        </span>
                        <span className="text-xs text-foreground/60 truncate">{user.email}</span>
                    </div>

                    <div className="flex justify-end items-start">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase ${user.role === 'SUPER_ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                            user.role === 'ADMIN' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-foreground/10 text-foreground/70'
                            }`}>
                            {user.role}
                        </span>
                    </div>

                    {/* Row 2: Status | Actions */}
                    <div className="flex items-center min-w-0 pt-1">
                        {user.is_active !== false ? (
                            <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
                                <CheckCircle size={12} /> Activo
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                                <Ban size={12} /> Inactivo
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end items-center gap-1">
                        <Link
                            href={`/admin/logs?user=${user.id}`}
                            className="p-1.5 text-foreground/70 hover:text-foreground hover:bg-foreground/10 rounded-lg transition"
                            title="Ver Logs"
                        >
                            <FileText size={16} />
                        </Link>
                        <button
                            onClick={() => onEditRole(user)}
                            disabled={isSuperOwner}
                            className={`p-1.5 rounded-lg transition ${isSuperOwner
                                ? 'text-foreground/30 cursor-not-allowed'
                                : 'text-blue-500/70 hover:text-blue-500 hover:bg-blue-500/10'
                                }`}
                            title={isSuperOwner ? "No editable" : "Editar Rol"}
                        >
                            <UserCog size={16} />
                        </button>
                        <button
                            onClick={() => onToggleStatus(user)}
                            disabled={isSuperOwner}
                            className={`p-1.5 rounded-lg transition ${isSuperOwner
                                ? 'text-foreground/30 cursor-not-allowed'
                                : user.is_active !== false
                                    ? 'text-red-500/70 hover:text-red-500 hover:bg-red-500/10'
                                    : 'text-green-500/70 hover:text-green-500 hover:bg-green-500/10'
                                }`}
                            title={isSuperOwner ? "No editable" : (user.is_active !== false ? "Deshabilitar Usuario" : "Habilitar Usuario")}
                        >
                            {user.is_active !== false ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function UsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchFilter, setSearchFilter] = useState<string>('');

    // Estado para Modal de Rol
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newRole, setNewRole] = useState<string>('');
    const [isSavingRole, setIsSavingRole] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);
        const result = await getAdminUsers();

        if (result.success && result.data) {
            setUsers(result.data);
        } else {
            // @ts-ignore
            console.error('❌ [UsersTable] Error fetching users:', result.error);
            // @ts-ignore
            toast.error('Error cargando usuarios: ' + result.error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (user: User) => {
        const newStatus = !user.is_active;
        const action = newStatus ? 'habilitar' : 'deshabilitar';

        const toastId = toast.loading(`Procesando...`);

        try {
            const result = await toggleUserStatus(user.id, newStatus);

            // @ts-ignore
            if (!result.success) throw new Error(result.error);

            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
            toast.success(`Usuario ${action}do exitosamente`, { id: toastId });
        } catch (err: any) {
            console.error(err);
            toast.error(`Error al ${action} usuario: ${err.message}`, { id: toastId });
        }
    };

    const handleRoleSave = async () => {
        if (!editingUser || !newRole) return;

        setIsSavingRole(true);
        try {
            const result = await updateUserRole(editingUser.id, newRole);

            // @ts-ignore
            if (!result.success) throw new Error(result.error);

            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, role: newRole } : u));
            toast.success(`Rol actualizado a ${newRole}`);
            setEditingUser(null);
        } catch (err: any) {
            console.error(err);
            toast.error(`Error actualizando rol: ${err.message}`);
        } finally {
            setIsSavingRole(false);
        }
    };

    const openRoleModal = (user: User) => {
        setEditingUser(user);
        setNewRole(user.role);
    };

    // Filtrar usuarios según selección
    const filteredUsers = useMemo(() => {
        return searchFilter
            ? users.filter(u => u.id === searchFilter)
            : users;
    }, [users, searchFilter]);

    const columns = useMemo(
        () => [
            columnHelper.accessor('full_name', {
                header: 'Usuario',
                cell: info => {
                    const user = info.row.original;
                    return (
                        <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.full_name}
                                    className="w-8 h-8 rounded-full bg-muted object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {user.full_name?.[0] || user.email?.[0] || '?'}
                                </div>
                            )}
                            <div>
                                <p className="font-medium flex items-center gap-2">
                                    {user.full_name || 'Sin Nombre'}
                                    {user.is_active === false && <span className="text-[10px] bg-red-500 text-white px-1.5 rounded">SUSPENDIDO</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    );
                },
                size: 250,
            }),
            columnHelper.accessor('is_active', {
                header: 'Estado',
                cell: info => (
                    info.getValue() !== false ? (
                        <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
                            <CheckCircle size={14} /> Activo
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                            <Ban size={14} /> Inactivo
                        </div>
                    )
                ),
                size: 100,
            }),
            columnHelper.accessor('role', {
                header: 'Rol',
                cell: info => (
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${info.getValue() === 'SUPER_ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                        info.getValue() === 'ADMIN' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-muted text-foreground/70'
                        }`}>
                        {info.getValue()}
                    </span>
                ),
                size: 120,
            }),
            columnHelper.accessor('created_at', {
                header: 'Registro',
                cell: info => new Date(info.getValue()).toLocaleDateString(),
                size: 120,
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }) => {
                    const isSuperOwner = row.original.email === 'feriveragom@gmail.com';
                    return (
                        <div className="flex justify-end gap-2">
                            <Link
                                href={`/admin/logs?user=${row.original.id}`}
                                className="p-2 text-foreground/70 hover:text-foreground hover:bg-foreground/10 rounded-lg transition"
                                title="Ver Logs"
                            >
                                <FileText size={16} />
                            </Link>
                            <button
                                onClick={() => openRoleModal(row.original)}
                                disabled={isSuperOwner}
                                className={`p-2 rounded-lg transition ${isSuperOwner
                                    ? 'text-foreground/30 cursor-not-allowed'
                                    : 'text-blue-500/70 hover:text-blue-500 hover:bg-blue-500/10'
                                    }`}
                                title={isSuperOwner ? "No editable" : "Editar Rol"}
                            >
                                <UserCog size={16} />
                            </button>
                            <button
                                onClick={() => handleToggleStatus(row.original)}
                                disabled={isSuperOwner}
                                className={`p-2 rounded-lg transition ${isSuperOwner
                                    ? 'text-foreground/30 cursor-not-allowed'
                                    : row.original.is_active !== false
                                        ? 'text-red-500/70 hover:text-red-500 hover:bg-red-500/10'
                                        : 'text-green-500/70 hover:text-green-500 hover:bg-green-500/10'
                                    }`}
                                title={isSuperOwner ? "No editable" : (row.original.is_active !== false ? "Deshabilitar Usuario" : "Habilitar Usuario")}
                            >
                                {row.original.is_active !== false ? <Ban size={16} /> : <CheckCircle size={16} />}
                            </button>
                        </div>
                    );
                },
                size: 100,
            }),
        ],
        []
    );

    const table = useReactTable({
        data: filteredUsers,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const userOptions = [
        { value: '', label: 'Todos los usuarios' },
        ...users.map(user => ({
            value: user.id,
            label: `${user.full_name || 'Sin Nombre'} (${user.email})`
        }))
    ];

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2>
                <div className="w-full md:w-80 text-foreground">
                    <SelectInput
                        value={searchFilter}
                        onChange={setSearchFilter}
                        options={userOptions}
                        placeholder="Buscar usuario..."
                        isClearable={true}
                        isSearchable={true}
                    />
                </div>
            </div>

            <div className="bg-transparent md:bg-card md:border md:border-foreground/10 rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-foreground/50 animate-pulse">Cargando usuarios...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-foreground/50">No se encontraron usuarios.</div>
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
                                            className={`hover:bg-foreground/5 transition group ${!row.original.is_active ? 'opacity-60 bg-red-500/5' : ''}`}
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
                                <UserCard
                                    key={row.id}
                                    row={row}
                                    onToggleStatus={handleToggleStatus}
                                    onEditRole={openRoleModal}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modal de Edición de Rol */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-primary/20 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 text-foreground">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <UserCog size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Editar Rol</h3>
                                <p className="text-sm text-muted-foreground">Modificando permisos para {editingUser.full_name}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Seleccionar nuevo rol</label>
                                <div className="relative">
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        className="w-full p-3 bg-background border border-primary/20 rounded-xl focus:border-primary outline-none text-foreground appearance-none"
                                    >
                                        <option value="FREE_USER">FREE_USER (Básico)</option>
                                        <option value="PREMIUM_USER">PREMIUM_USER (Pagado)</option>
                                        <option value="ADMIN">ADMIN (Gestión)</option>
                                        <option value="SUPER_ADMIN">SUPER_ADMIN (Total)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground/70 hover:text-foreground transition-colors border border-transparent hover:border-foreground/10"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleRoleSave}
                                    disabled={isSavingRole}
                                    className="flex-1 px-4 py-2 rounded-xl bg-primary hover:bg-primary-light text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                >
                                    {isSavingRole ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
