import { Role } from '../entities/Admin';

export interface RoleWithPermissions extends Role {
    permission_codes: string[];
}

export interface IRoleRepository {
    getAllWithPermissions(): Promise<RoleWithPermissions[]>;
    create(roleData: { name: string; label: string; description: string; permissionCodes: string[] }): Promise<Role>;
    update(roleId: string, roleData: { label: string; description: string; permissionCodes: string[] }): Promise<void>;
    delete(roleId: string): Promise<void>;
}
