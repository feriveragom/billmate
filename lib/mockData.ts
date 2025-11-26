import { Service, Activity, ServiceDefinition } from './types';

// Datos mock - Servicios activos
export const initialServices: Service[] = [
    { id: '1', name: 'Agua', amount: 45.00, dueDate: 25, status: 'pending', icon: '💧' },
    { id: '2', name: 'Luz', amount: 120.50, dueDate: 28, status: 'paid', icon: '⚡' },
    { id: '3', name: 'Internet', amount: 60.00, dueDate: 15, status: 'overdue', icon: '📡' },
    { id: '4', name: 'Gas', amount: 35.00, dueDate: 30, status: 'pending', icon: '🔥' },
];

// Datos mock - Actividades recientes
export const initialActivities: Activity[] = [
    { id: '1', type: 'payment', icon: '✅', title: 'Pago confirmado', description: 'Luz - $120.50', time: 'Hace 2 horas' },
    { id: '2', type: 'reminder', icon: '🔔', title: 'Recordatorio', description: 'Agua vence en 3 días', time: '9:00 AM' },
    { id: '3', type: 'help', icon: '🤝', title: 'Ayuda solicitada', description: 'María te ayudó con el Internet', time: 'Ayer' },
];

// Datos mock - Definiciones de servicios (plantillas)
export const initialServiceDefinitions: ServiceDefinition[] = [
    // Servicios del Sistema (no se pueden eliminar)
    {
        id: 'sys-telefono',
        name: 'Teléfono',
        icon: '/icons/system/telefono.png',
        title: 'Pagar factura telefónica',
        scheduleMode: 'fixed',
        fixedDay: 5,
        reminderDays: 3,
        dueTime: '23:59',
        color: '#10B981',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-electricidad',
        name: 'Electricidad',
        icon: '/icons/system/electricidad.png',
        title: 'Pagar factura de electricidad',
        scheduleMode: 'fixed',
        fixedDay: 10,
        reminderDays: 5,
        dueTime: '18:00',
        color: '#FACC15',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-agua',
        name: 'Agua',
        icon: '/icons/system/agua.png',
        title: 'Pagar factura agua',
        scheduleMode: 'fixed',
        fixedDay: 15,
        reminderDays: 3,
        dueTime: '18:00',
        color: '#3B82F6',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-gas',
        name: 'Gas',
        icon: '/icons/system/gas.png',
        title: 'Pagar factura de Gas Manufacturado',
        scheduleMode: 'fixed',
        fixedDay: 20,
        reminderDays: 3,
        dueTime: '18:00',
        color: '#F97316',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-impuestos',
        name: 'Impuestos',
        icon: '/icons/system/impuestos.png',
        title: 'Pagar Impuestos',
        scheduleMode: 'fixed',
        fixedDay: 30,
        reminderDays: 7,
        dueTime: '17:00',
        color: '#EF4444',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-recarga-movil',
        name: 'Recarga Saldo Móvil',
        icon: '/icons/system/recarga_saldo_movil.png',
        title: 'Recargar saldo del móvil con cuenta bancaria',
        scheduleMode: 'rolling',
        rollingDays: 15,
        reminderDays: 2,
        dueTime: '20:00',
        color: '#8B5CF6',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-recarga-nauta',
        name: 'Recarga Nauta',
        icon: '/icons/system/recarga_nauta.png',
        title: 'Recargar cuenta permanente nauta',
        scheduleMode: 'rolling',
        rollingDays: 30,
        reminderDays: 3,
        dueTime: '20:00',
        color: '#06B6D4',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    // Servicios de Ejemplo (pueden ser eliminados)
    {
        id: '1',
        name: 'Netflix',
        icon: '🎬',
        title: 'Suscripción Premium 4K',
        scheduleMode: 'fixed',
        fixedDay: 15,
        reminderDays: 3,
        dueTime: '23:59',
        color: '#E50914',
        category: 'Entretenimiento'
    },
    {
        id: '2',
        name: 'Gimnasio',
        icon: '💪',
        title: 'Membresía Mensual',
        scheduleMode: 'rolling',
        rollingDays: 30,
        reminderDays: 2,
        dueTime: '10:00',
        color: '#10B981',
        category: 'Salud'
    }
];
