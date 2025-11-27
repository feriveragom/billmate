import { ServiceInstance } from '../../domain/entities';
import { IServiceInstanceRepository } from '../../domain/repositories';
import { initialServiceInstances } from '../../../lib/mockData';

export class MockServiceInstanceRepository implements IServiceInstanceRepository {
    private services: ServiceInstance[];

    constructor() {
        this.services = [...initialServiceInstances];
    }

    async getAll(): Promise<ServiceInstance[]> {
        return [...this.services];
    }

    async add(service: ServiceInstance): Promise<void> {
        this.services.push(service);
    }

    async update(id: string, updates: Partial<ServiceInstance>): Promise<void> {
        this.services = this.services.map(s => s.id === id ? { ...s, ...updates } : s);
    }

    async delete(id: string): Promise<void> {
        this.services = this.services.filter(s => s.id !== id);
    }
}
