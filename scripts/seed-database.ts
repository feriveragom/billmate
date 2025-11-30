import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { cert } from 'firebase-admin/app';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// Manejar saltos de línea en la clave privada
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Faltan variables de entorno de Firebase Admin.');
    process.exit(1);
}

// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

const db = admin.firestore();

// === DEFINICIÓN DE PERMISOS ===
const PERMISSIONS = [
    // Servicios
    { id: 'services.view', name: 'Ver Servicios', description: 'Permite ver la lista de servicios', resource: 'services', action: 'view' },
    { id: 'services.definition.create', name: 'Crear Definición de Servicio', description: 'Permite crear nuevas definiciones de servicios', resource: 'services.definition', action: 'create' },
    { id: 'services.definition.edit', name: 'Editar Definición de Servicio', description: 'Permite editar definiciones de servicios', resource: 'services.definition', action: 'edit' },
    { id: 'services.definition.delete', name: 'Eliminar Definición de Servicio', description: 'Permite eliminar definiciones de servicios', resource: 'services.definition', action: 'delete' },
    { id: 'services.instance.create', name: 'Crear Instancia de Servicio', description: 'Permite crear nuevas instancias de pago', resource: 'services.instance', action: 'create' },
    { id: 'services.instance.edit', name: 'Editar Instancia de Servicio', description: 'Permite editar instancias de pago', resource: 'services.instance', action: 'edit' },
    { id: 'services.instance.delete', name: 'Eliminar Instancia de Servicio', description: 'Permite eliminar instancias de pago', resource: 'services.instance', action: 'delete' },

    // Usuarios
    { id: 'users.view', name: 'Ver Usuarios', description: 'Permite ver la lista de usuarios', resource: 'users', action: 'view' },
    { id: 'users.edit.role', name: 'Editar Rol de Usuario', description: 'Permite cambiar el rol de un usuario', resource: 'users', action: 'edit.role' },
    { id: 'users.disable', name: 'Deshabilitar Usuario', description: 'Permite deshabilitar usuarios', resource: 'users', action: 'disable' },
    { id: 'users.view.log', name: 'Ver Log de Usuario', description: 'Permite ver el registro de actividad de usuarios', resource: 'users', action: 'view.log' },

    // Permisos
    { id: 'permissions.view', name: 'Ver Permisos', description: 'Permite ver la lista de permisos', resource: 'permissions', action: 'view' },
    { id: 'permissions.create', name: 'Crear Permiso', description: 'Permite crear nuevos permisos', resource: 'permissions', action: 'create' },
    { id: 'permissions.edit', name: 'Editar Permiso', description: 'Permite editar permisos existentes', resource: 'permissions', action: 'edit' },
    { id: 'permissions.delete', name: 'Eliminar Permiso', description: 'Permite eliminar permisos', resource: 'permissions', action: 'delete' },

    // Roles
    { id: 'roles.view', name: 'Ver Roles', description: 'Permite ver la lista de roles', resource: 'roles', action: 'view' },
    { id: 'roles.create', name: 'Crear Rol', description: 'Permite crear nuevos roles', resource: 'roles', action: 'create' },
    { id: 'roles.delete', name: 'Eliminar Rol', description: 'Permite eliminar roles', resource: 'roles', action: 'delete' },
    { id: 'roles.permissions.assign', name: 'Asignar Permisos a Rol', description: 'Permite asignar permisos a roles', resource: 'roles.permissions', action: 'assign' },
    { id: 'roles.permissions.revoke', name: 'Revocar Permisos de Rol', description: 'Permite revocar permisos de roles', resource: 'roles.permissions', action: 'revoke' },

    // Logs
    { id: 'logs.view', name: 'Ver Logs', description: 'Permite ver registros de actividad del sistema', resource: 'logs', action: 'view' },
    { id: 'logs.delete', name: 'Eliminar Logs', description: 'Permite eliminar registros de actividad', resource: 'logs', action: 'delete' }
];

// === DEFINICIÓN DE ROLES ===
const ROLES = [
    {
        id: 'SUPER_ADMIN',
        name: 'Super Admin',
        label: 'Super Administrador',
        description: 'Acceso total al sistema',
        isSystemRole: true,
        permissionCodes: PERMISSIONS.map(p => p.id) // Todos los permisos
    },
    {
        id: 'ADMIN',
        name: 'Admin',
        label: 'Administrador',
        description: 'Gestión de usuarios y soporte',
        isSystemRole: true,
        permissionCodes: [
            'services.view',
            'services.definition.create',
            'services.definition.edit',
            'services.definition.delete',
            'services.instance.create',
            'services.instance.edit',
            'services.instance.delete',
            'users.view',
            'users.edit.role',
            'users.disable',
            'users.view.log',
            'permissions.view',
            'permissions.create',
            'permissions.edit',
            'permissions.delete',
            'roles.view',
            'roles.create',
            'roles.delete',
            'roles.permissions.assign',
            'roles.permissions.revoke',
            'logs.view',
            'logs.delete'
        ]
    },
    {
        id: 'FREE_USER',
        name: 'Free User',
        label: 'Usuario Gratuito',
        description: 'Acceso básico al sistema',
        isSystemRole: true,
        permissionCodes: [
            'services.view',
            'services.instance.create',
            'services.instance.edit',
            'services.instance.delete'
        ]
    },
    {
        id: 'PREMIUM_USER',
        name: 'Premium User',
        label: 'Usuario Premium',
        description: 'Acceso completo a servicios',
        isSystemRole: true,
        permissionCodes: [
            'services.view',
            'services.definition.create',
            'services.definition.edit',
            'services.definition.delete',
            'services.instance.create',
            'services.instance.edit',
            'services.instance.delete'
        ]
    }
];

async function seedDatabase() {
    console.log('🌱 Iniciando seed de la base de datos...');
    const batch = db.batch();

    // 1. Seed Permisos
    console.log('   - Procesando permisos...');
    for (const perm of PERMISSIONS) {
        const permRef = db.collection('permissions').doc(perm.id);
        batch.set(permRef, {
            ...perm,
            updatedAt: new Date()
        }, { merge: true });
    }

    // 2. Seed Roles
    console.log('   - Procesando roles...');
    for (const role of ROLES) {
        const roleRef = db.collection('roles').doc(role.id);
        batch.set(roleRef, {
            name: role.name,
            label: role.label,
            description: role.description,
            isSystemRole: role.isSystemRole,
            permissionCodes: role.permissionCodes,
            updatedAt: new Date()
        }, { merge: true });
    }

    await batch.commit();
    console.log('✅ Base de datos (Roles y Permisos) sincronizada correctamente.');
}

seedDatabase().catch(console.error);
