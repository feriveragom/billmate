# Plan de Implementación MVP - BillMate

## Estado Actual del Proyecto

### ✅ Implementado

#### 1. Autenticación Real (Google OAuth + Supabase)

**Flujo Completo:**
- Login con Google mediante Supabase Auth
- Callback automático después del OAuth
- Gestión de sesión con cookies seguras (HttpOnly, Secure, SameSite)
- Persistencia de sesión entre recargas

**Infraestructura:**
- **Supabase:**
  - Proyecto: `unflajvxpyqnndevuane.supabase.co`
  - Tabla `profiles` con RLS activado
  - Trigger automático `on_auth_user_created` para sincronización
  - Políticas de seguridad: lectura pública, edición propia
  
- **Google Cloud:**
  - Proyecto: BillMate
  - OAuth Client ID configurado (Web Application)
  - Authorized Origins: `localhost:3000`, `localhost:3001`, Supabase URL
  - Redirect URI: `https://unflajvxpyqnndevuane.supabase.co/auth/v1/callback`

**Código Frontend:**
- `lib/supabase/client.ts`: Cliente para browser
- `lib/supabase/server.ts`: Cliente para Server Components
- `middleware.ts`: Gestión de sesión en Edge Runtime
- `app/auth/callback/route.ts`: Endpoint de callback OAuth
- `components/features/auth/AuthProvider.tsx`: Context con estado de usuario y **carga de permisos**.
- `components/features/auth/ProtectedRoute.tsx`: Wrapper para rutas privadas basado en **Permisos**.
- `app/login/page.tsx`: Página de login con botón de Google

#### 2. Sistema de Seguridad Avanzado (Permission-Driven RBAC)

**Arquitectura:**
- El sistema se basa puramente en **Permisos** (`permissions`), no en roles hardcodeados.
- **Roles:** Son dinámicos y gestionables desde la UI. Existen roles base (`SUPER_ADMIN`, `ADMIN`, `FREE_USER`, `PREMIUM_USER`) pero pueden crearse más.
- **Automatismo:** Trigger en DB asegura que `SUPER_ADMIN` y `ADMIN` hereden automáticamente cualquier permiso nuevo creado.

**Protección de Rutas:**
- `/admin/users` -> Requiere `admin.users.manage`
- `/admin/roles` -> Requiere `admin.roles.manage`
- `/admin/logs` -> Requiere `admin.logs.view`
- `/admin/permissions` -> Requiere `admin.roles.manage`

#### 3. Panel de Administración

**Rutas:**
- `/admin` -> Redirige a `/admin/users`
- `/admin/users` -> Gestión de Usuarios (Banear, Cambiar Rol)
- `/admin/roles` -> Gestión de Roles (Crear/Editar Roles y asignar Permisos)
- `/admin/permissions` -> Gestión de Permisos (Crear/Editar definiciones de permisos)
- `/admin/logs` -> Logs de Auditoría

**Funcionalidades Activas:**
- **Layout Admin (`admin/layout.tsx`):** Sidebar persistente y navegación condicional basada en permisos.
- Gestión CRUD completa de Roles y Permisos.
- Matriz de asignación de permisos a roles.
- Logs de Auditoría completos.

#### 4. Sistema de Logs de Auditoría

**Ruta:** `/admin/logs`

**Base de Datos:**
- Tabla `audit_logs` con RLS
- Trigger automático `on_user_signup_log` para registro de nuevos usuarios
- Función helper `log_audit_event()` para logs manuales
- Función de limpieza `cleanup_old_audit_logs(days)`

**Funcionalidades Implementadas:**
- ✅ Visualización de logs desde Supabase
- ✅ Filtros por usuario (dropdown)
- ✅ Filtros por tipo de acción (LOGIN, SIGNUP, DELETE, etc.)
- ✅ Ordenado por fecha descendente
- ✅ Solo accesible si se tiene permiso `admin.logs.view`
- ✅ Eliminación individual de logs

