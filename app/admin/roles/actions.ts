'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Verifica que el usuario tenga permiso admin.roles.manage
 */
async function verifyRoleManagement() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('No autenticado');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
        throw new Error('No autorizado');
    }

    return user.id;
}

/**
 * Obtiene todos los roles con sus permisos
 */
export async function getRolesWithPermissions() {
    try {
        await verifyRoleManagement();

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

        const formattedRoles = data?.map((r: any) => ({
            id: r.id,
            name: r.name,
            label: r.label,
            description: r.description,
            isSystemRole: r.is_system_role,
            permissions: r.role_permissions?.map((rp: any) => rp.permissions?.code).filter(Boolean) || [],
            permission_codes: r.role_permissions?.map((rp: any) => rp.permissions?.code).filter(Boolean) || []
        }));

        return { success: true, data: formattedRoles };
    } catch (error: any) {
        console.error('Error fetching roles:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene todos los permisos
 */
export async function getPermissions() {
    try {
        await verifyRoleManagement();

        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('permissions')
            .select('*')
            .order('module', { ascending: true });

        if (error) throw error;

        const formattedPermissions = data?.map(p => ({
            id: p.id,
            code: p.code,
            description: p.description,
            module: p.module as 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN'
        }));

        return { success: true, data: formattedPermissions };
    } catch (error: any) {
        console.error('Error fetching permissions:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Crea un nuevo rol
 */
export async function createRole(roleData: {
    name: string;
    label: string;
    description: string;
    permissionCodes: string[];
}) {
    try {
        await verifyRoleManagement();

        const adminClient = createAdminClient();

        // 1. Crear el rol
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

        // 2. Obtener IDs de permisos
        const { data: permissions, error: permsError } = await adminClient
            .from('permissions')
            .select('id, code')
            .in('code', roleData.permissionCodes);

        if (permsError) throw permsError;

        // 3. Crear relaciones rol-permiso
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

        revalidatePath('/admin/roles');
        return { success: true, data: newRole };
    } catch (error: any) {
        console.error('Error creating role:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualiza un rol existente
 */
export async function updateRole(
    roleId: string,
    roleData: {
        label: string;
        description: string;
        permissionCodes: string[];
    }
) {
    try {
        await verifyRoleManagement();

        const adminClient = createAdminClient();

        // 1. Actualizar datos básicos del rol
        const { error: updateError } = await adminClient
            .from('roles')
            .update({
                label: roleData.label,
                description: roleData.description
            })
            .eq('id', roleId);

        if (updateError) throw updateError;

        // 2. Eliminar permisos actuales
        const { error: deleteError } = await adminClient
            .from('role_permissions')
            .delete()
            .eq('role_id', roleId);

        if (deleteError) throw deleteError;

        // 3. Obtener IDs de nuevos permisos
        const { data: permissions, error: permsError } = await adminClient
            .from('permissions')
            .select('id, code')
            .in('code', roleData.permissionCodes);

        if (permsError) throw permsError;

        // 4. Crear nuevas relaciones
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

        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating role:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Crea un nuevo permiso
 */
export async function createPermission(permissionData: {
    code: string;
    description: string;
    module: 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN';
}) {
    try {
        await verifyRoleManagement();

        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('permissions')
            .insert(permissionData)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/admin/permissions');
        revalidatePath('/admin/roles');
        return { success: true, data };
    } catch (error: any) {
        console.error('Error creating permission:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualiza un permiso existente
 */
export async function updatePermission(
    permissionId: string,
    permissionData: {
        description: string;
        module: 'CORE' | 'SOCIAL' | 'ECOMMERCE' | 'ADMIN';
    }
) {
    try {
        await verifyRoleManagement();

        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('permissions')
            .update(permissionData)
            .eq('id', permissionId);

        if (error) throw error;

        revalidatePath('/admin/permissions');
        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating permission:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Elimina un permiso (cuidado: puede romper roles que lo usen)
 */
export async function deletePermission(permissionId: string) {
    try {
        await verifyRoleManagement();

        const adminClient = createAdminClient();

        // Primero eliminar de role_permissions (FK constraint)
        await adminClient
            .from('role_permissions')
            .delete()
            .eq('permission_id', permissionId);

        // Luego eliminar el permiso
        const { error } = await adminClient
            .from('permissions')
            .delete()
            .eq('id', permissionId);

        if (error) throw error;

        revalidatePath('/admin/permissions');
        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting permission:', error);
        return { success: false, error: error.message };
    }
}
