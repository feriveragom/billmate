import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { cert } from 'firebase-admin/app';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
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
const auth = admin.auth();

async function createSuperAdmin() {
    const email = 'feriveragom@gmail.com';

    console.log(`🔍 Buscando usuario ${email} en Firebase Auth...`);

    try {
        // Intentar obtener el usuario por email
        const userRecord = await auth.getUserByEmail(email);
        console.log(`✅ Usuario encontrado en Auth: ${userRecord.uid}`);

        // Crear/actualizar el documento en Firestore
        await db.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            fullName: userRecord.displayName || 'Super Admin',
            avatarUrl: userRecord.photoURL || '',
            roleId: 'SUPER_ADMIN',
            isActive: true,
            createdAt: new Date(),
            lastLogin: new Date()
        }, { merge: true });

        console.log(`✅ Usuario ${email} configurado como SUPER_ADMIN en Firestore.`);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.log(`⚠️ Usuario no encontrado en Firebase Auth.`);
            console.log(`ℹ️ Debes hacer login al menos una vez para que Firebase Auth cree tu usuario.`);
            console.log(`ℹ️ Una vez que inicies sesión, vuelve a ejecutar este script.`);
        } else {
            console.error('❌ Error:', error);
        }
    }
}

createSuperAdmin().catch(console.error);