#### 5. Perfil de Usuario

**Ruta:** `/profile`

**Funcionalidades:**
- Visualización de avatar, nombre, email y rol.
- Desglose detallado de permisos activos según el rol.
- **Header Global (`TopHeader.tsx`):**
    - Menú de usuario con avatar.
    - Acceso directo a Perfil y Admin.
    - **Logout funcional.**

# Implementación del Repository Pattern - BillMate

## ✅ Completado

### 1. Actualización de Documentación
- **`.github/copilot-instructions.md`**: Añadidas reglas ESTRICTAS sobre el Repository Pattern
- **`MVP_Core_Implementation_Plan.md`**: Actualizado con la sección de Arquitectura de Datos

### 2. Interfaces de Repositorio (Domain Layer)
Creadas en `core/domain/repositories/`:
- ✅ `IUserRepository.ts` - Gestión de usuarios
- ✅ `IRoleRepository.ts` - Gestión de roles  
- ✅ `IPermissionRepository.ts` - Gestión de permisos
- ✅ `IAuditLogRepository.ts` - Gestión de logs de auditoría
- ✅ `index.ts` - Exportación centralizada

### 3. Implementaciones Supabase (Infrastructure Layer)
Creadas en `core/infrastructure/repositories/`:
- ✅ `SupabaseUserRepository.ts`
- ✅ `SupabaseRoleRepository.ts`
- ✅ `SupabasePermissionRepository.ts`
- ✅ `SupabaseAuditLogRepository.ts`

### 4. Factory Pattern
- ✅ `core/infrastructure/RepositoryFactory.ts` - Punto único de cambio para migrar de DB

### 5. Refactorización de Server Actions
- ✅ `app/admin/users/actions.ts` - Ahora usa `IUserRepository`
- ✅ `app/admin/roles/actions.ts` - Ahora usa `IRoleRepository` y `IPermissionRepository`
- ✅ `app/admin/logs/actions.ts` - Ahora usa `IAuditLogRepository`

## 🎯 Beneficios Obtenidos

### Desacoplamiento Total
```typescript
// ❌ ANTES (acoplado a Supabase)
const { data } = await supabase.from('users').select('*');

// ✅ AHORA (desacoplado)
const userRepository = RepositoryFactory.getUserRepository();
const users = await userRepository.getAll();
```

### Migración Sencilla
Para cambiar de Supabase a Firebase:
1. Crear `FirebaseUserRepository.ts` implementando `IUserRepository`
2. Modificar `RepositoryFactory.ts` para retornar instancias Firebase
3. **NO tocar ningún Server Action ni componente**

### Testing Simplificado
Ahora puedes crear `MockUserRepository` para tests sin conectar a ninguna DB real.

## 🔒 Reglas Aplicadas

1. **PROHIBIDO** importar `@/lib/supabase` fuera de `core/infrastructure`
2. **OBLIGATORIO** usar interfaces del dominio en Server Actions
3. **OBLIGATORIO** obtener repositorios vía `RepositoryFactory`

## 📁 Estructura Final

```
core/
├── domain/
│   ├── entities/         # Modelos de negocio
│   └── repositories/     # ✅ INTERFACES (contratos)
│       ├── IUserRepository.ts
│       ├── IRoleRepository.ts
│       ├── IPermissionRepository.ts
│       └── IAuditLogRepository.ts
│
└── infrastructure/       # ✅ IMPLEMENTACIONES
    ├── RepositoryFactory.ts
    └── repositories/
        ├── SupabaseUserRepository.ts
        ├── SupabaseRoleRepository.ts
        ├── SupabasePermissionRepository.ts
        └── SupabaseAuditLogRepository.ts

app/
└── admin/
    ├── users/actions.ts    # ✅ Usa repositorios
    ├── roles/actions.ts    # ✅ Usa repositorios
    └── logs/actions.ts     # ✅ Usa repositorios
```

