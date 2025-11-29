import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IRoleRepository } from '@/core/domain/repositories/IRoleRepository';
import { IPermissionRepository } from '@/core/domain/repositories/IPermissionRepository';
import { IAuditLogRepository } from '@/core/domain/repositories/IAuditLogRepository';
import { IServiceDefinitionRepository } from '@/core/domain/repositories/IServiceDefinitionRepository';
import { IServiceInstanceRepository } from '@/core/domain/repositories/IServiceInstanceRepository';
import { IActivityRepository } from '@/core/domain/repositories/IActivityRepository';

import { FirebaseUserRepository } from './repositories/FirebaseUserRepository';
import { FirebaseRoleRepository } from './repositories/FirebaseRoleRepository';
import { FirebasePermissionRepository } from './repositories/FirebasePermissionRepository';
import { FirebaseAuditLogRepository } from './repositories/FirebaseAuditLogRepository';
import { FirebaseServiceDefinitionRepository } from './repositories/FirebaseServiceDefinitionRepository';
import { FirebaseServiceInstanceRepository } from './repositories/FirebaseServiceInstanceRepository';
import { FirebaseActivityRepository } from './repositories/FirebaseActivityRepository';

/**
 * Factory Pattern para crear instancias de repositorios.
 * 
 * VENTAJA CLAVE: Para migrar a Firebase, solo hay que:
 * 1. Crear FirebaseUserRepository, FirebaseRoleRepository, etc.
 * 2. Cambiar estas líneas para que devuelvan las instancias Firebase.
 * 3. ¡Listo! Ningún Server Action necesita cambiar.
 */

class RepositoryFactory {
    private static userRepository: IUserRepository;
    private static roleRepository: IRoleRepository;
    private static permissionRepository: IPermissionRepository;
    private static auditLogRepository: IAuditLogRepository;
    private static serviceDefinitionRepository: IServiceDefinitionRepository;
    private static serviceInstanceRepository: IServiceInstanceRepository;
    private static activityRepository: IActivityRepository;

    static getUserRepository(): IUserRepository {
        if (!this.userRepository) {
            this.userRepository = new FirebaseUserRepository();
        }
        return this.userRepository;
    }

    static getRoleRepository(): IRoleRepository {
        if (!this.roleRepository) {
            this.roleRepository = new FirebaseRoleRepository();
        }
        return this.roleRepository;
    }

    static getPermissionRepository(): IPermissionRepository {
        if (!this.permissionRepository) {
            this.permissionRepository = new FirebasePermissionRepository();
        }
        return this.permissionRepository;
    }

    static getAuditLogRepository(): IAuditLogRepository {
        if (!this.auditLogRepository) {
            this.auditLogRepository = new FirebaseAuditLogRepository();
        }
        return this.auditLogRepository;
    }

    static getServiceDefinitionRepository(): IServiceDefinitionRepository {
        if (!this.serviceDefinitionRepository) {
            this.serviceDefinitionRepository = new FirebaseServiceDefinitionRepository();
        }
        return this.serviceDefinitionRepository;
    }

    static getServiceInstanceRepository(): IServiceInstanceRepository {
        if (!this.serviceInstanceRepository) {
            this.serviceInstanceRepository = new FirebaseServiceInstanceRepository();
        }
        return this.serviceInstanceRepository;
    }

    static getActivityRepository(): IActivityRepository {
        if (!this.activityRepository) {
            this.activityRepository = new FirebaseActivityRepository();
        }
        return this.activityRepository;
    }
}

export default RepositoryFactory;

