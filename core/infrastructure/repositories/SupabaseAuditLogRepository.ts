import { IAuditLogRepository } from '@/core/domain/repositories/IAuditLogRepository';
import { AuditLog } from '@/core/domain/entities/Admin';
import { createAdminClient } from '@/lib/supabase/admin';

export class SupabaseAuditLogRepository implements IAuditLogRepository {
    async create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('audit_logs')
            .insert({
                user_id: log.userId,
                action_type: log.action,
                action_description: log.details,
                ip_address: log.ipAddress
            });

        if (error) throw error;
    }

    async getAll(filters?: { userId?: string; action?: string }): Promise<AuditLog[]> {
        const adminClient = createAdminClient();

        let query = adminClient
            .from('audit_logs')
            .select(`
                *,
                profiles!inner(email)
            `)
            .order('created_at', { ascending: false });

        if (filters?.userId) {
            query = query.eq('user_id', filters.userId);
        }

        if (filters?.action) {
            query = query.eq('action_type', filters.action);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data.map((log: any) => ({
            id: log.id,
            userId: log.user_id,
            action: log.action_type,
            targetId: log.target_id,
            details: log.action_description,
            ipAddress: log.ip_address,
            createdAt: log.created_at
        }));
    }

    async delete(logId: string): Promise<void> {
        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('audit_logs')
            .delete()
            .eq('id', logId);

        if (error) throw error;
    }

    async deleteMany(logIds: string[]): Promise<void> {
        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('audit_logs')
            .delete()
            .in('id', logIds);

        if (error) throw error;
    }
}
