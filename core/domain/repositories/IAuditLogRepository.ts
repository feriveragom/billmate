import { AuditLog } from '../entities/Admin';

export interface IAuditLogRepository {
    create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void>;
    getAll(filters?: { userId?: string; action?: string }): Promise<AuditLog[]>;
    delete(logId: string): Promise<void>;
    deleteMany(logIds: string[]): Promise<void>;
}
