// Types y enums
export type ServiceStatus = 'paid' | 'pending' | 'overdue';

// Interfaces principales
export interface Service {
    id: string;
    name: string;
    amount: number;
    dueDate: number;
    status: ServiceStatus;
    icon: string;
    provider?: string;
}

export interface Activity {
    id: string;
    type: 'payment' | 'reminder' | 'help';
    icon: string;
    title: string;
    description: string;
    time: string;
}

export interface QuickAction {
    id: string;
    type: 'add' | 'payments' | 'upcoming' | 'alerts';
    label: string;
    icon: string;
}

export interface ServiceDefinition {
    id: string;
    name: string;
    icon: string;
    title?: string;
    scheduleMode: 'fixed' | 'rolling';
    fixedDay?: number;
    rollingDays?: number;
    reminderDays: number; // Días de anticipación para alertas
    dueTime: string;      // Hora límite de pago (HH:MM)
    color: string;
    category: string;
    isSystemService?: boolean; // Indica si es un servicio predefinido del sistema (no se puede eliminar)
}
