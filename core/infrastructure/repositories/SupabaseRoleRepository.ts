import { IRoleRepository, RoleWithPermissions } from '@/core/domain/repositories/IRoleRepository';
import { Role } from '@/core/domain/entities/Admin';
import { createAdminClient } from '@/lib/supabase/admin';

export class SupabaseRoleRepository implements IRoleRepository {
    async getAllWithPermissions(): Promise<RoleWithPermissions[]> {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('roles')
            .select(`
                id,
                name,
                label,
                description,
                is_system_role,
                role_permissions (
                    permissions (
                        code
                    )
                )
            `)
            .order('name', { ascending: true });

        if (error) throw error;

        return data.map((r: any) => ({
            id: r.id,
            name: r.name,
            label: r.label,
            description: r.description,
            isSystemRole: r.is_system_role,
            permissions: r.role_permissions?.map((rp: any) => rp.permissions?.code).filter(Boolean) || [],
            permission_codes: r.role_permissions?.map((rp: any) => rp.permissions?.code).filter(Boolean) || []
        }));
    }

    async create(roleData: { name: string; label: string; description: string; permissionCodes: string[] }): Promise<Role> {
        const adminClient = createAdminClient();

        // 1. Create Role
        const { data: newRole, error: roleError } = await adminClient
            .from('roles')
            .insert({
                name: roleData.name,
                label: roleData.label,
                description: roleData.description,
                is_system_role: false
            })
            .select()
            .single();

        if (roleError) throw roleError;

        // 2. Get Permission IDs
        const { data: permissions, error: permsError } = await adminClient
            .from('permissions')
            .select('id, code')
            .in('code', roleData.permissionCodes);

        if (permsError) throw permsError;

        // 3. Insert Relations
        if (permissions && permissions.length > 0) {
            const rolePermissions = permissions.map(p => ({
                role_id: newRole.id,
                permission_id: p.id
            }));

            const { error: rpError } = await adminClient
                .from('role_permissions')
                .insert(rolePermissions);

            if (rpError) throw rpError;
        }

        return {
            id: newRole.id,
            name: newRole.name,
            label: newRole.label,
            description: newRole.description,
            isSystemRole: newRole.is_system_role,
            permissions: roleData.permissionCodes
        };
    }

    async update(roleId: string, roleData: { label: string; description: string; permissionCodes: string[] }): Promise<void> {
        const adminClient = createAdminClient();

        // 1. Update Role details
        const { error: updateError } = await adminClient
            .from('roles')
            .update({
                label: roleData.label,
                description: roleData.description
            })
            .eq('id', roleId);

        if (updateError) throw updateError;

        // 2. Delete existing permissions
        const { error: deleteError } = await adminClient
            .from('role_permissions')
            .delete()
            .eq('role_id', roleId);

        if (deleteError) throw deleteError;

        // 3. Get new Permission IDs
        const { data: permissions, error: permsError } = await adminClient
            .from('permissions')
            .select('id, code')
            .in('code', roleData.permissionCodes);

        if (permsError) throw permsError;

        // 4. Insert new relations
        if (permissions && permissions.length > 0) {
            const rolePermissions = permissions.map(p => ({
                role_id: roleId,
                permission_id: p.id
            }));

            const { error: rpError } = await adminClient
                .from('role_permissions')
                .insert(rolePermissions);

            if (rpError) throw rpError;
        }
    }

    async delete(roleId: string): Promise<void> {
        const adminClient = createAdminClient();

        // 1. Delete relations
        const { error: rpError } = await adminClient
            .from('role_permissions')
            .delete()
            .eq('role_id', roleId);

        if (rpError) throw rpError;

        // 2. Delete role
        const { error: roleError } = await adminClient
            .from('roles')
            .delete()
            .eq('id', roleId);

        if (roleError) throw roleError;
    }
}
