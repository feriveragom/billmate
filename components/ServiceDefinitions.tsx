'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, LayoutGrid, ArrowRightLeft, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/lib/store';
import { ServiceDefinition, ServiceInstance } from '@/lib/types';
import Modal from './Modal';
import ServiceDefinitionForm from './ServiceDefinitionForm';
import ServiceInstanceForm from './ServiceInstanceForm';
import ConfirmDialog from './ConfirmDialog';
import HorizontalScroll from './HorizontalScroll';

export default function ServiceDefinitions() {
    const { serviceDefinitions, addServiceDefinition, updateServiceDefinition, deleteServiceDefinition, addService } = useApp();

    // Estado para Definiciones (Crear/Editar tipo de servicio)
    const [isDefModalOpen, setIsDefModalOpen] = useState(false);
    const [editingDefinition, setEditingDefinition] = useState<ServiceDefinition | null>(null);
    const [selectedColor, setSelectedColor] = useState('#8B5CF6');

    // Estado para Instancias (Crear pago)
    const [isInstanceModalOpen, setIsInstanceModalOpen] = useState(false);
    const [selectedDefForInstance, setSelectedDefForInstance] = useState<ServiceDefinition | null>(null);

    // Estado de UI
    const [isGridView, setIsGridView] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
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

    // --- Handlers para Definiciones ---

    const handleAddDefClick = () => {
        setEditingDefinition(null);
        setSelectedColor(suggestNewColor());
        setIsDefModalOpen(true);
    };

    const handleEditDefClick = (definition: ServiceDefinition) => {
        setEditingDefinition(definition);
        setSelectedColor(definition.color);
        setIsDefModalOpen(true);
    };

    const handleSaveDef = (data: Partial<ServiceDefinition>) => {
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
        setIsDefModalOpen(false);
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

    // --- Handlers para Instancias (Pagos) ---

    const handleCardClick = (definition: ServiceDefinition) => {
        setSelectedDefForInstance(definition);
        setIsInstanceModalOpen(true);
    };

    const handleSaveInstance = (data: Partial<ServiceInstance>) => {
        if (selectedDefForInstance) {
            const newInstance: ServiceInstance = {
                id: `inst-${Date.now()}`,
                definitionId: selectedDefForInstance.id,
                name: data.name || selectedDefForInstance.name,
                amount: data.amount || 0,
                dueDate: data.dueDate || new Date().toISOString().split('T')[0],
                status: 'pending', // Siempre nace pendiente
                recurrence: data.recurrence || null,
                reminderDaysBefore: data.reminderDaysBefore || 3,
                dailyReminders: data.dailyReminders || 2,
                externalPaymentId: data.externalPaymentId,

                // Cache visual
                icon: selectedDefForInstance.icon,
                color: selectedDefForInstance.color
            };
            addService(newInstance);
            setIsInstanceModalOpen(false);
            setSelectedDefForInstance(null);
        }
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
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-1 p-1">
                    {/* Botón Nuevo (Estilo Carpeta) */}
                    <div
                        onClick={handleAddDefClick}
                        className="relative group/card mt-2 flex flex-col items-start cursor-pointer transition hover:scale-105 active:scale-95"
                    >
                        <div className="h-3 w-10 bg-primary rounded-t-lg ml-0 z-20 relative top-[1px]"></div>
                        <div className="relative z-10 flex flex-col items-center justify-center w-20 h-20 bg-gradient-elixir text-white rounded-b-xl rounded-tr-xl rounded-tl-none shadow-lg">
                            <Plus size={28} />
                            <span className="text-xs mt-1 font-medium">Nuevo</span>
                        </div>
                    </div>

                    {/* Service Definitions */}
                    {serviceDefinitions.map(def => (
                        <ServiceDefinitionCard
                            key={def.id}
                            name={def.name}
                            icon={def.icon}
                            color={def.color}
                            isSystemService={def.isSystemService}
                            onEdit={() => handleEditDefClick(def)}
                            onDelete={(e) => handleDeleteClick(e, def)}
                            onClick={() => handleCardClick(def)}
                            className="w-full h-full aspect-square"
                        />
                    ))}
                </div>
            ) : (
                /* Horizontal Scroll View */
                <HorizontalScroll>
                    {/* Botón Nuevo (Estilo Carpeta) */}
                    <div
                        onClick={handleAddDefClick}
                        className="flex-shrink-0 relative group/card mt-2 flex flex-col items-start cursor-pointer transition hover:scale-105 active:scale-95"
                    >
                        <div className="h-3 w-10 bg-primary rounded-t-lg ml-0 z-20 relative top-[1px]"></div>
                        <div className="relative z-10 flex flex-col items-center justify-center w-20 h-20 bg-gradient-elixir text-white rounded-b-xl rounded-tr-xl rounded-tl-none shadow-lg">
                            <Plus size={28} />
                            <span className="text-xs mt-1 font-medium">Nuevo</span>
                        </div>
                    </div>

                    {/* Service Definitions */}
                    {serviceDefinitions.map(def => (
                        <ServiceDefinitionCard
                            key={def.id}
                            name={def.name}
                            icon={def.icon}
                            color={def.color}
                            isSystemService={def.isSystemService}
                            onEdit={() => handleEditDefClick(def)}
                            onDelete={(e) => handleDeleteClick(e, def)}
                            onClick={() => handleCardClick(def)}
                        />
                    ))}
                </HorizontalScroll>
            ))}

            {/* Modal para Crear/Editar Definición (Tipo de Servicio) */}
            <Modal
                isOpen={isDefModalOpen}
                onClose={() => setIsDefModalOpen(false)}
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
                    onSave={handleSaveDef}
                    onCancel={() => setIsDefModalOpen(false)}
                    currentColor={selectedColor}
                    onColorChange={setSelectedColor}
                />
            </Modal>

            {/* Modal para Crear Instancia (Pago Real) */}
            <Modal
                isOpen={isInstanceModalOpen}
                onClose={() => setIsInstanceModalOpen(false)}
                title="Crear Nuevo Pago"
            >
                {selectedDefForInstance && (
                    <ServiceInstanceForm
                        definition={selectedDefForInstance}
                        onSave={handleSaveInstance}
                        onCancel={() => setIsInstanceModalOpen(false)}
                    />
                )}
            </Modal>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                type="warning"
                title="¿Eliminar servicio?"
                message={`Estás a punto de eliminar "${confirmDialog.definition?.name}".\n\nEsta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDialog({ isOpen: false, definition: null })}
            />
        </section>
    );
}

function ServiceDefinitionCard({ name, icon, color, isSystemService, onEdit, onDelete, onClick, className }: {
    name: string;
    icon: string;
    color?: string;
    isSystemService?: boolean;
    onEdit: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onClick?: () => void;
    className?: string;
}) {
    const isImage = (icon: string) => icon?.startsWith('data:image') || icon?.startsWith('http') || icon?.startsWith('/');

    return (
        <div
            onClick={onClick}
            className={`relative group/card mt-2 flex flex-col items-start cursor-pointer transition hover:scale-105 active:scale-95 ${className || ''}`}
            title={name}
        >
            {/* Pestaña de la carpeta */}
            <div
                className="h-3 w-10 bg-card border-t border-l border-r border-primary/20 rounded-t-lg ml-0 z-20 relative top-[1px]"
                style={{ backgroundColor: color ? `${color}15` : undefined, borderColor: color ? `${color}40` : undefined }}
            ></div>

            {/* Cuerpo de la carpeta */}
            <div
                className="relative z-10 flex flex-col items-center justify-center w-20 h-20 bg-card border border-primary/20 rounded-b-xl rounded-tr-xl rounded-tl-none shadow-sm"
                style={{
                    borderTopColor: color ? `${color}40` : undefined,
                    borderLeftColor: color ? `${color}40` : undefined,
                    backgroundColor: color ? `${color}05` : undefined
                }}
            >
                {/* Botones de acción - alineados a la derecha */}
                <div className="absolute top-1 right-1 flex gap-1 z-20">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="w-5 h-5 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm"
                        title="Editar servicio"
                    >
                        <Pencil size={12} />
                    </button>

                    {/* Botón de eliminar - solo si NO es servicio del sistema */}
                    {!isSystemService && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(e);
                            }}
                            className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm"
                            title="Eliminar servicio"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>

                {/* Icono - puede ser emoji o imagen */}
                {isImage(icon) ? (
                    <div className="w-9 h-9 flex items-center justify-center overflow-hidden rounded-lg mb-1">
                        <img src={icon} alt={name} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="text-2xl mb-1">{icon}</div>
                )}

                <span className="text-[10px] font-medium text-foreground/80 truncate w-full px-1 text-center leading-tight">{name}</span>
            </div>
        </div>
    );
}
