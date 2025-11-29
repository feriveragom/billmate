import { ServiceDefinition } from '@/core/domain/entities';
import { IServiceDefinitionRepository } from '@/core/domain/repositories/IServiceDefinitionRepository';

export class FirebaseServiceDefinitionRepository implements IServiceDefinitionRepository {

    async getAll(): Promise<ServiceDefinition[]> {
        // TODO: Implement Firebase query
        console.log('[MOCK] FirebaseServiceDefinitionRepository.getAll()');
        return [];
    }

    async add(definition: ServiceDefinition): Promise<void> {
        // TODO: Implement Firebase add
        console.log('[MOCK] FirebaseServiceDefinitionRepository.add()', definition);
    }

    async update(id: string, updates: Partial<ServiceDefinition>): Promise<void> {
        // TODO: Implement Firebase update
        console.log('[MOCK] FirebaseServiceDefinitionRepository.update()', id, updates);
    }

    async delete(id: string): Promise<void> {
        // TODO: Implement Firebase delete
        console.log('[MOCK] FirebaseServiceDefinitionRepository.delete()', id);
    }

    async findById(id: string): Promise<ServiceDefinition | undefined> {
        // TODO: Implement Firebase findById
        console.log('[MOCK] FirebaseServiceDefinitionRepository.findById()', id);
        return undefined;
    }
}
