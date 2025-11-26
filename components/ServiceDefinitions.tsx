'use client';

import { useState } from 'react';
import { Plus, Trash2, LayoutGrid, ArrowRightLeft, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/lib/store';
import { ServiceDefinition } from '@/lib/types';
import Modal from './Modal';
import ServiceDefinitionForm from './ServiceDefinitionForm';
import ConfirmDialog from './ConfirmDialog';
import HorizontalScroll from './HorizontalScroll';

export default function ServiceDefinitions() {
    const { serviceDefinitions, addServiceDefinition, updateServiceDefinition, deleteServiceDefinition } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGridView, setIsGridView] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [editingDefinition, setEditingDefinition] = useState<ServiceDefinition | null>(null);
    const [selectedColor, setSelectedColor] = useState('#8B5CF6');
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; definition: ServiceDefinition | null }>({
        isOpen: false,
        definition: null
    });

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
                category: data.category || 'General',
                color: selectedColor
            };
            addServiceDefinition(newDefinition);
        }
        setIsModalOpen(false);
    };

    const handleViewChange = () => {
        setIsGridView(!isGridView);
        if (isHidden) setIsHidden(false); // Auto-mostrar si está oculto
    };

    return (
        <section className="py-4 px-4">
            <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-semibold text-foreground/60">MIS SERVICIOS</h2>
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
                        title={isHidden ? "Mostrar servicios" : "Ocultar servicios"}
                    >
                        {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            {!isHidden && (isGridView ? (
                /* Grid View */
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 animate-in fade-in zoom-in-95 duration-200 max-h-64 overflow-y-auto custom-scrollbar p-1">
                    {/* Botón Nuevo */}
                    <button
                        onClick={handleAddClick}
                        className="flex flex-col items-center justify-center aspect-square rounded-2xl bg-gradient-elixir text-white shadow-lg transform transition hover:scale-105 active:scale-95"
                    >
                        <Plus size={28} />
                        <span className="text-xs mt-1">Nuevo</span>
                    </button>

                    {/* Service Definitions */}
                    {serviceDefinitions.map(def => (
                        <ServiceDefinitionCard
                            key={def.id}
                            name={def.name}
                            icon={def.icon}
                            color={def.color}
                            isSystemService={def.isSystemService}
                            onClick={() => handleEditClick(def)}
                            onDelete={(e) => handleDeleteClick(e, def)}
                            className="w-full h-full aspect-square"
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

                    {/* Service Definitions */}
                    {serviceDefinitions.map(def => (
                        <ServiceDefinitionCard
                            key={def.id}
                            name={def.name}
                            icon={def.icon}
                            color={def.color}
                            isSystemService={def.isSystemService}
                            onClick={() => handleEditClick(def)}
                            onDelete={(e) => handleDeleteClick(e, def)}
                        />
                    ))}
                 </HorizontalScroll>
             ))}

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

function ServiceDefinitionCard({ name, icon, color, isSystemService, onClick, onDelete, className }: {
    name: string;
    icon: string;
    color?: string;
    isSystemService?: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
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