## 🚀 Próximos Pasos (Opcional)

- [ ] Migrar acciones de `auth` al Repository Pattern
- [ ] Crear repositorios para `ServiceDefinition` y `ServiceInstance`
- [ ] Agregar capa de caché en `RepositoryFactory`
- [ ] Crear tests unitarios con repositorios mock

---

## 📋 Pendientes

### Refactorización de Arquitectura (Route Groups)
- [ ] Reorganizar `app/` utilizando **Route Groups** para separar layouts:
    - `(auth)`: Login y flujos de autenticación.
    - `(social)`: App principal (Dashboard, Perfil) con diseño móvil-first.
    - `(admin)`: Panel de administración con layout denso y sidebar. (YA EXISTENTE, FALTA MOVER EL RESTO)
- [x] Crear componente reutilizable `UserMenu` (Avatar + Dropdown) para usar en ambos layouts.
- [ ] Limpiar `app/layout.tsx` raíz (eliminar UI global, dejar solo Providers).

### Autenticación y Admin
- [x] Implementar lógica de búsqueda de usuarios en Panel Admin
- [x] Crear menú de acciones por usuario (editar rol, banear, etc.)
- [x] Sistema dinámico de Roles y Permisos (CRUD completo desde UI)
- [x] Funcionalidad de Logout en la UI
- [x] Página de Perfil de Usuario

### Core Business (Pagos Recurrentes)
- [ ] Motor de Replicación (generación automática de pagos mensuales)
- [ ] Dashboard Financiero (totales del mes, proyecciones)
- [ ] Calendario de Pagos (visualización por fecha)
- [ ] Gestión de Definiciones de Servicio (crear categorías)
- [ ] Gestión de Instancias de Pago (marcar como pagado/vencido)

### Notificaciones
- [ ] Sistema de notificaciones In-App
- [ ] Push Notifications (PWA)
- [ ] Alertas de vencimiento

### Funcionalidades Sociales
- [ ] Solicitud de ayuda de pago (compartir con otros usuarios)
- [ ] Pago colaborativo

### E-Commerce (Opcional MVP)
- [ ] Catálogo de productos
- [ ] Gestión de órdenes

### Infraestructura
- [ ] Configuración de dominio personalizado
- [ ] Deploy con proxy reverso
- [ ] Configuración de PWA (Manifest, Service Worker)
- [ ] Build de APK (Capacitor/TWA)

### Workflow de Migraciones de Base de Datos

**Configuración Inicial (Solo una vez):**
```bash
# 1. Instalar CLI (vía npx, no requiere instalación global)
npx supabase --version

# 2. Autenticarse
npx supabase login

# 3. Enlazar proyecto local con remoto
npx supabase link --project-ref unflajvxpyqnndevuane
```

**Crear y Aplicar Migraciones:**
```bash
# 1. Crear nueva migración
npx supabase migration new nombre_descriptivo

# 2. Editar el archivo generado en supabase/migrations/
# (Añadir el SQL deseado)

# 3. Aplicar a Supabase remoto
npx supabase db push
```

**Comandos Útiles:**
```bash
# Ver diferencias entre local y remoto
npx supabase db diff

# Traer esquema remoto a local
npx supabase db pull

# Dump de datos
npx supabase db dump --data-only
```

---

## Arquitectura Propuesta (Route Groups)

### Estructura de Carpetas
```text
app/
├── layout.tsx             <-- (Root) Solo Providers y configuración global. SIN UI.
│
├── (auth)/                <-- Grupo 1: Autenticación
│   ├── login/page.tsx     <-- URL: /login
│
├── (social)/              <-- Grupo 2: Diseño "Red Social" (App Usuario)
│   ├── layout.tsx         <-- Layout A: TopHeader Simple + BottomNav (Móvil)
│   ├── page.tsx           <-- URL: / (Dashboard)
│   └── profile/page.tsx   <-- URL: /profile
│
└── admin/                 <-- Grupo 3: Diseño "Profesional" (Admin)
    ├── layout.tsx         <-- Layout B: Sidebar denso + Header de Admin
    ├── users/page.tsx     <-- URL: /admin/users
    ├── roles/page.tsx     <-- URL: /admin/roles
    ├── permissions/page.tsx <-- URL: /admin/permissions
    └── logs/page.tsx      <-- URL: /admin/logs
```

