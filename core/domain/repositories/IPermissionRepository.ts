import { Permission } from '../entities/Admin';

export interface IPermissionRepository {
    getAll(): Promise<Permission[]>;
    create(permissionData: { code: string; description: string; module: 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN' }): Promise<Permission>;
    update(permissionId: string, permissionData: { description: string; module: 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN' }): Promise<void>;
    delete(permissionId: string): Promise<void>;
}
