export type ServiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';
export type RecurrenceType = 'one_time' | 'weekly' | 'monthly' | 'interval';

export interface RecurrenceRule {
    type: RecurrenceType;
    dayOfWeek?: number; // Para 'weekly' (0-6: Dom-Sab)
    dayOfMonth?: number; // Para 'monthly' (1-31)
    intervalDays?: number; // Para 'interval' (ej: cada 30 días)
}