### Backend (Firebase)
- **Auth:** Google OAuth con Firebase Authentication
- **Database:** Firestore (NoSQL) con Security Rules
- **Storage:** Firebase Storage (para futuro)
- **Functions:** Cloud Functions (para futuro)

### Stack Tecnológico
- **Framework:** Next.js 15 (App Router, RSC)
- **Autenticación:** Firebase Authentication + Google OAuth
- **Base de Datos:** Firestore → Acceso EXCLUSIVO vía Repositorios
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Estado:** Zustand + React Context

## Arquitectura de Datos (Repository Pattern)
Para garantizar el desacoplamiento total de la base de datos:
1.  **Dominio (`core/domain/repositories`):** Define interfaces (`IUserRepository`, `IRoleRepository`).
2.  **Infraestructura (`core/infrastructure/repositories`):** Implementa las interfaces usando el driver específico (Firebase).
3.  **Factory (`core/infrastructure/RepositoryFactory.ts`):** Provee las instancias correctas.
4.  **Uso:** Los Server Actions solo importan interfaces y la Factory. NUNCA importan `firebase-admin` o `firebase/firestore` directamente.

---

# ⚠️ PLAN DE MIGRACIÓN: SUPABASE → FIREBASE

## 📋 FASE 0: Preparación (30 min)

### 0.1. Backup Completo
```bash
# Exportar datos de Supabase (desde dashboard o CLI)
npx supabase db dump --data-only > backup_supabase_data.sql

# Commit de seguridad
git add . && git commit -m "CHECKPOINT: Pre-Firebase migration"
git branch backup-pre-firebase
```

### 0.2. Crear Proyecto Firebase
1. Ir a **https://console.firebase.google.com**
2. Crear nuevo proyecto: `billmate-production`
3. Habilitar servicios:
   - ✅ Authentication (Google Provider)
   - ✅ Firestore Database (modo producción)
   - ✅ Storage (opcional, futuro)
4. Descargar `serviceAccountKey.json` (para admin SDK)
5. Copiar configuración web (para client SDK)

---

## 📋 FASE 1: Desinstalación y Limpieza (20 min)

### 1.1. Desinstalar Dependencias de Supabase
```bash
npm uninstall @supabase/supabase-js @supabase/ssr
npm uninstall supabase # CLI si la instalaste localmente
```

### 1.2. Instalar Dependencias de Firebase
```bash
npm install firebase firebase-admin
```

### 1.3. Eliminar Archivos de Supabase
```bash
# NO ejecutar aún, solo planificar:
rm -rf lib/supabase
rm -rf supabase # Directorio de migraciones
rm .env.local # Lo reescribiremos
```

**CHECKPOINT 1:** Commit antes de borrar
```bash
git add . && git commit -m "CHECKPOINT 1: Dependencies updated"
```

---

## 📋 FASE 2: Configuración de Firebase (30 min)

