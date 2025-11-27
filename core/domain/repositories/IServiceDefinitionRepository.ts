import { ServiceDefinition } from '../entities';

export interface IServiceDefinitionRepository {
    getAll(): Promise<ServiceDefinition[]>;
    add(definition: ServiceDefinition): Promise<void>;
    update(id: string, updates: Partial<ServiceDefinition>): Promise<void>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<ServiceDefinition | undefined>;
}
