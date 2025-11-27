import { ServiceInstance } from '@/lib/types';
import { Bell, Calendar, DollarSign, CheckCircle, Clock, AlertTriangle, Repeat } from 'lucide-react';

interface ServiceInstanceDetailsProps {
    instance: ServiceInstance;
    onClose: () => void;
}

export default function ServiceInstanceDetails({ instance, onClose }: ServiceInstanceDetailsProps) {
    // Mock de notificaciones generadas por esta instancia
    const notifications = [
        { id: 1, date: '2025-11-20 09:00', message: 'Recordatorio: Vence en 5 días', status: 'sent' },
        { id: 2, date: '2025-11-23 09:00', message: 'Recordatorio: Vence en 2 días', status: 'sent' },
        { id: 3, date: '2025-11-25 08:30', message: '¡Vence hoy! No olvides pagar', status: 'pending' },
    ];

    const statusColors = {
        paid: 'text-green-500',
        pending: 'text-yellow-500',
        overdue: 'text-red-500'
    };

    const statusLabels = {
        paid: 'Pagado',
        pending: 'Pendiente',
        overdue: 'Vencido'
    };

    const statusIcons = {
        paid: <CheckCircle size={20} />,
        pending: <Clock size={20} />,
        overdue: <AlertTriangle size={20} />
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Sin fecha';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getRecurrenceText = (recurrence: any) => {
        if (!recurrence) return 'Pago único';
        switch (recurrence.type) {
            case 'weekly': return `Semanal (Día ${recurrence.dayOfWeek})`;
            case 'monthly': return `Mensual (Día ${recurrence.dayOfMonth})`;
            case 'interval': return `Cada ${recurrence.intervalDays} días`;
            default: return 'Pago único';
        }
    };

    return (
        <div className="space-y-6">
            {/* Cabecera con Icono y Estado */}
            <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-white/5">
                <div
                    className="w-16 h-16 flex items-center justify-center rounded-2xl text-4xl shadow-lg"
                    style={{ backgroundColor: `${instance.color}20`, color: instance.color }}
                >
                    {instance.icon.startsWith('http') || instance.icon.startsWith('/') ? (
                        <img src={instance.icon} alt={instance.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                        instance.icon
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{instance.name}</h3>
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${statusColors[instance.status]}`}>
                        {statusIcons[instance.status]}
                        <span>{statusLabels[instance.status]}</span>
                    </div>
                </div>
            </div>

            {/* Detalles Clave */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-card rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-foreground/60 text-xs uppercase tracking-wider">
                        <DollarSign size={14} />
                        Monto
                    </div>
                    <p className="text-xl font-bold text-primary">${instance.amount.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-card rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-foreground/60 text-xs uppercase tracking-wider">
                        <Calendar size={14} />
                        Vencimiento
                    </div>
                    <p className="text-sm font-semibold text-foreground">{formatDate(instance.dueDate)}</p>
                </div>
                <div className="p-3 bg-card rounded-xl border border-white/5 space-y-1 col-span-2">
                    <div className="flex items-center gap-2 text-foreground/60 text-xs uppercase tracking-wider">
                        <Repeat size={14} />
                        Frecuencia
                    </div>
                    <p className="text-sm font-medium text-foreground">{getRecurrenceText(instance.recurrence)}</p>
                </div>
            </div>

            {/* Historial de Notificaciones */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground/70 flex items-center gap-2">
                    <Bell size={16} />
                    Notificaciones Generadas
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {notifications.length > 0 ? (
                        notifications.map(notif => (
                            <div key={notif.id} className="flex gap-3 p-3 rounded-xl bg-card/50 border border-white/5 hover:bg-card transition">
                                <div className={`mt-1 w-2 h-2 rounded-full ${notif.status === 'sent' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                <div className="flex-1">
                                    <p className="text-xs text-foreground/50 mb-0.5">{notif.date}</p>
                                    <p className="text-sm text-foreground">{notif.message}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-foreground/40 text-sm">
                            No hay notificaciones registradas
                        </div>
                    )}
                </div>
            </div>

            {/* Botón Cerrar */}
            <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-card hover:bg-card/80 border border-white/10 text-foreground font-medium transition"
            >
                Cerrar
            </button>
        </div>
    );
}
