import { ServiceInstance, Activity, ServiceDefinition } from './types';

// Datos mock - Instancias de Servicios (La Realidad)
export const initialServiceInstances: ServiceInstance[] = [
    {
        id: 'inst-1',
        userId: 'user-123-mock',
        definitionId: 'sys-agua',
        name: 'Agua',
        amount: 45.00,
        dueDate: '2025-12-25',
        status: 'pending',
        icon: '/icons/system/agua.png',
        color: '#3B82F6',
        recurrence: { type: 'monthly', dayOfMonth: 25 },
        reminderDaysBefore: 3,
        dailyReminders: 2,
        forAccounting: false
    },
    {
        id: 'inst-2',
        userId: 'user-123-mock',
        definitionId: 'sys-electricidad',
        name: 'Electricidad',
        amount: 120.50,
        dueDate: '2025-12-28',
        status: 'paid',
        icon: '/icons/system/electricidad.png',
        color: '#FACC15',
        recurrence: { type: 'monthly', dayOfMonth: 28 },
        reminderDaysBefore: 5,
        dailyReminders: 1,
        paidAt: '2025-11-27T10:30:00',
        forAccounting: true
    },
    {
        id: 'inst-3',
        userId: 'user-123-mock',
        definitionId: 'def-netflix',
        name: 'Netflix Premium',
        amount: 15.00,
        dueDate: '2025-12-15',
        status: 'pending',
        icon: '🎬',
        color: '#E50914',
        recurrence: { type: 'monthly', dayOfMonth: 15 },
        reminderDaysBefore: 2,
        dailyReminders: 3,
        externalPaymentId: 'NF-2025-12',
        forAccounting: false
    },
    {
        id: 'inst-4',
        userId: 'user-123-mock',
        definitionId: 'sys-gas',
        name: 'Gas',
        amount: 35.00,
        dueDate: '2025-12-05',
        status: 'overdue',
        icon: '/icons/system/gas.png',
        color: '#F97316',
        recurrence: { type: 'interval', intervalDays: 45 },
        reminderDaysBefore: 7,
        dailyReminders: 4,
        forAccounting: false
    },
    {
        id: 'inst-5',
        userId: 'user-123-mock',
        definitionId: 'def-gimnasio',
        name: 'Gimnasio Enero - Cuota mensual',
        amount: 50.00,
        dueDate: '2025-12-10',
        status: 'pending',
        icon: '💪',
        color: '#10B981',
        recurrence: { type: 'monthly', dayOfMonth: 10 },
        reminderDaysBefore: 5,
        dailyReminders: 2,
        forAccounting: false
    },
];

// Datos mock - Actividades recientes
export const initialActivities: Activity[] = [
    { id: '1', type: 'payment', icon: '✅', title: 'Pago confirmado', description: 'Electricidad - $120.50', time: 'Hace 2 horas' },
    { id: '2', type: 'reminder', icon: '🔔', title: 'Recordatorio', description: 'Agua vence en 3 días', time: '9:00 AM' },
    { id: '3', type: 'help', icon: '🤝', title: 'Ayuda solicitada', description: 'María te ayudó con el Internet', time: 'Ayer' },
];

// Datos mock - Definiciones de servicios (Solo Identidad)
export const initialServiceDefinitions: ServiceDefinition[] = [
    // Servicio Especial para Pagos Externos/Ayudas
    {
        id: 'sys-others',
        userId: 'user-123-mock',
        name: 'Otros / Externos',
        icon: '🌐', // Icono global/genérico
        color: '#64748B', // Slate-500 (Neutro)
        category: 'General',
        isSystemService: true
    },
    // Servicios del Sistema
    {
        id: 'sys-telefono',
        userId: 'user-123-mock',
        name: 'Teléfono',
        icon: '/icons/system/telefono.png',
        color: '#10B981',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-electricidad',
        userId: 'user-123-mock',
        name: 'Electricidad',
        icon: '/icons/system/electricidad.png',
        color: '#FACC15',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-agua',
        userId: 'user-123-mock',
        name: 'Agua',
        icon: '/icons/system/agua.png',
        color: '#3B82F6',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-gas',
        userId: 'user-123-mock',
        name: 'Gas',
        icon: '/icons/system/gas.png',
        color: '#F97316',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-impuestos',
        userId: 'user-123-mock',
        name: 'Impuestos',
        icon: '/icons/system/impuestos.png',
        color: '#EF4444',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-recarga-movil',
        userId: 'user-123-mock',
        name: 'Recarga Saldo Móvil',
        icon: '/icons/system/recarga_saldo_movil.png',
        color: '#8B5CF6',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-recarga-nauta',
        userId: 'user-123-mock',
        name: 'Recarga Nauta',
        icon: '/icons/system/recarga_nauta.png',
        color: '#06B6D4',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    // Servicios de Ejemplo
    {
        id: 'def-netflix',
        userId: 'user-123-mock',
        name: 'Netflix',
        icon: '🎬',
        color: '#E50914',
        category: 'Entretenimiento'
    },
    {
        id: 'def-gimnasio',
        userId: 'user-123-mock',
        name: 'Gimnasio',
        icon: '💪',
        color: '#10B981',
        category: 'Salud'
    }
];
