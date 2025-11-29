import { ServiceInstance } from '@/core/domain/entities';
import { IServiceInstanceRepository } from '@/core/domain/repositories';

export class ServiceInstanceService {
    constructor(private repository: IServiceInstanceRepository) { }

    async getAll(): Promise<ServiceInstance[]> {
        return this.repository.getAll();
    }

    async add(service: ServiceInstance): Promise<void> {
        await this.repository.add(service);
    }

    async update(id: string, updates: Partial<ServiceInstance>): Promise<void> {
        await this.repository.update(id, updates);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}

