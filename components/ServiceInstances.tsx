'use client';

import { useState } from 'react';
import { Plus, LayoutGrid, ArrowRightLeft, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/lib/store';
import { ServiceInstance } from '@/lib/types';
import HorizontalScroll from './HorizontalScroll';
import Modal from './Modal';
import ServiceInstanceForm from './ServiceInstanceForm';

interface ServiceInstancesProps {
    showArchived?: boolean;
}

export default function ServiceInstances({ showArchived = false }: ServiceInstancesProps) {
    const { services, addService, updateService } = useApp();
    const [isGridView, setIsGridView] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstance, setEditingInstance] = useState<ServiceInstance | null>(null);

    const handleViewChange = () => {
        setIsGridView(!isGridView);
        if (isHidden) setIsHidden(false);
    };

    const handleAddClick = () => {
        setEditingInstance(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (instance: ServiceInstance) => {
        setEditingInstance(instance);
        setIsModalOpen(true);
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
                status: data.status || 'pending'
            };
            addService(newInstance);
        }
        setIsModalOpen(false);
    };

    const title = showArchived ? 'PAGOS ARCHIVADOS' : 'PRÓXIMOS PAGOS';

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
                /* Grid View - Rectángulos apilados */
                <div className="space-y-3">
                    {services.map(service => (
                        <ServiceInstanceRectangle
                            key={service.id}
                            {...service}
                            onClick={() => handleEditClick(service)}
                        />
                    ))}
                </div>
            ) : (
                /* Horizontal Scroll View */
                <HorizontalScroll>
                    {/* Botón Nuevo */}
                    <button
                        onClick={handleAddClick}
                        className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-elixir text-white shadow-lg transform transition hover:scale-105 active:scale-95"
                    >
                        <Plus size={28} />
                        <span className="text-xs mt-1">Nuevo</span>
                    </button>

                    {services.map(service => (
                        <ServiceInstanceCard
                            key={service.id}
                            name={service.name}
                            icon={service.icon}
                            color={service.color}
                            onClick={() => handleEditClick(service)}
                        />
                    ))}
                </HorizontalScroll>
            ))}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingInstance ? 'Editar Pago' : 'Nuevo Pago'}
            >
                <ServiceInstanceForm
                    initialData={editingInstance}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </section>
    );
}

function ServiceInstanceCard({ 
    name, 
    icon, 
    color,
    onClick,
    className 
}: {
    name: string;
    icon: string;
    color: string;
    onClick?: () => void;
    className?: string;
}) {
    const isImage = (icon: string) => icon?.startsWith('data:image') || icon?.startsWith('http') || icon?.startsWith('/');

    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            className={`flex-shrink-0 relative group flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-card border border-primary/20 hover:border-primary/40 transition hover:scale-105 active:scale-95 cursor-pointer ${className || ''}`}
            style={{ borderLeftColor: color, borderLeftWidth: color ? '3px' : '1px' }}
            title={name}
        >
            {/* Icono - puede ser emoji o imagen */}
            {isImage(icon) ? (
                <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-lg">
                    <img src={icon} alt={name} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="text-2xl">{icon}</div>
            )}

            <span className="text-xs mt-1 text-foreground truncate w-full px-1 text-center">{name}</span>
        </div>
    );
}

function ServiceInstanceRectangle({ 
    name, 
    icon, 
    amount,
    dueDate,
    status,
    color,
    onClick
}: {
    name: string;
    icon: string;
    amount: number;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    color: string;
    onClick?: () => void;
}) {
    const isImage = (icon: string) => icon?.startsWith('data:image') || icon?.startsWith('http') || icon?.startsWith('/');

    const statusColors = {
        paid: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
        pending: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400',
        overdue: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
    };

    const statusLabels = {
        paid: 'Pagado',
        pending: 'Pendiente',
        overdue: 'Vencido'
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleDateString('es', { month: 'short' });
        return `${day} ${month}`;
    };

    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-primary/10 hover:border-primary/30 transition cursor-pointer"
            style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
        >
            <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-primary/5 text-3xl overflow-hidden">
                {isImage(icon) ? (
                    <img src={icon} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span>{icon}</span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground text-base mb-1">{name}</h4>
                <p className="text-xl font-bold text-primary">${amount.toFixed(2)}</p>
                <p className="text-xs text-foreground/60 mt-1">Vence: {formatDate(dueDate)}</p>
            </div>
            <div className="flex-shrink-0">
                <span className={`text-xs px-4 py-2 rounded-full border ${statusColors[status]} font-medium whitespace-nowrap`}>
                    {statusLabels[status]}
                </span>
            </div>
        </div>
    );
}
