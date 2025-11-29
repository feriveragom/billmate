import 'dotenv/config';
import { initializeApp, getApps, getApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Permission, Role } from '../core/domain/entities/Admin';

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

console.log("Project ID:", serviceAccount.projectId);
console.log("Client Email:", serviceAccount.clientEmail);
console.log("Private Key exists:", !!serviceAccount.privateKey);

const app = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
    })
  : getApp();

const adminDb = getFirestore(app);

const PERMISSIONS: Omit<Permission, 'id'>[] = [
    // Admin Module
    { code: 'admin.users.manage', description: 'Gestionar usuarios (banear, cambiar rol)', module: 'ADMIN' },
    { code: 'admin.roles.manage', description: 'Gestionar roles y permisos', module: 'ADMIN' },
    { code: 'admin.logs.view', description: 'Ver logs de auditoría', module: 'ADMIN' },
    
    // Core Module (Services)
    { code: 'service.create', description: 'Crear servicios', module: 'CORE' },
    { code: 'service.read', description: 'Ver servicios', module: 'CORE' },
    { code: 'service.update', description: 'Editar servicios', module: 'CORE' },
    { code: 'service.delete', description: 'Eliminar servicios', module: 'CORE' },
    
    // Social Module
    { code: 'social.profile.view', description: 'Ver perfiles públicos', module: 'SOCIAL' },
];

const ROLES = [
    {
        name: 'SUPER_ADMIN',
        label: 'Super Administrador',
        description: 'Acceso total al sistema',
        isSystemRole: true,
        permissions: PERMISSIONS.map(p => p.code) // All permissions
    },
    {
        name: 'ADMIN',
        label: 'Administrador',
        description: 'Gestión de usuarios y soporte',
        isSystemRole: true,
        permissions: ['admin.users.manage', 'admin.logs.view', 'social.profile.view']
    },
    {
        name: 'FREE_USER',
        label: 'Usuario Gratuito',
        description: 'Plan básico',
        isSystemRole: true,
        permissions: ['service.create', 'service.read', 'service.update', 'service.delete', 'social.profile.view']
    },
    {
        name: 'PREMIUM_USER',
        label: 'Usuario Premium',
        description: 'Plan completo',
        isSystemRole: true,
        permissions: PERMISSIONS.map(p => p.code) // For now, same as Super Admin regarding features, but restricted in Admin
            .filter(code => !code.startsWith('admin.'))
    }
];

async function seedPermissions() {
    console.log('🌱 Seeding Permissions...');
    const batch = adminDb.batch();
    
    for (const perm of PERMISSIONS) {
        const ref = adminDb.collection('permissions').doc(); // Auto-ID
        // Check if exists by code to avoid duplicates if run multiple times?
        // For simplicity, we'll just add them. In a real seed, we might want to upsert based on code.
        // Let's try to find existing one first.
        const snapshot = await adminDb.collection('permissions').where('code', '==', perm.code).get();
        
        if (snapshot.empty) {
            batch.set(ref, { ...perm, createdAt: new Date() });
        } else {
            console.log(`   Skipping ${perm.code} (already exists)`);
        }
    }
    
    await batch.commit();
    console.log('✅ Permissions seeded.');
}

async function seedRoles() {
    console.log('🌱 Seeding Roles...');
    
    for (const role of ROLES) {
        // Upsert based on name (ID will be the name for simplicity in lookup, or we query)
        // Let's use the name as ID for system roles to make them easy to find? 
        // No, better use auto-ID but query by name.
        
        const snapshot = await adminDb.collection('roles').where('name', '==', role.name).get();
        
        if (snapshot.empty) {
            await adminDb.collection('roles').add({
                ...role,
                permissionCodes: role.permissions, // Store codes directly for easier checking
                createdAt: new Date()
            });
            console.log(`   Created role: ${role.name}`);
        } else {
            console.log(`   Skipping role ${role.name} (already exists)`);
            // Optional: Update permissions if they changed
            const doc = snapshot.docs[0];
            await doc.ref.update({
                permissionCodes: role.permissions
            });
            console.log(`   Updated permissions for ${role.name}`);
        }
    }
    console.log('✅ Roles seeded.');
}

async function main() {
    try {
        await seedPermissions();
        await seedRoles();
        console.log('🚀 Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
}

main();
