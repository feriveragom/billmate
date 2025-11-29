import { IPermissionRepository } from '@/core/domain/repositories/IPermissionRepository';
import { Permission } from '@/core/domain/entities/Admin';
import { createAdminClient } from '@/lib/supabase/admin';

export class SupabasePermissionRepository implements IPermissionRepository {
    async getAll(): Promise<Permission[]> {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('permissions')
            .select('*')
            .order('module', { ascending: true });

        if (error) throw error;

        return data.map(p => ({
            id: p.id,
            code: p.code,
            description: p.description,
            module: p.module as 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN'
        }));
    }

    async create(permissionData: { code: string; description: string; module: 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN' }): Promise<Permission> {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('permissions')
            .insert(permissionData)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            code: data.code,
            description: data.description,
            module: data.module as 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN'
        };
    }

    async update(permissionId: string, permissionData: { description: string; module: 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN' }): Promise<void> {
        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('permissions')
            .update(permissionData)
            .eq('id', permissionId);

        if (error) throw error;
    }

    async delete(permissionId: string): Promise<void> {
        const adminClient = createAdminClient();

        // Delete relations first
        await adminClient
            .from('role_permissions')
            .delete()
            .eq('permission_id', permissionId);

        // Delete permission
        const { error } = await adminClient
            .from('permissions')
            .delete()
            .eq('id', permissionId);

        if (error) throw error;
    }
}
