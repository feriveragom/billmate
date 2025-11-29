import { ServiceInstance } from '@/core/domain/entities';
import { IServiceInstanceRepository } from '@/core/domain/repositories/IServiceInstanceRepository';

export class FirebaseServiceInstanceRepository implements IServiceInstanceRepository {

    async getAll(): Promise<ServiceInstance[]> {
        // TODO: Implement Firebase query
        console.log('[MOCK] FirebaseServiceInstanceRepository.getAll()');
        return [];
    }

    async add(service: ServiceInstance): Promise<void> {
        // TODO: Implement Firebase add
        console.log('[MOCK] FirebaseServiceInstanceRepository.add()', service);
    }

    async update(id: string, updates: Partial<ServiceInstance>): Promise<void> {
        // TODO: Implement Firebase update
        console.log('[MOCK] FirebaseServiceInstanceRepository.update()', id, updates);
    }

    async delete(id: string): Promise<void> {
        // TODO: Implement Firebase delete
        console.log('[MOCK] FirebaseServiceInstanceRepository.delete()', id);
    }
}
