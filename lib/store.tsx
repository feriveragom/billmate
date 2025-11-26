'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PaymentInstance, Activity, ServiceDefinition } from './types';
import { initialPaymentInstances, initialActivities, initialServiceDefinitions } from './mockData';

// Re-export types for convenience
export type { PaymentInstance, Activity, ServiceDefinition, ServiceStatus } from './types';

// Context State
interface AppState {
    services: PaymentInstance[];
    activities: Activity[];
    archivedActivities: Activity[];
    serviceDefinitions: ServiceDefinition[];
    notifications: number;
    theme: 'light' | 'dark';
    showArchivedView: boolean;
}

// Context API
interface AppContextType extends AppState {
    addService: (service: PaymentInstance) => void;
    updateService: (id: string, updates: Partial<PaymentInstance>) => void;
    deleteService: (id: string) => void;
    addServiceDefinition: (definition: ServiceDefinition) => void;
    updateServiceDefinition: (id: string, updates: Partial<ServiceDefinition>) => void;
    deleteServiceDefinition: (id: string) => void;
    archiveActivity: (id: string) => void;
    unarchiveActivity: (id: string) => void;
    toggleArchivedView: () => void;
    toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [services, setServices] = useState<PaymentInstance[]>(initialPaymentInstances);
    const [activities, setActivities] = useState<Activity[]>(initialActivities);
    const [archivedActivities, setArchivedActivities] = useState<Activity[]>([]);
    const [serviceDefinitions, setServiceDefinitions] = useState<ServiceDefinition[]>(initialServiceDefinitions);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [showArchivedView, setShowArchivedView] = useState(false);

    const addService = (service: PaymentInstance) => {
        setServices(prev => [...prev, service]);
    };

    const updateService = (id: string, updates: Partial<PaymentInstance>) => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteService = (id: string) => {
        setServices(prev => prev.filter(s => s.id !== id));
    };

    const addServiceDefinition = (definition: ServiceDefinition) => {
        setServiceDefinitions(prev => [...prev, definition]);
    };

    const updateServiceDefinition = (id: string, updates: Partial<ServiceDefinition>) => {
        setServiceDefinitions(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    };

    const deleteServiceDefinition = (id: string) => {
        // Prevenir eliminación de servicios del sistema
        const definition = serviceDefinitions.find(d => d.id === id);
        if (definition?.isSystemService) {
            console.warn('No se puede eliminar un servicio del sistema');
            return;
        }
        setServiceDefinitions(prev => prev.filter(d => d.id !== id));
    };

    const archiveActivity = (id: string) => {
        const activity = activities.find(a => a.id === id);
        if (activity) {
            setActivities(prev => prev.filter(a => a.id !== id));
            setArchivedActivities(prev => [...prev, activity]);
        }
    };

    const unarchiveActivity = (id: string) => {
        const activity = archivedActivities.find(a => a.id === id);
        if (activity) {
            setArchivedActivities(prev => prev.filter(a => a.id !== id));
            setActivities(prev => [...prev, activity]);
        }
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const toggleArchivedView = () => {
        setShowArchivedView(prev => !prev);
    };

    // Aplicar clase dark al documento usando useEffect
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const notifications = services.filter(s => s.status !== 'paid').length;

    return (
        <AppContext.Provider value={{
            services,
            activities,
            archivedActivities,
            serviceDefinitions,
            notifications,
            theme,
            showArchivedView,
            addService,
            updateService,
            deleteService,
            addServiceDefinition,
            updateServiceDefinition,
            deleteServiceDefinition,
            archiveActivity,
            unarchiveActivity,
            toggleArchivedView,
            toggleTheme
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
