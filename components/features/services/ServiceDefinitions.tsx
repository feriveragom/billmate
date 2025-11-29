'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Pencil,
    LayoutGrid,
    LayoutList,
    Eye,
    EyeOff,
    MoreVertical,
    Search
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { ServiceDefinition, ServiceInstance } from '@/lib/types';
import Modal from '../../ui/Modal';
import ServiceDefinitionForm from './ServiceDefinitionForm';
import ServiceInstanceForm from '../billing/ServiceInstanceForm';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isHidden, setIsHidden] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; definition: ServiceDefinition | null }>({
        isOpen: false,
        definition: null
    });

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

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
        setActiveMenuId(null);
    };

    const handleEditDefClick = (definition: ServiceDefinition) => {
        setEditingDefinition(definition);
        setSelectedColor(definition.color);
        setIsDefModalOpen(true);
        setActiveMenuId(null);
    };

    const handleSaveDef = (data: Partial<ServiceDefinition>) => {
        if (editingDefinition) {
            updateServiceDefinition(editingDefinition.id, { ...data, color: selectedColor });
        } else {
            const newDefinition: ServiceDefinition = {
                id: `def-${Date.now()}`,
                userId: 'current-user', // Placeholder
                name: data.name || 'Nuevo Servicio',
                icon: data.icon || '📝',
                category: data.category || 'General',
                color: selectedColor
            };
            addServiceDefinition(newDefinition);
        }
        setIsDefModalOpen(false);
    };

    const handleDeleteClick = (definition: ServiceDefinition) => {
        setConfirmDialog({ isOpen: true, definition });
        setActiveMenuId(null);
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
                userId: 'current-user', // Placeholder
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
                color: selectedDefForInstance.color,
                forAccounting: false // Default value
            };
            addService(newInstance);
            setIsInstanceModalOpen(false);
            setSelectedDefForInstance(null);
        }
    };

    const handleViewChange = () => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
        if (isHidden) setIsHidden(false);
    };

    return (
        <section className="py-4 px-4">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-bold text-foreground tracking-tight">Mis Servicios</h2>
                <div className="flex items-center gap-2">
                    {/* Toggle View */}
                    <button
                        onClick={handleViewChange}
                        className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        title={viewMode === 'grid' ? "Cambiar a lista" : "Cambiar a cuadrícula"}
                    >
                        {viewMode === 'grid' ? <LayoutList size={20} /> : <LayoutGrid size={20} />}
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
                    {viewMode === 'grid' ? (
                        /* GRID VIEW (App Drawer Style) */
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-4">
                            {/* Add New Button */}
                            <button
                                onClick={handleAddDefClick}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-accent/50 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground group-hover:border-primary/50 group-hover:text-primary transition-all">
                                    <Plus size={24} />
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground text-center w-full truncate">
                                    Nuevo
                                </span>
                            </button>

                            {serviceDefinitions.map(def => (
                                <ServiceDefinitionGridItem
                                    key={def.id}
                                    definition={def}
                                    onClick={() => handleCardClick(def)}
                                    onEdit={() => handleEditDefClick(def)}
                                    onDelete={() => handleDeleteClick(def)}
                                    isMenuOpen={activeMenuId === def.id}
                                    onToggleMenu={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(activeMenuId === def.id ? null : def.id);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        /* LIST VIEW (Management Style) */
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleAddDefClick}
                                className="flex items-center gap-3 p-3 w-full bg-accent/20 hover:bg-accent/40 rounded-xl border border-dashed border-muted-foreground/30 text-muted-foreground transition-all mb-2"
                            >
                                <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center">
                                    <Plus size={20} />
                                </div>
                                <span className="font-medium text-sm">Agregar nuevo servicio</span>
                            </button>

                            {serviceDefinitions.map(def => (
                                <ServiceDefinitionListItem
                                    key={def.id}
                                    definition={def}
                                    onClick={() => handleCardClick(def)}
                                    onEdit={() => handleEditDefClick(def)}
                                    onDelete={() => handleDeleteClick(def)}
                                    isMenuOpen={activeMenuId === def.id}
                                    onToggleMenu={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(activeMenuId === def.id ? null : def.id);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
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

// --- Subcomponents ---

function ServiceDefinitionGridItem({
    definition,
    onClick,
    onEdit,
    onDelete,
    isMenuOpen,
    onToggleMenu
}: {
    definition: ServiceDefinition;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isMenuOpen: boolean;
    onToggleMenu: (e: React.MouseEvent) => void;
}) {
    const isImage = (icon: string) => icon?.startsWith('data:image') || icon?.startsWith('http') || icon?.startsWith('/');

    return (
        <div
            onClick={onClick}
            className="group flex flex-col items-center gap-2 cursor-pointer"
        >
            <div className="relative">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-border/50 group-active:scale-95 transition-transform"
                    style={{ backgroundColor: `${definition.color}15`, color: definition.color }}
                >
                    {isImage(definition.icon) ? (
                        <img src={definition.icon} alt="" className="w-8 h-8 object-contain" />
                    ) : (
                        definition.icon
                    )}
                </div>

                {/* Context Menu Trigger (Top Right of Icon) */}
                <button
                    onClick={onToggleMenu}
                    className={cn(
                        "absolute -top-2 -right-2 w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground shadow-sm transition-all z-10",
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
                            className="absolute top-6 -right-2 z-50 flex flex-col gap-2 pt-2 items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center text-primary shadow-md hover:scale-110 transition-transform"
                                title="Editar"
                            >
                                <Pencil size={14} />
                            </button>
                            {!definition.isSystemService && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                    className="w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center text-red-500 shadow-md hover:scale-110 transition-transform"
                                    title="Eliminar"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <span
                className="text-[10px] font-medium text-foreground/80 text-center w-full truncate px-1"
            >
                {definition.name}
            </span>
        </div>
    );
}

function ServiceDefinitionListItem({
    definition,
    onClick,
    onEdit,
    onDelete,
    isMenuOpen,
    onToggleMenu
}: {
    definition: ServiceDefinition;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isMenuOpen: boolean;
    onToggleMenu: (e: React.MouseEvent) => void;
}) {
    const isImage = (icon: string) => icon?.startsWith('data:image') || icon?.startsWith('http') || icon?.startsWith('/');

    return (
        <div
            onClick={onClick}
            className="group relative flex items-center gap-3 p-3 bg-card hover:bg-accent/50 rounded-xl border border-border/50 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
        >
            {/* Icon */}
            <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner"
                style={{ backgroundColor: `${definition.color}15`, color: definition.color }}
            >
                {isImage(definition.icon) ? (
                    <img src={definition.icon} alt="" className="w-6 h-6 object-contain" />
                ) : (
                    definition.icon
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{definition.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{definition.category}</span>
                </div>
            </div>

            {/* Menu Trigger */}
            <button
                onClick={onToggleMenu}
                className={cn(
                    "p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors",
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
                        className="absolute right-14 z-50 flex flex-row gap-2 items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {!definition.isSystemService && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center text-red-500 shadow-md hover:scale-110 transition-transform"
                                title="Eliminar"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
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
    );
}
