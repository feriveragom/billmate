'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/store';
import { ServiceDefinition } from '@/lib/types';
import InfiniteCarousel from './InfiniteCarousel';
import Modal from './Modal';
import ServiceDefinitionForm from './ServiceDefinitionForm';
import ConfirmDialog from './ConfirmDialog';

export default function QuickActions() {
    const { services, serviceDefinitions, addServiceDefinition, updateServiceDefinition, deleteServiceDefinition } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDefinition, setEditingDefinition] = useState<ServiceDefinition | null>(null);
    const [selectedColor, setSelectedColor] = useState('#8B5CF6');
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; definition: ServiceDefinition | null }>({
        isOpen: false,
        definition: null
    });

    const pendingCount = services.filter(s => s.status === 'pending').length;
    const overdueCount = services.filter(s => s.status === 'overdue').length;

    // Convertir HSL a HEX
    const hslToHex = (h: number, s: number, l: number): string => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    };

    // Generar color único basado en distribución golden ratio
    const generateUniqueColor = (index: number): string => {
        const goldenAngle = 137.508;
        const hue = (index * goldenAngle) % 360;
        const saturation = 70;
        const lightness = 58;
        return hslToHex(hue, saturation, lightness);
    };

    // Función para sugerir un color único que no esté en uso
    const suggestNewColor = (): string => {
        const usedColors = serviceDefinitions.map(def => def.color.toLowerCase());
        let colorIndex = 0;
        let newColor = generateUniqueColor(colorIndex);

        while (usedColors.includes(newColor.toLowerCase()) && colorIndex < 1000) {
            colorIndex++;
            newColor = generateUniqueColor(colorIndex);
        }

        return newColor;
    };

    const getCount = (type: string) => {
        switch (type) {
            case 'payments':
                return services.length;
            case 'upcoming':
                return pendingCount;
            case 'alerts':
                return overdueCount;
            default:
                return 0;
        }
    };

    const handleAddClick = () => {
        setEditingDefinition(null);
        setSelectedColor(suggestNewColor());
        setIsModalOpen(true);
    };

    const handleEditClick = (definition: ServiceDefinition) => {
        setEditingDefinition(definition);
        setSelectedColor(definition.color);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (e: React.MouseEvent, definition: ServiceDefinition) => {
        e.stopPropagation();
        setConfirmDialog({ isOpen: true, definition });
    };

    const handleConfirmDelete = () => {
        if (confirmDialog.definition) {
            deleteServiceDefinition(confirmDialog.definition.id);
        }
        setConfirmDialog({ isOpen: false, definition: null });
    };

    const handleCancelDelete = () => {
        setConfirmDialog({ isOpen: false, definition: null });
    };

    const handleSave = (data: Partial<ServiceDefinition>) => {
        if (editingDefinition) {
            updateServiceDefinition(editingDefinition.id, { ...data, color: selectedColor });
        } else {
            const newDefinition: ServiceDefinition = {
                id: `def-${Date.now()}`,
                name: data.name || 'Nuevo Servicio',
                icon: data.icon || '📝',
                title: data.title || '',
                scheduleMode: data.scheduleMode || 'fixed',
                fixedDay: data.fixedDay,
                rollingDays: data.rollingDays,
                reminderDays: data.reminderDays || 3,
                dueTime: data.dueTime || '12:00',
                category: data.category || 'General',
                color: selectedColor
            };
            addServiceDefinition(newDefinition);
        }
        setIsModalOpen(false);
    };

    const allItems = [
        { id: 'add', type: 'add', label: 'Nuevo', icon: '➕', isPrimary: true },
        ...serviceDefinitions.map(def => ({ ...def, kind: 'definition' }))
    ];

    return (
        <section className="px-4 py-4">
            <InfiniteCarousel
                items={allItems}
                renderItem={(item: any) => {
                    if (item.type === 'add') {
                        return (
                            <button
                                onClick={handleAddClick}
                                className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-elixir text-white shadow-lg transform transition hover:scale-105 active:scale-95"
                            >
                                <Plus size={28} />
                                <span className="text-xs mt-1">{item.label}</span>
                            </button>
                        );
                    }

                    if (item.kind === 'definition') {
                        return (
                            <ServiceDefinitionCard
                                name={item.name}
                                icon={item.icon}
                                title={item.title}
                                color={item.color}
                                isSystemService={item.isSystemService}
                                onClick={() => handleEditClick(item)}
                                onDelete={(e) => handleDeleteClick(e, item)}
                            />
                        );
                    }

                    return (
                        <ActionCard
                            icon={item.icon}
                            label={item.label}
                            count={getCount(item.type)}
                        />
                    );
                }}
                itemWidth={80}
                gap={12}
                align="start"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingDefinition ? 'Editar Servicio' : 'Nuevo Servicio'}
                colorPicker={
                    <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-white/20"
                        title="Color de etiqueta"
                    />
                }
            >
                <ServiceDefinitionForm
                    initialData={editingDefinition}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    currentColor={selectedColor}
                    onColorChange={setSelectedColor}
                />
            </Modal>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                type="warning"
                title="¿Eliminar servicio?"
                message={`Estás a punto de eliminar "${confirmDialog.definition?.name}".\n\nEsta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </section>
    );
}

function ActionCard({ icon, label, count }: { icon: string; label: string; count: number }) {
    return (
        <button className="flex-shrink-0 relative flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-card border border-primary/20 hover:border-primary/40 transition shadow-soft">
            <div className="text-2xl">{icon}</div>
            <span className="text-xs mt-1 text-foreground">{label}</span>
            {count > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-accent text-primary-dark text-xs font-bold rounded-full flex items-center justify-center">
                    {count}
                </span>
            )}
        </button>
    );
}

function ServiceDefinitionCard({ name, icon, title, color, isSystemService, onClick, onDelete }: {
    name: string;
    icon: string;
    title: string;
    color?: string;
    isSystemService?: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
}) {
    const isImage = (icon: string) => icon?.startsWith('data:image') || icon?.startsWith('http') || icon?.startsWith('/');

    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            className="flex-shrink-0 relative group flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-card border border-primary/20 hover:border-primary/40 transition shadow-soft hover:scale-105 active:scale-95 cursor-pointer"
            style={{ borderLeftColor: color, borderLeftWidth: color ? '3px' : '1px' }}
            title={title}
        >
            {/* Botón de eliminar - solo si NO es servicio del sistema */}
            {!isSystemService && (
                <button
                    onClick={onDelete}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Eliminar servicio"
                >
                    <Trash2 size={12} />
                </button>
            )}

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
