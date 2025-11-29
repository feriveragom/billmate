'use server';

import RepositoryFactory from '@/core/infrastructure/RepositoryFactory';
import { ServiceDefinitionService } from './services/service-definition.service';
import { ServiceInstanceService } from './services/service-instance.service';
import { ServiceDefinition, ServiceInstance } from '@/core/domain/entities';

// Service Definition Actions
export async function getAllServiceDefinitions() {
    const repo = RepositoryFactory.getServiceDefinitionRepository();
    const service = new ServiceDefinitionService(repo);
    return await service.getAll();
}

export async function addServiceDefinition(definition: ServiceDefinition) {
    const repo = RepositoryFactory.getServiceDefinitionRepository();
    const service = new ServiceDefinitionService(repo);
    return await service.add(definition);
}

export async function updateServiceDefinition(id: string, updates: Partial<ServiceDefinition>) {
    const repo = RepositoryFactory.getServiceDefinitionRepository();
    const service = new ServiceDefinitionService(repo);
    return await service.update(id, updates);
}

export async function deleteServiceDefinition(id: string) {
    const repo = RepositoryFactory.getServiceDefinitionRepository();
    const service = new ServiceDefinitionService(repo);
    return await service.delete(id);
}

// Service Instance Actions
export async function getAllServiceInstances() {
    const repo = RepositoryFactory.getServiceInstanceRepository();
    const service = new ServiceInstanceService(repo);
    return await service.getAll();
}

export async function addServiceInstance(instance: ServiceInstance) {
    const repo = RepositoryFactory.getServiceInstanceRepository();
    const service = new ServiceInstanceService(repo);
    return await service.add(instance);
}

export async function updateServiceInstance(id: string, updates: Partial<ServiceInstance>) {
    const repo = RepositoryFactory.getServiceInstanceRepository();
    const service = new ServiceInstanceService(repo);
    return await service.update(id, updates);
}

export async function deleteServiceInstance(id: string) {
    const repo = RepositoryFactory.getServiceInstanceRepository();
    const service = new ServiceInstanceService(repo);
    return await service.delete(id);
}
