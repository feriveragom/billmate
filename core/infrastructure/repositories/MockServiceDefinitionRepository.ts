import { ServiceDefinition } from '../../domain/entities';
import { IServiceDefinitionRepository } from '../../domain/repositories';
import { initialServiceDefinitions } from '../../../lib/mockData';

export class MockServiceDefinitionRepository implements IServiceDefinitionRepository {
    private definitions: ServiceDefinition[];

    constructor() {
        this.definitions = [...initialServiceDefinitions];
    }

    async getAll(): Promise<ServiceDefinition[]> {
        return [...this.definitions];
    }

    async findById(id: string): Promise<ServiceDefinition | undefined> {
        return this.definitions.find(d => d.id === id);
    }

    async add(definition: ServiceDefinition): Promise<void> {
        this.definitions.push(definition);
    }

    async update(id: string, updates: Partial<ServiceDefinition>): Promise<void> {
        this.definitions = this.definitions.map(d => d.id === id ? { ...d, ...updates } : d);
    }

    async delete(id: string): Promise<void> {
        this.definitions = this.definitions.filter(d => d.id !== id);
    }
}
