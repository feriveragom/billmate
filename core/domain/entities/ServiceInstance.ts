import { RecurrenceRule, ServiceStatus } from './Common';

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

    // Contabilidad
    forAccounting: boolean;

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
