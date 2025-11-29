import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { UserProfile } from '@/core/domain/entities/Admin';
import { createAdminClient } from '@/lib/supabase/admin';

export class SupabaseUserRepository implements IUserRepository {
    async getAll(): Promise<UserProfile[]> {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((p: any) => ({
            id: p.id,
            email: p.email,
            fullName: p.full_name,
            avatarUrl: p.avatar_url,
            roleId: p.role, // Mapping 'role' string to roleId for now as per interface, or should I update interface?
            // The interface UserProfile has roleId, but the DB has 'role'. 
            // Let's check UserProfile definition again.
            // export interface UserProfile { ... roleId: string; ... }
            // In DB it is 'role' column (e.g. 'ADMIN'). 
            // I will map it directly.
            isBanned: !p.is_active, // DB has is_active, interface has isBanned
            createdAt: p.created_at,
            lastLogin: p.last_sign_in_at
        }));
    }

    async updateStatus(userId: string, isActive: boolean): Promise<void> {
        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('profiles')
            .update({ is_active: isActive })
            .eq('id', userId);

        if (error) throw error;
    }

    async updateRole(userId: string, newRole: string): Promise<void> {
        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) throw error;
    }

    async getById(userId: string): Promise<UserProfile | null> {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) return null;

        return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            avatarUrl: data.avatar_url,
            roleId: data.role,
            isBanned: !data.is_active,
            createdAt: data.created_at,
            lastLogin: data.last_sign_in_at
        };
    }
}
