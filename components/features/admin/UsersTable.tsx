'use client';

import { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import UserActionsMenu from './UserActionsMenu';
import SelectInput from '@/components/ui/SelectInput';
import { getAdminUsers, toggleUserStatus, updateUserRole } from '@/app/admin/users/actions';

export default function UsersTable() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [searchFilter, setSearchFilter] = useState<string>('');

    // Estado para Modal de Rol
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [newRole, setNewRole] = useState<string>('');
    const [isSavingRole, setIsSavingRole] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);
        const result = await getAdminUsers();

        if (result.success && result.data) {
            setUsers(result.data);
        } else {
            console.error('❌ [UsersTable] Error fetching users:', result.error);
            toast.error('Error cargando usuarios: ' + result.error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (user: any) => {
        const newStatus = !user.is_active;
        const action = newStatus ? 'habilitar' : 'deshabilitar';

        const toastId = toast.loading(`Procesando...`);
        setActiveMenuId(null);

        try {
            const result = await toggleUserStatus(user.id, newStatus);

            if (!result.success) throw new Error(result.error);

            setUsers(users.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
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

            if (!result.success) throw new Error(result.error);

            setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: newRole } : u));
            toast.success(`Rol actualizado a ${newRole}`);
            setEditingUser(null);
        } catch (err: any) {
            console.error(err);
            toast.error(`Error actualizando rol: ${err.message}`);
        } finally {
            setIsSavingRole(false);
        }
    };

    const openRoleModal = (user: any) => {
        setEditingUser(user);
        setNewRole(user.role);
        setActiveMenuId(null);
    };

    // Preparar opciones para el SelectInput
    const userOptions = [
        { value: '', label: 'Todos los usuarios' },
        ...users.map(user => ({
            value: user.id,
            label: `${user.full_name || 'Sin Nombre'} (${user.email})`
        }))
    ];

    // Filtrar usuarios según selección
    const filteredUsers = searchFilter
        ? users.filter(u => u.id === searchFilter)
        : users;

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2> {/* Asegurar color visible */}
                <div className="w-80 text-foreground"> {/* Asegurar color visible en inputs */}
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

            <div className="bg-card border border-white/10 rounded-2xl overflow-visible shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-foreground/70 font-medium"><tr>
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Rol</th>
                        <th className="p-4">Registro</th>
                        <th className="p-4 text-right">Acciones</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/10 relative">
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-foreground/50">Cargando usuarios...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-foreground/50">No se encontraron usuarios.</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className={`hover:bg-muted/20 transition relative text-foreground ${!user.is_active ? 'opacity-60 bg-red-500/5' : ''} ${activeMenuId === user.id ? 'z-50' : 'z-0'}`}>
                                <td className="p-4">
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
                                </td>
                                <td className="p-4">
                                    {user.is_active !== false ? (
                                        <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
                                            <CheckCircle size={14} /> Activo
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                                            <Ban size={14} /> Inactivo
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${user.role === 'SUPER_ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                                        user.role === 'ADMIN' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-muted text-foreground/70'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right relative">
                                    <div className="flex justify-end">
                                        <UserActionsMenu
                                            user={user}
                                            isOpen={activeMenuId === user.id}
                                            onToggle={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                                            onClose={() => setActiveMenuId(null)}
                                            onToggleStatus={handleToggleStatus}
                                            onOpenRoleModal={openRoleModal}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
