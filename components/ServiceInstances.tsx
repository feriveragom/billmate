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
    DollarSign 
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { ServiceInstance, ServiceStatus } from '@/lib/types';
import Modal from './Modal';
import ServiceInstanceForm from './ServiceInstanceForm';
import ServiceInstanceDetails from './ServiceInstanceDetails';
import ConfirmDialog from './ConfirmDialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceInstancesProps {
    showArchived?: boolean;
}

export default function ServiceInstances({ showArchived = false }: ServiceInstancesProps) {
    const { services, addService, updateService, deleteService } = useApp();

    // Filtros locales para la vista de archivados
    const [filters, setFilters] = useState<{ [key in ServiceStatus]?: boolean }>({
        paid: true,
        overdue: true,
        cancelled: true
    });

    const toggleFilter = (status: ServiceStatus) => {
        setFilters(prev => ({ ...prev, [status]: !prev[status] }));
    };

    // Filtrar servicios según la vista y los filtros activos
    const visibleServices = services.filter(service => {
        if (showArchived) {
            const isArchivedStatus = service.status === 'paid' || service.status === 'overdue' || service.status === 'cancelled';
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
                definitionId: data.definitionId || '',
                name: data.name || 'Nuevo Pago',
                icon: data.icon || '📝',
                color: data.color || '#8B5CF6',
                amount: data.amount || 0,
                dueDate: data.dueDate || new Date().toISOString().split('T')[0],
                status: data.status || 'pending',
                recurrence: data.recurrence || null,
                reminderDaysBefore: data.reminderDaysBefore || 3,
                dailyReminders: data.dailyReminders || 2
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
                            />
                            <FilterButton 
                                active={filters.overdue} 
                                onClick={() => toggleFilter('overdue')} 
                                icon={<AlertCircle size={18} />} 
                                colorClass="text-red-500" 
                            />
                            <FilterButton 
                                active={filters.cancelled} 
                                onClick={() => toggleFilter('cancelled')} 
                                icon={<XCircle size={18} />} 
                                colorClass="text-gray-400" 
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
                        {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            {!isHidden && (
                <div className="min-h-[100px]">
                    {viewMode === 'feed' ? (
                        /* FEED VIEW (Vertical List) */
                        <div className="flex flex-col gap-3 pb-20">
                            {visibleServices.map(service => (
                                <ServiceInstanceFeedItem
                                    key={service.id}
                                    service={service}
                                    onClick={() => handleCardClick(service)}
                                    onEdit={() => handleEditClick(service)}
                                    onDelete={() => handleDeleteClick(service)}
                                    isMenuOpen={activeMenuId === service.id}
                                    onToggleMenu={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(activeMenuId === service.id ? null : service.id);
                                    }}
                                />
                            ))}
                            {visibleServices.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground text-sm">
                                    No hay pagos pendientes
                                </div>
                            )}
                        </div>
                    ) : (
                        /* STORIES VIEW (Horizontal Scroll) */
                        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-hide">
                            {visibleServices.map(service => (
                                <ServiceInstanceStoryItem
                                    key={service.id}
                                    service={service}
                                    onClick={() => handleCardClick(service)}
                                />
                            ))}
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

function FilterButton({ active, onClick, icon, colorClass }: { active?: boolean, onClick: () => void, icon: React.ReactNode, colorClass: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-1.5 rounded-md transition-all",
                active ? `bg-opacity-10 ${colorClass.replace('text-', 'bg-')} ${colorClass}` : "text-muted-foreground hover:text-foreground"
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

    return (
        <div 
            onClick={onClick}
            className="group relative flex items-center gap-4 p-4 bg-card hover:bg-accent/50 rounded-2xl border border-border/50 shadow-sm transition-all active:scale-[0.99]"
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
                <h3 className="font-semibold text-foreground truncate">{service.name}</h3>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                    <span className={cn("flex items-center gap-1", statusColor)}>
                        <Calendar size={12} />
                        {statusText}
                    </span>
                </div>
            </div>

            {/* Amount & Action */}
            <div className="flex flex-col items-end gap-1">
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
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-4 top-12 z-50 min-w-[150px] bg-popover border border-border rounded-xl shadow-xl overflow-hidden flex flex-col p-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors text-left w-full"
                        >
                            <Pencil size={16} className="text-primary" /> 
                            <span>Editar</span>
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left w-full"
                        >
                            <Trash2 size={16} /> 
                            <span>Eliminar</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ServiceInstanceStoryItem({
    service,
    onClick
}: {
    service: ServiceInstance;
    onClick: () => void;
}) {
    const isImage = (icon: string) => icon?.startsWith('data:image') || icon?.startsWith('http') || icon?.startsWith('/');
    
    // Status Border Color
    const today = new Date();
    const due = new Date(service.dueDate);
    const isOverdue = due < today && due.getDate() !== today.getDate();
    
    let ringColor = "ring-primary/30"; // Default
    if (isOverdue) ringColor = "ring-red-500";
    else if (service.status === 'paid') ringColor = "ring-green-500";

    return (
        <div 
            onClick={onClick}
            className="snap-center flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group relative"
        >
            <div className={cn(
                "w-16 h-16 rounded-full p-1 ring-2 ring-offset-2 ring-offset-background transition-all group-active:scale-95",
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
            </div>
            
            {/* Indicador visual de que es clickeable/editable (opcional, pero ayuda) */}
            <div className="absolute top-0 right-1 w-4 h-4 bg-background rounded-full border border-border flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={10} className="text-muted-foreground" />
            </div>

            <span className="text-[10px] font-medium text-muted-foreground text-center truncate w-full px-1">
                {service.name}
            </span>
        </div>
    );
}
