import { IPermissionRepository } from '@/core/domain/repositories/IPermissionRepository';
import { Permission } from '@/core/domain/entities/Admin';
import { adminDb } from '@/lib/firebase/admin';

export class FirebasePermissionRepository implements IPermissionRepository {
    async getAll(): Promise<Permission[]> {
        const snapshot = await adminDb.collection('permissions').orderBy('code').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            code: doc.data().code,
            description: doc.data().description,
            module: doc.data().module
        } as Permission));
    }

    async create(permissionData: { code: string; description: string; module: 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN' }): Promise<Permission> {
        const newPermRef = adminDb.collection('permissions').doc();
        const newPerm = {
            code: permissionData.code,
            description: permissionData.description,
            module: permissionData.module,
            createdAt: new Date()
        };
        await newPermRef.set(newPerm);

        return {
            id: newPermRef.id,
            code: newPerm.code,
            description: newPerm.description,
            module: newPerm.module
        };
    }

    async update(permissionId: string, permissionData: { description: string; module: 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN' }): Promise<void> {
        await adminDb.collection('permissions').doc(permissionId).update({
            description: permissionData.description,
            module: permissionData.module
        });
    }

    async delete(permissionId: string): Promise<void> {
        await adminDb.collection('permissions').doc(permissionId).delete();
    }
}
