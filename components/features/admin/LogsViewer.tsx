'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trash2, AlertCircle } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

export default function LogsViewer() {
    const searchParams = useSearchParams();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filtros
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [selectedAction, setSelectedAction] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    
    // Selección
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Estado para Dialogs
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        type: 'single' | 'bulk';
        targetId?: string;
    }>({ isOpen: false, type: 'single' });

    const [users, setUsers] = useState<any[]>([]);

    // Inicializar filtros desde URL
    useEffect(() => {
        const userParam = searchParams.get('user');
        if (userParam) {
            setSelectedUser(userParam);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('profiles')
                    .select('id, email, full_name')
                    .order('email');
                if (data) setUsers(data);
            } catch (err) {
                console.error('Error cargando usuarios:', err);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        // Limpiar selección al cambiar filtros para evitar acciones fantasma
        setSelectedIds(new Set());

        const fetchLogs = async () => {
            try {
                setIsLoading(true);
                const supabase = createClient();
                
                let query = supabase
                    .from('audit_logs')
                    .select('*')
                    .order('created_at', { ascending: false });

                // Filtros
                if (selectedUser !== 'all') query = query.eq('user_id', selectedUser);
                if (selectedAction !== 'all') query = query.eq('action_type', selectedAction);
                
                // Filtro de Fechas (Inicio del día start - Fin del día end)
                if (startDate) query = query.gte('created_at', `${startDate}T00:00:00`);
                if (endDate) query = query.lte('created_at', `${endDate}T23:59:59`);

                const { data, error } = await query;
                
                if (data) setLogs(data);
                if (error) console.error('Error fetching logs:', error);
            } catch (err) {
                console.error('Error crítico:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [selectedUser, selectedAction, startDate, endDate]);

    // Manejo de Selección
    const toggleSelectAll = () => {
        if (selectedIds.size === logs.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(logs.map(l => l.id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    // Lógica de Borrado
    const handleDeleteRequest = (type: 'single' | 'bulk', id?: string) => {
        if (type === 'bulk' && selectedIds.size === 0) {
            toast.warning('Debes seleccionar al menos un registro para eliminar.');
            return;
        }
        setConfirmState({ isOpen: true, type, targetId: id });
    };

    const confirmDelete = async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false })); // Cerrar dialog
        const toastId = toast.loading('Eliminando registros...');
        
        try {
            const supabase = createClient();
            
            if (confirmState.type === 'bulk') {
                const { error } = await supabase
                    .from('audit_logs')
                    .delete()
                    .in('id', Array.from(selectedIds));

                if (error) throw error;

                setLogs(prev => prev.filter(log => !selectedIds.has(log.id)));
                setSelectedIds(new Set());
                toast.success(`Se eliminaron ${selectedIds.size} registros exitosamente.`, { id: toastId });
            } else if (confirmState.type === 'single' && confirmState.targetId) {
                const { error } = await supabase
                    .from('audit_logs')
                    .delete()
                    .eq('id', confirmState.targetId);

                if (error) throw error;

                setLogs(prev => prev.filter(log => log.id !== confirmState.targetId));
                toast.success('Registro eliminado exitosamente.', { id: toastId });
            }
        } catch (err) {
            console.error(err);
            toast.error('Error al eliminar los registros. Inténtalo de nuevo.', { id: toastId });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Logs de Auditoría</h2>
                
                {/* Botón de Borrado Global (Siempre visible) */}
                <button 
                    onClick={() => handleDeleteRequest('bulk')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                        selectedIds.size > 0 
                            ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20' 
                            : 'bg-red-500/10 text-red-500 cursor-not-allowed border border-red-500/10'
                    }`}
                >
                    <Trash2 size={18} />
                    <span>Eliminar {selectedIds.size > 0 ? `(${selectedIds.size})` : 'Selección'}</span>
                </button>
            </div>

            {/* Panel de Filtros (Grid 2x2) */}
            <div className="bg-card border border-white/10 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fila 1: Criterios */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground/50 ml-1 uppercase tracking-wider">Usuario</label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full px-4 py-2.5 bg-background border border-white/10 rounded-xl focus:border-primary outline-none transition-colors"
                        >
                            <option value="all">Todos los usuarios</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.full_name ? `${u.full_name} (${u.email})` : u.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground/50 ml-1 uppercase tracking-wider">Acción</label>
                        <select
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value)}
                            className="w-full px-4 py-2.5 bg-background border border-white/10 rounded-xl focus:border-primary outline-none transition-colors"
                        >
                            <option value="all">Todas las acciones</option>
                            {['LOGIN', 'LOGOUT', 'SIGNUP', 'CREATE', 'DELETE', 'UPDATE'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Fila 2: Fechas */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground/50 ml-1 uppercase tracking-wider">Desde</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2.5 bg-background border border-white/10 rounded-xl focus:border-primary outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground/50 ml-1 uppercase tracking-wider">Hasta</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2.5 bg-background border border-white/10 rounded-xl focus:border-primary outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Tabla de Resultados */}
            <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
                {isLoading ? <div className="p-12 text-center text-foreground/50 animate-pulse">Cargando registros...</div> :
                    logs.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-foreground/40 gap-3">
                            <AlertCircle size={40} className="opacity-20" />
                            <p>No hay logs que coincidan con los filtros actuales</p>
                        </div>
                    ) :
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 font-medium text-foreground/70">
                                    <tr>
                                        <th className="p-4 w-10 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.size === logs.length && logs.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded border-white/20 bg-white/5 cursor-pointer accent-primary"
                                            />
                                        </th>
                                        <th className="p-4">Fecha</th>
                                        <th className="p-4">Usuario</th>
                                        <th className="p-4">Acción</th>
                                        <th className="p-4">Descripción</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {logs.map(log => (
                                        <tr key={log.id} className={`hover:bg-white/5 transition group ${selectedIds.has(log.id) ? 'bg-primary/5' : ''}`}>
                                            <td className="p-4 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.has(log.id)}
                                                    onChange={() => toggleSelectOne(log.id)}
                                                    className="w-4 h-4 rounded border-white/20 bg-white/5 cursor-pointer accent-primary"
                                                />
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-xs font-mono text-foreground/60">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-foreground text-xs font-medium">{log.user_email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${
                                                    log.action_type === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                                                    log.action_type === 'LOGIN' ? 'bg-green-500/20 text-green-400' :
                                                    log.action_type === 'LOGOUT' ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                    {log.action_type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-foreground/70 max-w-md truncate" title={log.action_description}>
                                                {log.action_description}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleDeleteRequest('single', log.id)}
                                                    className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                                    title="Eliminar log"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                }
            </div>

            {/* Dialogo de Confirmación */}
            <ConfirmDialog 
                isOpen={confirmState.isOpen}
                type="error"
                title={confirmState.type === 'bulk' ? 'Eliminar Logs' : 'Eliminar Log'}
                message={confirmState.type === 'bulk' 
                    ? `¿Estás seguro de que quieres eliminar permanentemente los ${selectedIds.size} logs seleccionados?`
                    : '¿Estás seguro de que quieres eliminar este registro de auditoría?'
                }
                confirmText="Sí, eliminar"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
