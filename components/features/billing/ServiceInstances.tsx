'use client';

import { useState, useEffect } from 'react';
import {
    LayoutList,
    LayoutGrid,
    Eye,
    EyeOff,
    Pencil,
    Trash2,
    CheckCircle,
    AlertCircle,
    XCircle,
    MoreVertical,
    Calendar,
    DollarSign,
    FileText
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { ServiceInstance, ServiceStatus } from '@/lib/types';
import Modal from '../../ui/Modal';
import ServiceInstanceForm from './ServiceInstanceForm';
import ServiceInstanceDetails from './ServiceInstanceDetails';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceInstancesProps {
    showArchived?: boolean;
}

export default function ServiceInstances({ showArchived = false }: ServiceInstancesProps) {
    const { services, addService, updateService, deleteService, serviceDefinitions } = useApp();

    // Filtros locales para la vista de archivados
    const [filters, setFilters] = useState<{ [key in ServiceStatus]?: boolean }>({
        paid: false,
        overdue: false,
        cancelled: false
    });

    const toggleFilter = (status: ServiceStatus) => {
        setFilters(prev => ({ ...prev, [status]: !prev[status] }));
    };

    // Filtrar servicios según la vista y los filtros activos
    const visibleServices = services.filter(service => {
        if (showArchived) {
            const isArchivedStatus = service.status === 'paid' || service.status === 'overdue' || service.status === 'cancelled';

            // Si no hay filtros activos, mostrar todo
            const hasActiveFilters = Object.values(filters).some(Boolean);
            if (!hasActiveFilters) return isArchivedStatus;

            return isArchivedStatus && filters[service.status];
        }
        return service.status === 'pending';
    });

    // View Mode: 'feed' (Vertical List) or 'stories' (Horizontal Scroll)
    // Default to 'feed' as it carries more info
    const [viewMode, setViewMode] = useState<'feed' | 'stories'>('feed');
    const [isHidden, setIsHidden] = useState(false);

    // Estado para Crear/Editar
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingInstance, setEditingInstance] = useState<ServiceInstance | null>(null);

    // Estado para Detalles
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedInstanceDetails, setSelectedInstanceDetails] = useState<ServiceInstance | null>(null);

    // Estado para Menú de Acciones (Feed View)
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; instance: ServiceInstance | null }>({
        isOpen: false,
        instance: null
    });

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleViewChange = () => {
        setViewMode(prev => prev === 'feed' ? 'stories' : 'feed');
        if (isHidden) setIsHidden(false);
    };

    const handleCardClick = (instance: ServiceInstance) => {
        setSelectedInstanceDetails(instance);
        setIsDetailsModalOpen(true);
    };

    const handleEditClick = (instance: ServiceInstance) => {
        setEditingInstance(instance);
        setIsFormModalOpen(true);
        setActiveMenuId(null);
    };

    const handleDeleteClick = (instance: ServiceInstance) => {
        setConfirmDialog({ isOpen: true, instance });
        setActiveMenuId(null);
    };

    const handleConfirmDelete = () => {
        if (confirmDialog.instance) {
            deleteService(confirmDialog.instance.id);
        }
        setConfirmDialog({ isOpen: false, instance: null });
    };

    const handleSave = (data: Partial<ServiceInstance>) => {
        if (editingInstance) {
            updateService(editingInstance.id, data);
        } else {
            const newInstance: ServiceInstance = {
                id: `inst-${Date.now()}`,
                userId: 'current-user', // Placeholder
                definitionId: data.definitionId || '',
                name: data.name || 'Nuevo Pago',
                icon: data.icon || '📝',
                color: data.color || '#8B5CF6',
                amount: data.amount || 0,
                dueDate: data.dueDate || new Date().toISOString().split('T')[0],
                status: data.status || 'pending',
                recurrence: data.recurrence || null,
                reminderDaysBefore: data.reminderDaysBefore || 3,
                dailyReminders: data.dailyReminders || 2,
                forAccounting: data.forAccounting || false
            };
            addService(newInstance);
        }
        setIsFormModalOpen(false);
    };

    const title = showArchived ? 'Historial' : 'Próximos Pagos';

    return (
        <section className="py-4 px-4">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
                <div className="flex items-center gap-2">
                    {/* Filtros para Archivados */}
                    {showArchived && (
                        <div className="flex items-center gap-1 mr-2 border-r border-border/50 pr-2">
                            <FilterButton
                                active={filters.paid}
                                onClick={() => toggleFilter('paid')}
                                icon={<CheckCircle size={18} />}
                                colorClass="text-green-500"
                                title="Pagados"
                            />
                            <FilterButton
                                active={filters.overdue}
                                onClick={() => toggleFilter('overdue')}
                                icon={<AlertCircle size={18} />}
                                colorClass="text-red-500"
                                title="Vencidos"
                            />
                            <FilterButton
                                active={filters.cancelled}
                                onClick={() => toggleFilter('cancelled')}
                                icon={<XCircle size={18} />}
                                colorClass="text-gray-400"
                                title="Cancelados"
                            />
                        </div>
                    )}

                    {/* Toggle View */}
                    <button
                        onClick={handleViewChange}
                        className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        title={viewMode === 'feed' ? "Cambiar a vista compacta" : "Cambiar a vista detallada"}
                    >
                        {viewMode === 'feed' ? <LayoutGrid size={20} /> : <LayoutList size={20} />}
                    </button>

                    {/* Toggle Show/Hide */}
                    <button
                        onClick={() => setIsHidden(!isHidden)}
                        className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        {isHidden ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>
            </div>

            {!isHidden && (
                <div className="min-h-[100px]">
                    {viewMode === 'feed' ? (
                        /* FEED VIEW (Vertical List) */
                        <div className="flex flex-col gap-3">
                            {visibleServices.map(service => {
                                const def = serviceDefinitions.find(d => d.id === service.definitionId);
                                const effectiveService = def ? { ...service, color: def.color, icon: def.icon } : service;
                                return (
                                    <ServiceInstanceFeedItem
                                        key={service.id}
                                        service={effectiveService}
                                        onClick={() => handleCardClick(service)}
                                        onEdit={() => handleEditClick(service)}
                                        onDelete={() => handleDeleteClick(service)}
                                        isMenuOpen={activeMenuId === service.id}
                                        onToggleMenu={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === service.id ? null : service.id);
                                        }}
                                    />
                                );
                            })}
                            {visibleServices.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground text-sm">
                                    No hay pagos pendientes
                                </div>
                            )}
                        </div>
                    ) : (
                        /* STORIES VIEW (Horizontal Scroll) -> Now Responsive Grid */
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-4 pt-2 pb-4">
                            {visibleServices.map(service => {
                                const def = serviceDefinitions.find(d => d.id === service.definitionId);
                                const effectiveService = def ? { ...service, color: def.color, icon: def.icon } : service;
                                return (
                                    <ServiceInstanceStoryItem
                                        key={service.id}
                                        service={effectiveService}
                                        onClick={() => handleCardClick(service)}
                                        onEdit={() => handleEditClick(service)}
                                        onDelete={() => handleDeleteClick(service)}
                                        isMenuOpen={activeMenuId === service.id}
                                        onToggleMenu={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === service.id ? null : service.id);
                                        }}
                                    />
                                );
                            })}
                            {visibleServices.length === 0 && (
                                <div className="w-full text-center py-4 text-muted-foreground text-xs">
                                    Vacío
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={editingInstance ? 'Editar Pago' : 'Nuevo Pago'}
            >
                <ServiceInstanceForm
                    initialData={editingInstance}
                    onSave={handleSave}
                    onCancel={() => setIsFormModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Detalles"
            >
                {selectedInstanceDetails && (
                    <ServiceInstanceDetails
                        instance={selectedInstanceDetails}
                        onClose={() => setIsDetailsModalOpen(false)}
                    />
                )}
            </Modal>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                type="warning"
                title="¿Eliminar?"
                message={`Se eliminará "${confirmDialog.instance?.name}".`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDialog({ isOpen: false, instance: null })}
            />
        </section>
    );
}

// --- Subcomponents ---

function FilterButton({ active, onClick, icon, colorClass, title }: { active?: boolean, onClick: () => void, icon: React.ReactNode, colorClass: string, title: string }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={cn(
                "p-1.5 rounded-md transition-all",
                active
                    ? `bg-opacity-15 ${colorClass.replace('text-', 'bg-')} ${colorClass}`
                    : `${colorClass} hover:bg-accent opacity-70 hover:opacity-100`
            )}
        >
            {icon}
        </button>
    );
}

function ServiceInstanceFeedItem({
    service,
    onClick,
    onEdit,
    onDelete,
    isMenuOpen,
    onToggleMenu
}: {
    service: ServiceInstance;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isMenuOpen: boolean;
    onToggleMenu: (e: React.MouseEvent) => void;
}) {
    const isImage = (icon: string) => icon?.startsWith('data:image') || icon?.startsWith('http') || icon?.startsWith('/');

    // Calcular días restantes
    const today = new Date();
    const due = new Date(service.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let statusColor = "text-muted-foreground";
    let statusText = `${diffDays} días`;

    if (diffDays < 0) {
        statusColor = "text-red-500 font-medium";
        statusText = `Venció hace ${Math.abs(diffDays)} días`;
    } else if (diffDays === 0) {
        statusColor = "text-orange-500 font-bold";
        statusText = "Vence hoy";
    } else if (diffDays <= 3) {
        statusColor = "text-orange-400";
        statusText = `Vence en ${diffDays} días`;
    }

    // Color del título y borde según estado
    let titleColor = "text-foreground";
    let borderColor = "border-border/50";

    if (service.status === 'paid') {
        titleColor = "text-green-600";
        borderColor = "border-green-500/50";
    } else if (service.status === 'overdue') {
        titleColor = "text-red-500";
        borderColor = "border-red-500/50";
    } else if (service.status === 'cancelled') {
        titleColor = "text-muted-foreground line-through";
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex items-center gap-4 p-4 bg-card hover:bg-accent/50 rounded-2xl border shadow-sm transition-all active:scale-[0.99] cursor-pointer",
                borderColor
            )}
        >
            {/* Icon */}
            <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner"
                style={{ backgroundColor: `${service.color}15`, color: service.color }}
            >
                {isImage(service.icon) ? (
                    <img src={service.icon} alt="" className="w-8 h-8 object-contain" />
                ) : (
                    service.icon
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className={cn("font-semibold truncate transition-colors", titleColor)}>{service.name}</h3>
                <div className="flex items-center gap-3 text-xs mt-0.5">
                    <span className={cn("flex items-center gap-1", statusColor)}>
                        <Calendar size={12} />
                        {statusText}
                    </span>
                    {service.forAccounting && (
                        <span className="flex items-center gap-1 text-blue-400 font-medium" title="Incluido en contabilidad">
                            <FileText size={12} />
                            <span className="hidden sm:inline">Contabilidad</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Amount & Action */}
            <div className="relative flex flex-col items-end gap-1">
                <span className="font-bold text-foreground flex items-center">
                    <DollarSign size={14} className="text-muted-foreground" />
                    {service.amount.toLocaleString()}
                </span>

                {/* Menu Trigger */}
                <button
                    onClick={onToggleMenu}
                    className={cn(
                        "p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors",
                        isMenuOpen && "bg-accent text-foreground"
                    )}
                >
                    <MoreVertical size={20} />
                </button>

                {/* Dropdown Menu - Horizontal Icons Style (Left expansion) */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 10, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 10, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-0 right-10 z-50 flex flex-row gap-2 items-center py-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center text-red-500 shadow-md hover:scale-110 transition-transform"
                                title="Eliminar"
                            >
                                <Trash2 size={16} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center text-primary shadow-md hover:scale-110 transition-transform"
                                title="Editar"
                            >
                                <Pencil size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ServiceInstanceStoryItem({
    service,
    onClick,
    onEdit,
    onDelete,
    isMenuOpen,
    onToggleMenu
}: {
    service: ServiceInstance;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isMenuOpen: boolean;
    onToggleMenu: (e: React.MouseEvent) => void;
}) {
    const isImage = (icon: string) => icon?.startsWith('data:image') || icon?.startsWith('http') || icon?.startsWith('/');

    // Status Border Color
    let ringColor = "ring-primary/30"; // Default
    if (service.status === 'paid') ringColor = "ring-green-500";
    else if (service.status === 'overdue') ringColor = "ring-red-500";

    // Color del título según estado
    let titleColor = "text-muted-foreground";
    if (service.status === 'paid') titleColor = "text-green-600";
    else if (service.status === 'overdue') titleColor = "text-red-500";
    else if (service.status === 'cancelled') titleColor = "text-muted-foreground line-through";

    return (
        <div
            onClick={onClick}
            className="snap-center flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group relative"
        >
            <div className={cn(
                "w-16 h-16 rounded-full p-1 ring-2 ring-offset-2 ring-offset-background transition-all group-active:scale-95 relative",
                ringColor
            )}>
                <div
                    className="w-full h-full rounded-full flex items-center justify-center text-2xl bg-card shadow-sm overflow-hidden"
                    style={{ backgroundColor: `${service.color}10` }}
                >
                    {isImage(service.icon) ? (
                        <img src={service.icon} alt="" className="w-8 h-8 object-cover" />
                    ) : (
                        service.icon
                    )}
                </div>
                {/* Accounting Indicator */}
                {service.forAccounting && (
                    <div className="absolute -bottom-1 -left-1 bg-blue-500 text-white rounded-full p-1 border-2 border-background shadow-sm" title="Contabilidad">
                        <FileText size={10} />
                    </div>
                )}
            </div>

            {/* Context Menu Trigger (Top Right of Icon) - Always visible on mobile/touch, subtle on desktop */}
            <button
                onClick={onToggleMenu}
                className={cn(
                    "absolute top-0 right-0 -mr-2 -mt-2 w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground shadow-sm transition-all z-10",
                    "opacity-100 sm:opacity-0 sm:group-hover:opacity-100", // Visible siempre en móvil, hover en desktop
                    isMenuOpen && "opacity-100 ring-2 ring-primary/20" // Siempre visible si está abierto
                )}
            >
                <MoreVertical size={14} />
            </button>

            {/* Dropdown Menu - Vertical Icons Style */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-6 right-0 -mr-2 z-50 flex flex-col gap-2 pt-2 items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center text-primary shadow-md hover:scale-110 transition-transform"
                            title="Editar"
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center text-red-500 shadow-md hover:scale-110 transition-transform"
                            title="Eliminar"
                        >
                            <Trash2 size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <span className={cn("text-[10px] font-medium text-center truncate w-full px-1", titleColor)}>
                {service.name}
            </span>
        </div>
    );
}