### 2.1. Variables de Entorno
Crear `.env.local`:
```env
# Firebase Web SDK (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@...iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 2.2. Crear Clientes Firebase
**Archivo:** `lib/firebase/client.ts`
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**Archivo:** `lib/firebase/admin.ts`
```typescript
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
```

**CHECKPOINT 2:** Commit
```bash
git add . && git commit -m "CHECKPOINT 2: Firebase config created"
```

---

## 📋 FASE 3: Migración de Datos (60 min)

### 3.1. Diseño de Colecciones Firestore

**Equivalencias:**
```
SQL Table              → Firestore Collection
-----------------      → ---------------------
profiles               → users
roles                  → roles
permissions            → permissions
role_permissions       → Sub-collection en roles/{roleId}/permissions
service_definitions    → service_definitions
service_instances      → service_instances
audit_logs             → audit_logs
```

### 3.2. Script de Migración de Datos
**Archivo:** `scripts/migrate-to-firebase.ts`

```typescript
import { adminDb } from '@/lib/firebase/admin';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateRoles() {
  const { data: roles } = await supabase.from('roles').select('*');
  for (const role of roles || []) {
    await adminDb.collection('roles').doc(role.id).set({
      name: role.name,
      label: role.label,
      description: role.description,
      isSystemRole: role.is_system_role,
      createdAt: new Date(role.created_at),
    });
    console.log(`✅ Migrated role: ${role.name}`);
  }
}

async function migratePermissions() {
  const { data: permissions } = await supabase.from('permissions').select('*');
  for (const perm of permissions || []) {
    await adminDb.collection('permissions').doc(perm.id).set({
      code: perm.code,
      description: perm.description,
      module: perm.module,
      createdAt: new Date(perm.created_at),
    });
    console.log(`✅ Migrated permission: ${perm.code}`);
  }
}

async function migrateRolePermissions() {
  const { data: rolePerms } = await supabase.from('role_permissions').select('*');
  for (const rp of rolePerms || []) {
    await adminDb
      .collection('roles')
      .doc(rp.role_id)
      .collection('permissions')
      .doc(rp.permission_id)
      .set({ assignedAt: new Date(rp.created_at) });
  }
  console.log(`✅ Migrated role_permissions`);
}

async function migrateProfiles() {
  const { data: profiles } = await supabase.from('profiles').select('*');
  for (const profile of profiles || []) {
    await adminDb.collection('users').doc(profile.id).set({
      email: profile.email,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      roleId: profile.role_id,
      isActive: profile.is_active,
      createdAt: new Date(profile.created_at),
    });
    console.log(`✅ Migrated user: ${profile.email}`);
  }
}

async function main() {
  console.log('🚀 Starting migration...');
  await migrateRoles();
  await migratePermissions();
  await migrateRolePermissions();
  await migrateProfiles();
  // Repetir para service_definitions, service_instances, audit_logs
  console.log('✅ Migration complete!');
}

main();
```

**Ejecutar:**
```bash
npx tsx scripts/migrate-to-firebase.ts
```

**CHECKPOINT 3:** Commit
```bash
git add . && git commit -m "CHECKPOINT 3: Data migrated to Firebase"
```

---

## 📋 FASE 4: Refactorización de Repositorios (90 min)

### 4.1. Renombrar Repositorios
```bash
# En core/infrastructure/repositories/
mv SupabaseUserRepository.ts FirebaseUserRepository.ts
mv SupabaseRoleRepository.ts FirebaseRoleRepository.ts
mv SupabasePermissionRepository.ts FirebasePermissionRepository.ts
mv SupabaseAuditLogRepository.ts FirebaseAuditLogRepository.ts
```

### 4.2. Ejemplo de Refactor: `FirebaseUserRepository.ts`
```typescript
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { UserProfile } from '@/core/domain/entities/Admin';
import { adminDb } from '@/lib/firebase/admin';

