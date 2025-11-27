import { ServiceInstance } from '../entities';

export interface IServiceInstanceRepository {
    getAll(): Promise<ServiceInstance[]>;
    add(service: ServiceInstance): Promise<void>;
    update(id: string, updates: Partial<ServiceInstance>): Promise<void>;
    delete(id: string): Promise<void>;
}
