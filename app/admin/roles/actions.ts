'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import RepositoryFactory from '@/core/infrastructure/RepositoryFactory';

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

        const roleRepository = RepositoryFactory.getRoleRepository();
        const roles = await roleRepository.getAllWithPermissions();

        return { success: true, data: roles };
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

        const permissionRepository = RepositoryFactory.getPermissionRepository();
        const permissions = await permissionRepository.getAll();

        return { success: true, data: permissions };
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

        const roleRepository = RepositoryFactory.getRoleRepository();
        const newRole = await roleRepository.create(roleData);

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

        const roleRepository = RepositoryFactory.getRoleRepository();
        await roleRepository.update(roleId, roleData);

        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating role:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Elimina un rol
 */
export async function deleteRole(roleId: string) {
    try {
        await verifyRoleManagement();

        const roleRepository = RepositoryFactory.getRoleRepository();
        await roleRepository.delete(roleId);

        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting role:', error);
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

        const permissionRepository = RepositoryFactory.getPermissionRepository();
        const newPermission = await permissionRepository.create(permissionData);

        revalidatePath('/admin/permissions');
        revalidatePath('/admin/roles');
        return { success: true, data: newPermission };
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

        const permissionRepository = RepositoryFactory.getPermissionRepository();
        await permissionRepository.update(permissionId, permissionData);

        revalidatePath('/admin/permissions');
        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating permission:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Elimina un permiso
 */
export async function deletePermission(permissionId: string) {
    try {
        await verifyRoleManagement();

        const permissionRepository = RepositoryFactory.getPermissionRepository();
        await permissionRepository.delete(permissionId);

        revalidatePath('/admin/permissions');
        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting permission:', error);
        return { success: false, error: error.message };
    }
}
