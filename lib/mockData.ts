import { ServiceInstance, Activity, ServiceDefinition } from './types';

// Datos mock - Instancias de Servicios (La Realidad)
export const initialServiceInstances: ServiceInstance[] = [
    {
        id: 'inst-1',
        definitionId: 'sys-agua',
        name: 'Agua',
        amount: 45.00,
        dueDate: '2025-11-25',
        status: 'pending',
        icon: '/icons/system/agua.png',
        color: '#3B82F6',
        recurrence: { type: 'monthly', dayOfMonth: 25 }
    },
    {
        id: 'inst-2',
        definitionId: 'sys-electricidad',
        name: 'Electricidad',
        amount: 120.50,
        dueDate: '2025-11-28',
        status: 'paid',
        icon: '/icons/system/electricidad.png',
        color: '#FACC15',
        recurrence: { type: 'monthly', dayOfMonth: 28 }
    },
    {
        id: 'inst-3',
        definitionId: 'def-netflix',
        name: 'Netflix',
        amount: 15.00,
        dueDate: '2025-11-15',
        status: 'overdue',
        icon: '🎬',
        color: '#E50914',
        recurrence: { type: 'monthly', dayOfMonth: 15 }
    },
    {
        id: 'inst-4',
        definitionId: 'sys-gas',
        name: 'Gas',
        amount: 35.00,
        dueDate: '2025-11-30',
        status: 'pending',
        icon: '/icons/system/gas.png',
        color: '#F97316',
        recurrence: { type: 'monthly', dayOfMonth: 30 }
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
    // Servicios del Sistema
    {
        id: 'sys-telefono',
        name: 'Teléfono',
        icon: '/icons/system/telefono.png',
        color: '#10B981',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-electricidad',
        name: 'Electricidad',
        icon: '/icons/system/electricidad.png',
        color: '#FACC15',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-agua',
        name: 'Agua',
        icon: '/icons/system/agua.png',
        color: '#3B82F6',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-gas',
        name: 'Gas',
        icon: '/icons/system/gas.png',
        color: '#F97316',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-impuestos',
        name: 'Impuestos',
        icon: '/icons/system/impuestos.png',
        color: '#EF4444',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-recarga-movil',
        name: 'Recarga Saldo Móvil',
        icon: '/icons/system/recarga_saldo_movil.png',
        color: '#8B5CF6',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    {
        id: 'sys-recarga-nauta',
        name: 'Recarga Nauta',
        icon: '/icons/system/recarga_nauta.png',
        color: '#06B6D4',
        category: 'Servicios Básicos',
        isSystemService: true
    },
    // Servicios de Ejemplo
    {
        id: 'def-netflix',
        name: 'Netflix',
        icon: '🎬',
        color: '#E50914',
        category: 'Entretenimiento'
    },
    {
        id: 'def-gimnasio',
        name: 'Gimnasio',
        icon: '💪',
        color: '#10B981',
        category: 'Salud'
    }
];
