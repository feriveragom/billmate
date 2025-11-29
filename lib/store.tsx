'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ServiceInstance, Activity, ServiceDefinition } from '../core/domain/entities';
import { useAuth } from '../components/features/auth/AuthProvider';

// Re-export types for convenience
export type { ServiceInstance, Activity, ServiceDefinition, ServiceStatus } from '../core/domain/entities';

// Context State
interface AppState {
    services: ServiceInstance[];
    activities: Activity[];
    archivedActivities: Activity[];
    serviceDefinitions: ServiceDefinition[];
    notifications: number;
    theme: 'light' | 'dark';
    showArchivedView: boolean;
}

// Context API
interface AppContextType extends AppState {
    addService: (service: ServiceInstance) => Promise<void>;
    updateService: (id: string, updates: Partial<ServiceInstance>) => Promise<void>;
    deleteService: (id: string) => Promise<void>;
    addServiceDefinition: (definition: ServiceDefinition) => Promise<void>;
    updateServiceDefinition: (id: string, updates: Partial<ServiceDefinition>) => Promise<void>;
    deleteServiceDefinition: (id: string) => Promise<void>;
    archiveActivity: (id: string) => Promise<void>;
    unarchiveActivity: (id: string) => Promise<void>;
    toggleArchivedView: () => void;
    toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    // Local State (View Model)
    const [services, setServices] = useState<ServiceInstance[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [archivedActivities, setArchivedActivities] = useState<Activity[]>([]);
    const [serviceDefinitions, setServiceDefinitions] = useState<ServiceDefinition[]>([]);

    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [showArchivedView, setShowArchivedView] = useState(false);

    // Load Initial Data - TODO: Connect to Real Repositories
    useEffect(() => {
        const loadData = async () => {
            if (!user) return; 
            console.log("Store: Loading data placeholder");
            // TODO: Implement fetching from real repositories
        };
        loadData();
    }, [user]);

    // Actions (Controllers) - TODO: Connect to Real Repositories
    const addService = async (service: ServiceInstance) => {
        console.log("Store: Add service placeholder", service);
    };

    const updateService = async (id: string, updates: Partial<ServiceInstance>) => {
        console.log("Store: Update service placeholder", id, updates);
    };

    const deleteService = async (id: string) => {
        console.log("Store: Delete service placeholder", id);
    };

    const addServiceDefinition = async (definition: ServiceDefinition) => {
        console.log("Store: Add definition placeholder", definition);
    };

    const updateServiceDefinition = async (id: string, updates: Partial<ServiceDefinition>) => {
        console.log("Store: Update definition placeholder", id, updates);
    };

    const deleteServiceDefinition = async (id: string) => {
        console.log("Store: Delete definition placeholder", id);
    };

    const archiveActivity = async (id: string) => {
        console.log("Store: Archive activity placeholder", id);
    };

    const unarchiveActivity = async (id: string) => {
        console.log("Store: Unarchive activity placeholder", id);
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const toggleArchivedView = () => {
        setShowArchivedView(prev => !prev);
    };

    // Side Effects (UI Logic)
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
