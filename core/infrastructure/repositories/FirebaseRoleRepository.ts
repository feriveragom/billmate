import { IRoleRepository, RoleWithPermissions } from '@/core/domain/repositories/IRoleRepository';
import { Role } from '@/core/domain/entities/Admin';
import { adminDb } from '@/lib/firebase/admin';

export class FirebaseRoleRepository implements IRoleRepository {
    async getAllWithPermissions(): Promise<RoleWithPermissions[]> {
        const snapshot = await adminDb.collection('roles').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const permissionCodes = data.permissionCodes || [];
            return {
                id: doc.id,
                name: data.name,
                label: data.label,
                description: data.description,
                isSystemRole: data.isSystemRole,
                permissions: permissionCodes,
                permission_codes: permissionCodes // Mapping for compatibility
            } as RoleWithPermissions;
        });
    }

    async create(roleData: { name: string; label: string; description: string; permissionCodes: string[] }): Promise<Role> {
        const newRoleRef = adminDb.collection('roles').doc();
        const newRole = {
            name: roleData.name,
            label: roleData.label,
            description: roleData.description,
            permissionCodes: roleData.permissionCodes,
            isSystemRole: false,
            createdAt: new Date()
        };
        await newRoleRef.set(newRole);
        
        return {
            id: newRoleRef.id,
            name: newRole.name,
            label: newRole.label,
            description: newRole.description,
            isSystemRole: newRole.isSystemRole,
            permissions: newRole.permissionCodes
        };
    }

    async update(roleId: string, roleData: { label: string; description: string; permissionCodes: string[] }): Promise<void> {
        await adminDb.collection('roles').doc(roleId).update({
            label: roleData.label,
            description: roleData.description,
            permissionCodes: roleData.permissionCodes
        });
    }

    async delete(roleId: string): Promise<void> {
        await adminDb.collection('roles').doc(roleId).delete();
    }
}
