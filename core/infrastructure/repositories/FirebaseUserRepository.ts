import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { UserProfile } from '@/core/domain/entities/Admin';
import { adminDb } from '@/lib/firebase/admin';

export class FirebaseUserRepository implements IUserRepository {
    async getAll(): Promise<UserProfile[]> {
        const snapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                email: data.email,
                fullName: data.fullName,
                avatarUrl: data.avatarUrl,
                roleId: data.roleId,
                isBanned: !data.isActive,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate().toISOString() : undefined,
            } as UserProfile;
        });
    }

    async updateStatus(userId: string, isActive: boolean): Promise<void> {
        await adminDb.collection('users').doc(userId).update({ isActive });
    }

    async updateRole(userId: string, newRole: string): Promise<void> {
        await adminDb.collection('users').doc(userId).update({ roleId: newRole });
    }

    async getById(userId: string): Promise<UserProfile | null> {
        const doc = await adminDb.collection('users').doc(userId).get();
        if (!doc.exists) return null;
        const data = doc.data()!;
        return {
            id: doc.id,
            email: data.email,
            fullName: data.fullName,
            avatarUrl: data.avatarUrl,
            roleId: data.roleId,
            isBanned: !data.isActive,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate().toISOString() : undefined,
        } as UserProfile;
    }
}
