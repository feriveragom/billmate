import { useState, useEffect, useRef } from 'react';
import { ServiceDefinition } from '@/lib/types';
import { Calendar, RefreshCw, Bell, Type, Upload, Clock } from 'lucide-react';

interface ServiceDefinitionFormProps {
    initialData?: ServiceDefinition | null;
    onSave: (data: Partial<ServiceDefinition>) => void;
    onCancel: () => void;
    currentColor: string;
    onColorChange: (color: string) => void;
}

export default function ServiceDefinitionForm({ initialData, onSave, onCancel, currentColor, onColorChange }: ServiceDefinitionFormProps) {
    const [formData, setFormData] = useState<Partial<ServiceDefinition>>({
        name: '',
        icon: '📝',
        color: '#8B5CF6',
        category: 'General',
        isSystemService: false
    });

    const [showIconPicker, setShowIconPicker] = useState(false);
    const iconWrapperRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData });
        }
    }, [initialData]);

    // Cerrar el picker al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (iconWrapperRef.current && !iconWrapperRef.current.contains(event.target as Node)) {
                setShowIconPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (field: keyof ServiceDefinition, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleIconSelect = (emoji: string) => {
        handleChange('icon', emoji);
        setShowIconPicker(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validaciones
        const maxSize = 1 * 1024 * 1024; // 1MB
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];

        if (file.size > maxSize) {
            alert('El archivo es demasiado grande. Máximo 1MB.');
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            alert('Formato no válido. Solo se permiten PNG, JPG o WEBP.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            // Crear una imagen para procesarla
            const img = new Image();
            img.src = reader.result as string;
            img.onload = () => {
                // Configurar dimensiones máximas (icono pequeño)
                const MAX_WIDTH = 128;
                const MAX_HEIGHT = 128;
                let width = img.width;
                let height = img.height;

                // Calcular nuevas dimensiones manteniendo aspecto
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                // Crear canvas para redimensionar
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Convertir a WebP con calidad 0.8 para optimizar espacio
                    const optimizedBase64 = canvas.toDataURL('image/webp', 0.8);
                    handleChange('icon', optimizedBase64);
                    setShowIconPicker(false);
                }
            };
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isImage = (icon: string) => icon?.startsWith('data:image') || icon?.startsWith('http') || icon?.startsWith('/');

    // Lista de emojis extendida y categorizada
    const emojiList = [
        // Servicios Básicos
        { icon: '💧', label: 'Agua' }, { icon: '⚡', label: 'Luz' }, { icon: '📡', label: 'Internet' },
        { icon: '🔥', label: 'Gas' }, { icon: '📱', label: 'Móvil' }, { icon: '🗑️', label: 'Basura' },
        { icon: '🛡️', label: 'Seguro' }, { icon: '🔧', label: 'Mantenimiento' }, { icon: '🧹', label: 'Limpieza' },

        // Personal y Belleza
        { icon: '💅', label: 'Uñas/Manicura' }, { icon: '💇‍♀️', label: 'Peluquería' }, { icon: '💄', label: 'Cosméticos' },
        { icon: '🧖‍♀️', label: 'Spa/Masaje' }, { icon: '🧘‍♀️', label: 'Yoga/Pilates' }, { icon: '👗', label: 'Ropa' },
        { icon: '👠', label: 'Zapatos' }, { icon: '👜', label: 'Bolsos' }, { icon: '💍', label: 'Joyas' },

        // Hogar y Familia
        { icon: '🏠', label: 'Alquiler/Hipoteca' }, { icon: '🧺', label: 'Lavandería' }, { icon: '🪴', label: 'Jardín' },
        { icon: '🐾', label: 'Mascotas' }, { icon: '👶', label: 'Bebé' }, { icon: '🧸', label: 'Juguetes' },
        { icon: '🏫', label: 'Colegio' }, { icon: '👵', label: 'Cuidado' },

        // Entretenimiento y Suscripciones
        { icon: '🎬', label: 'Streaming' }, { icon: '🎵', label: 'Música' }, { icon: '🎮', label: 'Videojuegos' },
        { icon: '📚', label: 'Libros/Cursos' }, { icon: '☁️', label: 'Nube/iCloud' }, { icon: '📰', label: 'Noticias' },
        { icon: '📦', label: 'Envíos/Amazon' },

        // Salud y Deporte
        { icon: '🏋️', label: 'Gimnasio' }, { icon: '🏥', label: 'Médico' }, { icon: '💊', label: 'Farmacia' },
        { icon: '🦷', label: 'Dentista' }, { icon: '👓', label: 'Oculista' },

        // Transporte y Viajes
        { icon: '🚗', label: 'Coche/Gasolina' }, { icon: '🚌', label: 'Transporte' }, { icon: '✈️', label: 'Viajes' },
        { icon: '🅿️', label: 'Parking' },

        // Comida y Ocio
        { icon: '🛒', label: 'Supermercado' }, { icon: '🍔', label: 'Comida Rápida' }, { icon: '🍷', label: 'Bebidas/Vino' },
        { icon: '☕', label: 'Café' }, { icon: '🎁', label: 'Regalos' }, { icon: '💳', label: 'Tarjeta/Banco' }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-2 lg:space-y-4">
            {/* Icono y Nombre */}
            <div className="flex gap-4">
                <div className="flex-shrink-0 relative" ref={iconWrapperRef}>
                    <label className="block text-xs font-medium text-foreground/70 mb-2 text-center">Icono</label>
                    <div className="relative group">
                        <div
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className="w-16 h-16 flex items-center justify-center bg-card border border-white/10 rounded-2xl cursor-pointer hover:border-primary transition overflow-hidden"
                            title="Cambiar icono"
                        >
                            {isImage(formData.icon || '') ? (
                                <img src={formData.icon} alt="Icon" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl">{formData.icon}</span>
                            )}
                        </div>

                        {/* Tooltip/Popover de sugerencias */}
                        {showIconPicker && (
                            <div className="absolute top-full left-0 mt-2 w-80 p-3 bg-card border border-white/10 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                                <p className="text-xs font-medium text-foreground/50 mb-2 px-1">Sugerencias</p>
                                <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                    {emojiList.map((item) => (
                                        <button
                                            key={item.icon}
                                            type="button"
                                            onClick={() => handleIconSelect(item.icon)}
                                            className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-lg hover:bg-primary/20 hover:scale-110 rounded-lg transition"
                                            title={item.label}
                                        >
                                            {item.icon}
                                        </button>
                                    ))}
                                    {/* Botón de Adjuntar */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-primary hover:bg-primary/20 hover:scale-110 rounded-lg transition"
                                        title="Adjuntar imagen (Max 1MB)"
                                    >
                                        <Upload size={18} />
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-medium text-foreground/70 mb-2">Nombre del Servicio</label>
                    <div className="relative">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-card border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                            placeholder="Ej: Netflix"
                            required
                        />
                    </div>
                </div>
            </div>



            {/* Toggle: Proteger contra eliminación */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-white/5">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground mb-1">Se puede eliminar</label>
                    <p className="text-xs text-foreground/50 hidden lg:block">Si se deshabilita, no se podrá eliminar el servicio</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleChange('isSystemService', !formData.isSystemService)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${!formData.isSystemService ? 'bg-primary' : 'bg-gray-400'
                        }`}
                    role="switch"
                    aria-checked={!formData.isSystemService}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!formData.isSystemService ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>





            {/* Botones de Acción */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-xl border border-primary/20 hover:bg-primary/5 text-primary/80 hover:text-primary transition font-medium"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/20 transition"
                >
                    {initialData ? 'Guardar Cambios' : 'Crear Servicio'}
                </button>
            </div>
        </form>
    );
}
