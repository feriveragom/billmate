'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ServiceInstance, Activity, ServiceDefinition } from '../core/domain/entities';
import {
    ServiceInstanceUseCases,
    ServiceDefinitionUseCases,
    ActivityUseCases
} from '../core/application/use-cases';
import {
    MockServiceInstanceRepository,
    MockServiceDefinitionRepository,
    MockActivityRepository
} from '../core/infrastructure/repositories';

// Re-export types for convenience
export type { ServiceInstance, Activity, ServiceDefinition, ServiceStatus } from '../core/domain/entities';

// Instantiate Dependencies (Dependency Injection Root for the Client)
// In a real app, this might be done in a separate DI container
const serviceRepo = new MockServiceInstanceRepository();
const definitionRepo = new MockServiceDefinitionRepository();
const activityRepo = new MockActivityRepository();

const serviceUseCases = new ServiceInstanceUseCases(serviceRepo);
const definitionUseCases = new ServiceDefinitionUseCases(definitionRepo);
const activityUseCases = new ActivityUseCases(activityRepo);

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
    // Local State (View Model)
    const [services, setServices] = useState<ServiceInstance[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [archivedActivities, setArchivedActivities] = useState<Activity[]>([]);
    const [serviceDefinitions, setServiceDefinitions] = useState<ServiceDefinition[]>([]);

    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [showArchivedView, setShowArchivedView] = useState(false);

    // Load Initial Data
    useEffect(() => {
        const loadData = async () => {
            setServices(await serviceUseCases.getAll());
            setServiceDefinitions(await definitionUseCases.getAll());
            setActivities(await activityUseCases.getAll());
            setArchivedActivities(await activityUseCases.getArchived());
        };
        loadData();
    }, []);

    // Actions (Controllers)
    const addService = async (service: ServiceInstance) => {
        await serviceUseCases.add(service);
        setServices(await serviceUseCases.getAll());
    };

    const updateService = async (id: string, updates: Partial<ServiceInstance>) => {
        await serviceUseCases.update(id, updates);
        setServices(await serviceUseCases.getAll());
    };

    const deleteService = async (id: string) => {
        await serviceUseCases.delete(id);
        setServices(await serviceUseCases.getAll());
    };

    const addServiceDefinition = async (definition: ServiceDefinition) => {
        await definitionUseCases.add(definition);
        setServiceDefinitions(await definitionUseCases.getAll());
    };

    const updateServiceDefinition = async (id: string, updates: Partial<ServiceDefinition>) => {
        await definitionUseCases.update(id, updates);
        setServiceDefinitions(await definitionUseCases.getAll());
    };

    const deleteServiceDefinition = async (id: string) => {
        try {
            await definitionUseCases.delete(id);
            setServiceDefinitions(await definitionUseCases.getAll());
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Error deleting definition');
        }
    };

    const archiveActivity = async (id: string) => {
        await activityUseCases.archive(id);
        setActivities(await activityUseCases.getAll());
        setArchivedActivities(await activityUseCases.getArchived());
    };

    const unarchiveActivity = async (id: string) => {
        await activityUseCases.unarchive(id);
        setActivities(await activityUseCases.getAll());
        setArchivedActivities(await activityUseCases.getArchived());
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
