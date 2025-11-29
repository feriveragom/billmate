'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trash2, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, Download } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import SelectInput from '@/components/ui/SelectInput';
import {
    getAuditLogs,
    getUsersForFilter,
    deleteAuditLog,
    deleteMultipleAuditLogs
} from '@/app/admin/logs/actions';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
    type Row,
} from '@tanstack/react-table';

interface AuditLog {
    id: string;
    created_at: string;
    user_email: string;
    action_type: string;
    action_description: string;
}

const columnHelper = createColumnHelper<AuditLog>();

// --- Componente de Tarjeta para Móvil ---
const LogCard = ({ row, onDelete }: { row: Row<AuditLog>, onDelete: (id: string) => void }) => {
    const log = row.original;
    const isSelected = row.getIsSelected();

    return (
        <div
            className={`p-3 rounded-xl border transition-all ${isSelected
                ? 'bg-primary/10 border-primary/30'
                : 'bg-card border-foreground/10 hover:border-foreground/20'
                }`}
        >
            <div className="flex gap-3 items-start">
                {/* Checkbox */}
                <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={row.getToggleSelectedHandler()}
                        className="w-4 h-4 rounded border-foreground/20 bg-foreground/5 cursor-pointer accent-primary"
                    />
                </div>

                {/* Content Grid */}
                <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                    {/* Row 1: User Info | Badge */}
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{log.user_email}</span>
                        <span className="text-[10px] text-foreground/40">{new Date(log.created_at).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-end items-start">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase ${log.action_type === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                            log.action_type === 'LOGIN' ? 'bg-green-500/20 text-green-400' :
                                log.action_type === 'LOGOUT' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-blue-500/20 text-blue-400'
                            }`}>
                            {log.action_type}
                        </span>
                    </div>

                    {/* Row 2: Description | Delete Button */}
                    <div className="flex items-center min-w-0 pt-1">
                        <p className="text-xs text-foreground/60 truncate" title={log.action_description}>
                            {log.action_description}
                        </p>
                    </div>

                    <div className="flex justify-end items-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(log.id);
                            }}
                            className="p-1.5 -mr-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function LogsViewer() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState({});

    // Filtros
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [selectedAction, setSelectedAction] = useState<string>('all');
    const getLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    const [startDate, setStartDate] = useState<string>(getLocalDate());
    const [endDate, setEndDate] = useState<string>(getLocalDate());

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
            const result = await getUsersForFilter();
            if (result.success && result.data) {
                setUsers(result.data);
            }
        };


        fetchUsers();
    }, []);

    useEffect(() => {
        setRowSelection({});

        const fetchLogs = async () => {
            try {
                setIsLoading(true);

                const result = await getAuditLogs({
                    userId: selectedUser,
                    actionType: selectedAction,
                    startDate,
                    endDate
                });

                if (result.success && result.data) {
                    setData(result.data);
                } else {
                    // @ts-ignore
                    toast.error('Error cargando logs: ' + result.error);
                }
            } catch (err) {
                console.error('Error crítico:', err);
            } finally {
                setIsLoading(false);
            }
        };


        fetchLogs();
    }, [selectedUser, selectedAction, startDate, endDate]);

    const handleDeleteRequest = (type: 'single' | 'bulk', id?: string) => {
        const selectedCount = Object.keys(rowSelection).length;
        if (type === 'bulk' && selectedCount === 0) {
            toast.warning('Debes seleccionar al menos un registro para eliminar.');
            return;
        }
        setConfirmState({ isOpen: true, type, targetId: id });
    };



    const confirmDelete = async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        const toastId = toast.loading('Eliminando registros...');

        try {
            if (confirmState.type === 'bulk') {
                const selectedRows = table.getSelectedRowModel().rows;
                const ids = selectedRows.map(row => row.original.id);
                const result = await deleteMultipleAuditLogs(ids);

                // @ts-ignore
                if (!result.success) throw new Error(result.error);

                setData(prev => prev.filter(log => !ids.includes(log.id)));
                setRowSelection({});
                toast.success(`Se eliminaron ${result.count} registros exitosamente.`, { id: toastId });
            } else if (confirmState.type === 'single' && confirmState.targetId) {
                const result = await deleteAuditLog(confirmState.targetId);

                // @ts-ignore
                if (!result.success) throw new Error(result.error);

                setData(prev => prev.filter(log => log.id !== confirmState.targetId));
                setRowSelection({}); // Limpiar selección para evitar drift de índices
                toast.success('Registro eliminado exitosamente.', { id: toastId });
            }
        } catch (err: any) {
            console.error(err);
            toast.error('Error al eliminar los registros: ' + err.message, { id: toastId });
        }
    };



    const columns = useMemo(
        () => [
            columnHelper.display({
                id: 'select',
                header: ({ table }) => (
                    <input
                        type="checkbox"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        className="w-4 h-4 rounded border-foreground/20 bg-foreground/5 cursor-pointer accent-primary"
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        className="w-4 h-4 rounded border-foreground/20 bg-foreground/5 cursor-pointer accent-primary"
                    />
                ),
                size: 40,
            }),
            columnHelper.accessor('created_at', {
                header: 'Fecha',
                cell: info => new Date(info.getValue()).toLocaleString(),
                size: 150,
            }),
            columnHelper.accessor('user_email', {
                header: 'Usuario',
                size: 200,
            }),
            columnHelper.accessor('action_type', {
                header: 'Acción',
                cell: info => {
                    const type = info.getValue();
                    return (
                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${type === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                            type === 'LOGIN' ? 'bg-green-500/20 text-green-400' :
                                type === 'LOGOUT' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-blue-500/20 text-blue-400'
                            }`}>
                            {type}
                        </span>
                    );
                },
                size: 100,
            }),
            columnHelper.accessor('action_description', {
                header: 'Descripción',
                cell: info => (
                    <span className="text-xs text-foreground/70 max-w-md truncate block" title={info.getValue()}>
                        {info.getValue()}
                    </span>
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }) => (
                    <button
                        onClick={() => handleDeleteRequest('single', row.original.id)}
                        className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                        title="Eliminar log"
                    >
                        <Trash2 size={16} />
                    </button>
                ),
                size: 80,
            }),
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const handleExport = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const selectedCount = selectedRows.length;

        if (selectedCount === 0) {
            toast.warning('Debes seleccionar al menos un registro para exportar.');
            return;
        }

        const exportData = selectedRows.map(row => {
            const log = row.original;
            return `ID: ${log.id}
Fecha: ${new Date(log.created_at).toLocaleString()}
Usuario: ${log.user_email}
Acción: ${log.action_type}
Descripción: ${log.action_description}
----------------------------------------`;
        }).join('\n\n');

        const blob = new Blob([exportData], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_logs_export_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`${selectedCount} registros exportados exitosamente.`);
    };

    const userOptions = [
        { value: 'all', label: 'Todos los usuarios' },
        ...users.map(u => ({
            value: u.id,
            label: u.full_name ? `${u.full_name} (${u.email})` : u.email
        }))
    ];

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Logs de Auditoría</h2>

                <div className="flex items-center gap-3">
                    {/* Botón Select All para Móvil */}
                    <button
                        onClick={table.getToggleAllRowsSelectedHandler()}
                        className="md:hidden flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-foreground/5 border border-foreground/10 text-sm"
                    >
                        {table.getIsAllRowsSelected() ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                        <span>{table.getIsAllRowsSelected() ? 'Deseleccionar' : 'Seleccionar Todo'}</span>
                    </button>

                    <button
                        onClick={handleExport}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${selectedCount > 0
                            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20'
                            : 'bg-blue-500/10 text-blue-500 cursor-not-allowed border border-blue-500/10'
                            }`}
                    >
                        <Download size={18} />
                        <span className="hidden md:inline">Exportar {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
                    </button>

                    <button
                        onClick={() => handleDeleteRequest('bulk')}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${selectedCount > 0
                            ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                            : 'bg-red-500/10 text-red-500 cursor-not-allowed border border-red-500/10'
                            }`}
                    >
                        <Trash2 size={18} />
                        <span className="hidden md:inline">Eliminar {selectedCount > 0 ? `(${selectedCount})` : 'Selección'}</span>
                    </button>
                </div>
            </div>

            {/* Panel de Filtros */}
            <div className="bg-card border border-foreground/10 rounded-2xl p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground/50 ml-1 uppercase tracking-wider">Usuario</label>
                        <SelectInput
                            value={selectedUser}
                            onChange={setSelectedUser}
                            options={userOptions}
                            placeholder="Todos"
                            isClearable={false}
                            isSearchable={true}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground/50 ml-1 uppercase tracking-wider">Acción</label>
                        <select
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value)}
                            className="w-full px-4 py-2.5 bg-background border border-foreground/10 rounded-xl focus:border-primary outline-none transition-colors"
                        >
                            <option value="all">Todas</option>
                            {['LOGIN', 'LOGOUT', 'SIGNUP', 'CREATE', 'DELETE', 'UPDATE'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground/50 ml-1 uppercase tracking-wider">Desde</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2.5 bg-background border border-foreground/10 rounded-xl focus:border-primary outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground/50 ml-1 uppercase tracking-wider">Hasta</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2.5 bg-background border border-foreground/10 rounded-xl focus:border-primary outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Contenedor de Datos */}
            <div className="bg-transparent md:bg-card md:border md:border-foreground/10 rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-foreground/50 animate-pulse">Cargando registros...</div>
                ) : data.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-foreground/40 gap-3">
                        <AlertCircle size={40} className="opacity-20" />
                        <p>No hay logs que coincidan con los filtros actuales</p>
                    </div>
                ) : (
                    <>
                        {/* VISTA DE TABLA (Desktop) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-foreground/5 font-medium text-foreground/70">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => {
                                                const isCheckbox = header.id === 'select';
                                                const isActions = header.id === 'actions';
                                                return (
                                                    <th
                                                        key={header.id}
                                                        className={`p-4 ${isCheckbox || isActions ? 'text-center' : 'text-left'}`}
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
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-foreground/5">
                                    {table.getRowModel().rows.map(row => (
                                        <tr
                                            key={row.id}
                                            className={`hover:bg-foreground/5 transition group ${row.getIsSelected() ? 'bg-primary/5' : ''}`}
                                        >
                                            {row.getVisibleCells().map(cell => {
                                                const isCheckbox = cell.column.id === 'select';
                                                const isActions = cell.column.id === 'actions';
                                                return (
                                                    <td key={cell.id} className={`p-4 ${isCheckbox || isActions ? 'text-center' : 'text-left'}`}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* VISTA DE TARJETAS (Móvil) */}
                        <div className="md:hidden space-y-3">
                            {table.getRowModel().rows.map(row => (
                                <LogCard
                                    key={row.id}
                                    row={row}
                                    onDelete={(id) => handleDeleteRequest('single', id)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                type="error"
                title={confirmState.type === 'bulk' ? 'Eliminar Logs' : 'Eliminar Log'}
                message={confirmState.type === 'bulk'
                    ? `¿Estás seguro de que quieres eliminar permanentemente los ${selectedCount} logs seleccionados?`
                    : '¿Estás seguro de que quieres eliminar este registro de auditoría?'
                }
                confirmText="Sí, eliminar"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
