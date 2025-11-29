import { IAuditLogRepository } from '@/core/domain/repositories/IAuditLogRepository';
import { AuditLog } from '@/core/domain/entities/Admin';
import { adminDb } from '@/lib/firebase/admin';

export class FirebaseAuditLogRepository implements IAuditLogRepository {
    async create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
        await adminDb.collection('audit_logs').add({
            ...log,
            createdAt: new Date()
        });
    }

    async getAll(filters?: { userId?: string; action?: string }): Promise<AuditLog[]> {
        let query: FirebaseFirestore.Query = adminDb.collection('audit_logs');

        if (filters?.userId) {
            query = query.where('userId', '==', filters.userId);
        }
        if (filters?.action) {
            query = query.where('action', '==', filters.action);
        }

        // Ordenar por fecha descendente
        query = query.orderBy('createdAt', 'desc');

        const snapshot = await query.get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                action: data.action,
                targetId: data.targetId,
                details: data.details,
                ipAddress: data.ipAddress,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            } as AuditLog;
        });
    }

    async delete(logId: string): Promise<void> {
        await adminDb.collection('audit_logs').doc(logId).delete();
    }

    async deleteMany(logIds: string[]): Promise<void> {
        const batch = adminDb.batch();
        logIds.forEach(id => {
            const ref = adminDb.collection('audit_logs').doc(id);
            batch.delete(ref);
        });
        await batch.commit();
    }
}
