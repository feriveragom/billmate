import { ServiceDefinition } from '@/core/domain/entities';
import { IServiceDefinitionRepository } from '@/core/domain/repositories';

export class ServiceDefinitionService {
    constructor(private repository: IServiceDefinitionRepository) { }

    async getAll(): Promise<ServiceDefinition[]> {
        return this.repository.getAll();
    }

    async add(definition: ServiceDefinition): Promise<void> {
        // Business Logic: Validate definition if needed
        await this.repository.add(definition);
    }

    async update(id: string, updates: Partial<ServiceDefinition>): Promise<void> {
        await this.repository.update(id, updates);
    }

    async delete(id: string): Promise<void> {
        const definition = await this.repository.findById(id);
        if (definition?.isSystemService) {
            throw new Error('No se puede eliminar un servicio del sistema');
        }
        await this.repository.delete(id);
    }
}