export class FirebaseUserRepository implements IUserRepository {
    async getAll(): Promise<UserProfile[]> {
        const snapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            email: doc.data().email,
            fullName: doc.data().fullName,
            avatarUrl: doc.data().avatarUrl,
            roleId: doc.data().roleId,
            isBanned: !doc.data().isActive,
            createdAt: doc.data().createdAt.toDate().toISOString(),
            lastLogin: doc.data().lastLogin?.toDate().toISOString(),
        }));
    }

    async updateStatus(userId: string, isActive: boolean): Promise<void> {
        await adminDb.collection('users').doc(userId).update({ isActive });
    }

    async updateRole(userId: string, newRole: string): Promise<void> {
        await adminDb.collection('users').doc(userId).update({ roleId: newRole });
    }

    async getById(userId: string): Promise<UserProfile | null> {
        const doc = await adminDb.collection('users').doc(userId).get();
        if (!doc.exists) return null;
        const data = doc.data()!;
        return {
            id: doc.id,
            email: data.email,
            fullName: data.fullName,
            avatarUrl: data.avatarUrl,
            roleId: data.roleId,
            isBanned: !data.isActive,
            createdAt: data.createdAt.toDate().toISOString(),
            lastLogin: data.lastLogin?.toDate().toISOString(),
        };
    }
}
```

### 4.3. Actualizar Factory
**Archivo:** `core/infrastructure/RepositoryFactory.ts`
```typescript
import { FirebaseUserRepository } from './repositories/FirebaseUserRepository';
// ... otros imports

class RepositoryFactory {
    static getUserRepository(): IUserRepository {
        return new FirebaseUserRepository(); // ⬅️ CAMBIO
    }
    // ... resto
}
```

**CHECKPOINT 4:** Commit
```bash
git add . && git commit -m "CHECKPOINT 4: Repositories refactored for Firebase"
```

---

## 📋 FASE 5: Configurar Firestore Security Rules (30 min)

**Archivo:** `firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid));
      let roleDoc = get(/databases/$(database)/documents/roles/$(userDoc.data.roleId));
      return roleDoc.data.name in ['ADMIN', 'SUPER_ADMIN'];
    }
    
    // Users
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow update: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
    }
    
    // Roles & Permissions (lectura pública autenticada)
    match /roles/{roleId} {
      allow read: if isAuthenticated();
    }
    match /permissions/{permId} {
      allow read: if isAuthenticated();
    }
    
    // Services
    match /service_definitions/{defId} {
      allow read, write: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    match /service_instances/{instId} {
      allow read, write: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Audit Logs (solo super admin)
    match /audit_logs/{logId} {
      allow read, delete: if isAdmin();
      allow create: if isAuthenticated();
    }
  }
}
```

**Desplegar:**
```bash
firebase deploy --only firestore:rules
```

**CHECKPOINT 5:** Commit
```bash
git add . && git commit -m "CHECKPOINT 5: Security rules configured"
```

---

## 📋 FASE 6: Actualizar AuthProvider (45 min)

**Archivo:** `components/features/auth/AuthProvider.tsx`

Reemplazar lógica de Supabase con Firebase Auth:
```typescript
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

// useEffect:
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Cargar permisos desde Firestore
      setUser({ ... });
    } else {
      setUser(null);
    }
  });
  return () => unsubscribe();
}, []);
```

**CHECKPOINT 6:** Commit
```bash
git add . && git commit -m "CHECKPOINT 6: AuthProvider migrated"
```

---

## 📋 FASE 7: Testing y Validación (60 min)

### 7.1. Verificaciones Críticas
- [ ] Login con Google funciona
- [ ] Permisos se cargan correctamente
- [ ] Admin puede ver usuarios
- [ ] CRUD de roles funciona
- [ ] CRUD de permisos funciona
- [ ] Audit logs se registran

### 7.2. Rollback Plan (si algo falla)
```bash
git checkout backup-pre-firebase
npm install # Reinstalar dependencias de Supabase
# Restaurar .env.local con credenciales de Supabase
```

**CHECKPOINT FINAL:** Commit
```bash
git add . && git commit -m "✅ MIGRATION COMPLETE: Firebase fully operational"
git tag v2.0.0-firebase
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Ejecutar en horario de bajo tráfico** (ej: domingo 3 AM)
2. **Hacer backup antes de cada fase** (commits frecuentes)
3. **No borrar Supabase inmediatamente** (mantener 30 días por seguridad)
4. **Monitorear Firebase Console** durante las primeras 48h
5. **Documentar cualquier issue en `MIGRATION_ISSUES.md`**

---

