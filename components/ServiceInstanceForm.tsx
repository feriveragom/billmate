import { useState, useEffect } from 'react';
import { ServiceInstance, ServiceDefinition, RecurrenceType } from '@/lib/types';
import { DollarSign, Calendar, CheckCircle, CreditCard, Bell, BellRing, Repeat } from 'lucide-react';

interface ServiceInstanceFormProps {
    definition?: ServiceDefinition;  // Para heredar color, icon al crear
    initialData?: ServiceInstance | null;
    onSave: (data: Partial<ServiceInstance>) => void;
    onCancel: () => void;
}

export default function ServiceInstanceForm({ definition, initialData, onSave, onCancel }: ServiceInstanceFormProps) {
    const [formData, setFormData] = useState<Partial<ServiceInstance>>({
        name: initialData?.name || definition?.name || '',
        amount: initialData?.amount || 0,
        dueDate: initialData?.dueDate || '',
        status: initialData?.status || 'pending',
        externalPaymentId: initialData?.externalPaymentId || '',

        // Recurrencia
        recurrence: initialData?.recurrence || null,

        // Alertas
        reminderDaysBefore: initialData?.reminderDaysBefore || 3,
        dailyReminders: initialData?.dailyReminders || 2,

        // Cache
        color: initialData?.color || definition?.color || '#8B5CF6',
        icon: initialData?.icon || definition?.icon || '📝'
    });

    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
        initialData?.recurrence?.type || 'one_time'
    );
    const [dayOfWeek, setDayOfWeek] = useState(initialData?.recurrence?.dayOfWeek || 1);
    const [dayOfMonth, setDayOfMonth] = useState(initialData?.recurrence?.dayOfMonth || 1);
    const [intervalDays, setIntervalDays] = useState(initialData?.recurrence?.intervalDays || 30);

    useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData });
        }
    }, [initialData]);

    const handleChange = (field: keyof ServiceInstance, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Construir recurrence según el tipo
        let recurrence = null;
        if (recurrenceType !== 'one_time') {
            recurrence = {
                type: recurrenceType,
                ...(recurrenceType === 'weekly' && { dayOfWeek }),
                ...(recurrenceType === 'monthly' && { dayOfMonth }),
                ...(recurrenceType === 'interval' && { intervalDays })
            };
        }

        onSave({
            ...formData,
            recurrence,
            definitionId: initialData?.definitionId || definition?.id || ''
        });
    };

    const statusOptions = [
        { value: 'pending', label: 'Pendiente', color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600' },
        { value: 'paid', label: 'Pagado', color: 'bg-green-500/10 border-green-500/30 text-green-600' },
        { value: 'overdue', label: 'Vencido', color: 'bg-red-500/10 border-red-500/30 text-red-600' }
    ];

    const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">Nombre de la Instancia</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-2 bg-card border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                    placeholder="ej: Gimnasio Enero - Cuota mensual"
                    required
                />
            </div>

            {/* Monto */}
            <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">Monto a Pagar</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 bg-card border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                        placeholder="0.00"
                        required
                    />
                </div>
            </div>

            {/* Fecha de Vencimiento */}
            <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">Fecha de Vencimiento</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                    <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleChange('dueDate', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                        required
                    />
                </div>
            </div>

            {/* Código de Pago Externo (opcional) */}
            <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">Código de Pago (opcional)</label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                    <input
                        type="text"
                        value={formData.externalPaymentId}
                        onChange={(e) => handleChange('externalPaymentId', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                        placeholder="ID del sistema de pago"
                    />
                </div>
            </div>

            {/* --- RECURRENCIA --- */}
            <div className="pt-2 border-t border-white/10">
                <label className="block text-xs font-medium text-foreground/70 mb-2 flex items-center gap-2">
                    <Repeat size={16} />
                    Frecuencia
                </label>
                <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                    className="w-full px-4 py-2 bg-card border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                >
                    <option value="one_time">Una vez (no se repite)</option>
                    <option value="weekly">Semanal (mismo día)</option>
                    <option value="monthly">Mensual (mismo día del mes)</option>
                    <option value="interval">Cíclico (cada N días)</option>
                </select>
            </div>

            {/* Campos condicionales según frecuencia */}
            {recurrenceType === 'weekly' && (
                <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-2">Día de la semana</label>
                    <select
                        value={dayOfWeek}
                        onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-card border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                    >
                        {weekDays.map((day, index) => (
                            <option key={index} value={index}>{day}</option>
                        ))}
                    </select>
                </div>
            )}

            {recurrenceType === 'monthly' && (
                <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-2">Día del mes (1-31)</label>
                    <input
                        type="number"
                        min="1"
                        max="31"
                        value={dayOfMonth}
                        onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-card border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                    />
                </div>
            )}

            {recurrenceType === 'interval' && (
                <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-2">Cada cuántos días</label>
                    <input
                        type="number"
                        min="1"
                        value={intervalDays}
                        onChange={(e) => setIntervalDays(parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-card border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                        placeholder="ej: 30 (cada 30 días)"
                    />
                </div>
            )}

            {/* --- ALERTAS --- */}
            <div className="pt-2 border-t border-white/10">
                <label className="block text-xs font-medium text-foreground/70 mb-2 flex items-center gap-2">
                    <Bell size={16} />
                    Proactividad (días antes para notificar)
                </label>
                <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.reminderDaysBefore}
                    onChange={(e) => handleChange('reminderDaysBefore', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-card border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2 flex items-center gap-2">
                    <BellRing size={16} />
                    Notificaciones por día
                </label>
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.dailyReminders}
                    onChange={(e) => handleChange('dailyReminders', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-card border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
            </div>
            {/* Estado (solo si está editando) */}
            {initialData && (
                <div className="pt-2 border-t border-white/10">
                    <label className="block text-xs font-medium text-foreground/70 mb-2">Estado del Pago</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleChange('status', 'pending')}
                            className={`h-20 rounded-2xl border transition flex flex-col items-center justify-center gap-2 ${formData.status === 'pending'
                                ? 'bg-card border-primary ring-2 ring-primary/50 text-foreground'
                                : 'bg-card border-white/10 hover:border-white/30 text-foreground/60'
                                }`}
                        >
                            <span className="text-sm font-medium">Pendiente</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleChange('status', 'paid')}
                            className={`h-20 rounded-2xl border transition flex flex-col items-center justify-center gap-1 ${formData.status === 'paid'
                                ? 'bg-green-500/10 border-green-500/50 ring-2 ring-green-500/20 text-green-500'
                                : 'bg-card border-white/10 hover:border-white/30 text-foreground/60'
                                }`}
                        >
                            {formData.status === 'paid' && <CheckCircle size={20} />}
                            <span className="text-sm font-medium">Pagado</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleChange('status', 'overdue')}
                            className={`h-20 rounded-2xl border transition flex flex-col items-center justify-center gap-2 ${formData.status === 'overdue'
                                ? 'bg-red-500/10 border-red-500/50 ring-2 ring-red-500/20 text-red-500'
                                : 'bg-card border-white/10 hover:border-white/30 text-foreground/60'
                                }`}
                        >
                            <span className="text-sm font-medium">Vencido</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleChange('status', 'cancelled')}
                            className={`h-20 rounded-2xl border transition flex flex-col items-center justify-center gap-2 ${formData.status === 'cancelled'
                                ? 'bg-gray-500/10 border-gray-500/50 ring-2 ring-gray-500/20 text-gray-400'
                                : 'bg-card border-white/10 hover:border-white/30 text-foreground/60'
                                }`}
                        >
                            <span className="text-sm font-medium">Cancelado</span>
                        </button>
                    </div>
                </div>
            )}

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
                    {initialData ? 'Guardar Cambios' : 'Crear Instancia'}
                </button>
            </div>
        </form>
    );
}


