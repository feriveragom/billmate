// Types y enums
export type ServiceStatus = 'paid' | 'pending' | 'overdue';
export type RecurrenceType = 'monthly' | 'interval' | 'one_time';

export interface RecurrenceRule {
    type: RecurrenceType;
    dayOfMonth?: number; // Para 'monthly' (ej: 5)
    intervalDays?: number; // Para 'interval' (ej: 30)
}

// Interfaces principales

// ServiceInstance (antes PaymentInstance): La realidad temporal (La Instancia del Servicio)
export interface ServiceInstance {
    id: string;
    definitionId: string; // Link a la definición (padre)
    amount: number;
    dueDate: string; // Fecha completa ISO (YYYY-MM-DD)
    status: ServiceStatus;
    recurrence?: RecurrenceRule; // Regla de repetición propia de esta instancia

    // Campos desnormalizados para facilidad de UI (se llenan desde la definición)
    name: string;
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
