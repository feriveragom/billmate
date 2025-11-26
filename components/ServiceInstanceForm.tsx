import { useState, useEffect } from 'react';
import { ServiceInstance } from '@/lib/types';
import { DollarSign, Calendar, CheckCircle } from 'lucide-react';

interface ServiceInstanceFormProps {
    initialData?: ServiceInstance | null;
    onSave: (data: Partial<ServiceInstance>) => void;
    onCancel: () => void;
}

export default function ServiceInstanceForm({ initialData, onSave, onCancel }: ServiceInstanceFormProps) {
    const [formData, setFormData] = useState<Partial<ServiceInstance>>({
        amount: 0,
        dueDate: '',
        status: 'pending'
    });

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
        onSave(formData);
    };

    const statusOptions = [
        { value: 'pending', label: 'Pendiente', color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600' },
        { value: 'paid', label: 'Pagado', color: 'bg-green-500/10 border-green-500/30 text-green-600' },
        { value: 'overdue', label: 'Vencido', color: 'bg-red-500/10 border-red-500/30 text-red-600' }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Estado */}
            <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">Estado del Pago</label>
                <div className="grid grid-cols-3 gap-2">
                    {statusOptions.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleChange('status', option.value)}
                            className={`p-3 rounded-xl border transition ${
                                formData.status === option.value
                                    ? option.color + ' ring-2 ring-primary/50'
                                    : 'bg-card border-white/10 hover:border-primary/30'
                            }`}
                        >
                            <div className="flex flex-col items-center gap-1">
                                {formData.status === option.value && (
                                    <CheckCircle size={16} className="text-primary" />
                                )}
                                <span className="text-xs font-medium">{option.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
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
                    {initialData ? 'Guardar Cambios' : 'Crear Pago'}
                </button>
            </div>
        </form>
    );
}

