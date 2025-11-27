// Types y enums
export type ServiceStatus = 'paid' | 'pending' | 'overdue';
export type RecurrenceType = 'one_time' | 'weekly' | 'monthly' | 'interval';

export interface RecurrenceRule {
    type: RecurrenceType;
    dayOfWeek?: number; // Para 'weekly' (0-6: Dom-Sab)
    dayOfMonth?: number; // Para 'monthly' (1-31)
    intervalDays?: number; // Para 'interval' (ej: cada 30 días)
}

// Interfaces principales

// ServiceInstance: La realidad temporal (La Instancia del Servicio)
export interface ServiceInstance {
    id: string;
    definitionId: string; // Link a la definición (padre)

    // Datos específicos de esta instancia
    name: string; // Nombre libre, puede ser diferente al Definition
    amount: number;
    dueDate: string; // Fecha completa ISO (YYYY-MM-DD)
    status: ServiceStatus;

    // Datos para pago externo (opcional)
    externalPaymentId?: string;

    // Recurrencia (null = pago único)
    recurrence: RecurrenceRule | null;

    // Sistema de alertas
    reminderDaysBefore: number; // Días antes que empieza a notificar
    dailyReminders: number; // Notificaciones por día

    // Metadata de pago
    paidAt?: string;
    paidAmount?: number; // Por si paga diferente al amount
    receiptUrl?: string;
    notes?: string;

    // Campos desnormalizados para facilidad de UI (se llenan desde la definición)
    icon: string;
    color: string;
}

export interface Activity {
    id: string;
    type: 'payment' | 'reminder' | 'help';
    icon: string;
    title: string;
    description: string;
    time: string;
}

// ServiceDefinition: Solo Identidad (La Carpeta)
export interface ServiceDefinition {
    id: string;
    name: string;
    icon: string;
    color: string;
    category?: string;
    isSystemService?: boolean; // Indica si es un servicio predefinido del sistema
}
