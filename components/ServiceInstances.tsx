'use client';

import { useState } from 'react';
import { Plus, LayoutGrid, ArrowRightLeft, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/store';
import { ServiceInstance } from '@/lib/types';
import HorizontalScroll from './HorizontalScroll';
import Modal from './Modal';
import ServiceInstanceForm from './ServiceInstanceForm';
import ServiceInstanceDetails from './ServiceInstanceDetails';
import ConfirmDialog from './ConfirmDialog';

interface ServiceInstancesProps {
    showArchived?: boolean;
}

export default function ServiceInstances({ showArchived = false }: ServiceInstancesProps) {
    const { services, addService, updateService, deleteService } = useApp();
    const [isGridView, setIsGridView] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    // Estado para Crear/Editar
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingInstance, setEditingInstance] = useState<ServiceInstance | null>(null);

    // Estado para Detalles
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedInstanceDetails, setSelectedInstanceDetails] = useState<ServiceInstance | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; instance: ServiceInstance | null }>({
        isOpen: false,
        instance: null
    });

    const handleViewChange = () => {
        setIsGridView(!isGridView);
        if (isHidden) setIsHidden(false);
    };

    const handleAddClick = () => {
        setEditingInstance(null);
        setIsFormModalOpen(true);
    };

    // Click en el cuerpo de la tarjeta -> Ver Detalles
    const handleCardClick = (instance: ServiceInstance) => {
        setSelectedInstanceDetails(instance);
        setIsDetailsModalOpen(true);
    };

    // Click en botón editar -> Editar
    const handleEditClick = (instance: ServiceInstance) => {
        setEditingInstance(instance);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (e: React.MouseEvent, instance: ServiceInstance) => {
        e.stopPropagation();
        setConfirmDialog({ isOpen: true, instance });
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

    const title = showArchived ? 'PAGOS ARCHIVADOS' : 'ALERTAS PROGRAMADAS';

    return (
        <section className="py-4 px-4">
            <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-semibold text-foreground/60">{title}</h2>
                <div className="flex items-center gap-2">
                    {/* Toggle Horizontal/Grid */}
                    <button
                        onClick={handleViewChange}
                        className="p-1.5 hover:bg-primary/10 rounded-lg transition text-primary/80"
                        title={isGridView ? "Vista horizontal" : "Vista de cuadrícula"}
                    >
                        {isGridView ? <ArrowRightLeft size={20} /> : <LayoutGrid size={20} />}
                    </button>

                    {/* Toggle Show/Hide */}
                    <button
                        onClick={() => setIsHidden(!isHidden)}
                        className="p-1.5 hover:bg-primary/10 rounded-lg transition text-primary/80"
                        title={isHidden ? "Mostrar pagos" : "Ocultar pagos"}
                    >
                        {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            {!isHidden && (isGridView ? (
                /* Grid View - Cards en cuadrícula (Igual que ServiceDefinitions) */
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-1 p-1">
                    {/* NOTA: No mostramos botón "Nuevo" en el grid de instancias según requerimiento */}

                    {services.map(service => (
                        <ServiceInstanceCard
                            key={service.id}
                            name={service.name}
                            icon={service.icon}
                            color={service.color}
                            onClick={() => handleCardClick(service)}
                            onEdit={() => handleEditClick(service)}
                            onDelete={(e) => handleDeleteClick(e, service)}
                            className="w-full h-full aspect-square"
                        />
                    ))}
                </div>
            ) : (
                /* Horizontal Scroll View */
                <HorizontalScroll>
                    {services.map(service => (
                        <ServiceInstanceCard
                            key={service.id}
                            name={service.name}
                            icon={service.icon}
                            color={service.color}
                            onClick={() => handleCardClick(service)}
                            onEdit={() => handleEditClick(service)}
                            onDelete={(e) => handleDeleteClick(e, service)}
                        />
                    ))}
                </HorizontalScroll>
            ))}

            {/* Modal de Formulario (Crear/Editar) */}
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

            {/* Modal de Detalles */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Detalles del Pago"
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
                title="¿Eliminar pago?"
                message={`Estás a punto de eliminar el pago "${confirmDialog.instance?.name}".\n\nEsta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDialog({ isOpen: false, instance: null })}
            />
        </section>
    );
}

function ServiceInstanceCard({
    name,
    icon,
    color,
    onClick,
    onEdit,
    onDelete,
    className
}: {
    name: string;
    icon: string;
    color: string;
    onClick?: () => void;
    onEdit: () => void;
    onDelete: (e: React.MouseEvent) => void;
    className?: string;
}) {
    const isImage = (icon: string) => icon?.startsWith('data:image') || icon?.startsWith('http') || icon?.startsWith('/');

    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            className={`flex-shrink-0 relative group/card flex flex-col items-center justify-center w-20 h-24 rounded-lg bg-card border border-primary/10 hover:border-primary/30 transition hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${className || ''}`}
            style={{
                borderLeftColor: color,
                borderLeftWidth: '3px',
                // Recorte para efecto dog-ear (esquina superior derecha)
                clipPath: 'polygon(0 0, 70% 0, 100% 20%, 100% 100%, 0 100%)'
            }}
            title={name}
        >
            {/* Triángulo del doblez (dog-ear) */}
            <div
                className="absolute top-0 right-0 w-[30%] h-[20%] bg-primary/10 rounded-bl-lg"
                style={{
                    background: `linear-gradient(to bottom left, transparent 50%, ${color}20 50%)`
                }}
            ></div>

            {/* Botones de acción - alineados a la izquierda */}
            <div className="absolute top-1 left-1 flex gap-1 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="w-5 h-5 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition"
                    title="Editar pago"
                >
                    <Pencil size={10} />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(e);
                    }}
                    className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition"
                    title="Eliminar pago"
                >
                    <Trash2 size={10} />
                </button>
            </div>

            {/* Icono - puede ser emoji o imagen */}
            {isImage(icon) ? (
                <div className="w-9 h-9 flex items-center justify-center overflow-hidden rounded-lg mb-2 mt-2">
                    <img src={icon} alt={name} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="text-2xl mb-2 mt-2">{icon}</div>
            )}

            <span className="text-[10px] font-medium text-foreground/80 truncate w-full px-1 text-center leading-tight">{name}</span>
        </div>
    );
}
