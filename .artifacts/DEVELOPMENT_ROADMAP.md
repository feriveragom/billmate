# Plan de Desarrollo - BillMate

> **Objetivo**: Completar la integración de permisos y repositorios Firebase siguiendo los patrones arquitectónicos establecidos.
> **Estado**: 🟡 En Planificación

---

## 🎯 Fase 1: Completar Sistema de Permisos (PRIORIDAD CRÍTICA)

### 1.1 Crear Helper de Validación Server-Side

**Objetivo**: Implementar validación de permisos en Server Actions.

**Archivo a crear**: `core/auth/server-permissions.ts`

**Funcionalidad requerida**:
```typescript
export async function checkServerPermission(permission: string): Promise<void>
export async function getCurrentUser(): Promise<User | null>
```

**Pasos**:
1. Obtener el usuario autenticado desde Firebase Admin usando cookies/session.
2. Consultar sus permisos desde Firestore.
3. Validar si tiene el permiso requerido.
4. Lanzar error si no tiene acceso.

**Ejemplo de uso**:
```typescript
'use server';
export async function someProtectedAction() {
    await checkServerPermission('resource.action'); // Patrón genérico
    // ... lógica de la acción
}
```

**Dependencias**:
- Firebase Admin SDK (ya instalado)
- `next/headers` para leer cookies

---

### 1.2 Proteger Server Actions - Usuarios (`app/admin/users/actions.ts`)

**Acciones a actualizar**:

| Acción | Permiso Requerido | Línea |
|--------|-------------------|-------|
| `getAdminUsers()` | `users.view` | 18 |
| `toggleUserStatus()` | `users.disable` | 37 |
| `updateUserRole()` | `users.edit.role` | 46 |

**Patrón a aplicar**:
```typescript
export async function getAdminUsers() {
    await checkServerPermission('users.view');
    // ... lógica existente
}
```

---

### 1.3 Proteger Server Actions - Logs (`app/admin/logs/actions.ts`)

**Acciones a actualizar**:

| Acción | Permiso Requerido | Línea |
|--------|-------------------|-------|
| `getAuditLogs()` | `logs.view` | 19 |
| `getUsersForFilter()` | `logs.view` | 43 |
| `deleteAuditLog()` | `logs.delete` | 58 |
| `deleteMultipleAuditLogs()` | `logs.delete` | 67 |

---

### 1.4 Proteger Server Actions - Roles y Permisos (`app/admin/roles/actions.ts`)

**Acciones a actualizar**:

| Acción | Permiso Requerido | Línea |
|--------|-------------------|-------|
| `getRolesWithPermissions()` | `roles.view` | 18 |
| `getPermissions()` | `permissions.view` | 35 |
| `createRole()` | `roles.create` | 52 |
| `updateRole()` | `roles.permissions.assign` | 75 |
| `deleteRole()` | `roles.delete` | 100 |
| `createPermission()` | `permissions.create` | 118 |
| `updatePermission()` | `permissions.edit` | 141 |
| `deletePermission()` | `permissions.delete` | 166 |

---

### 1.5 Actualizar Documentación

**Archivos a actualizar**:
- `.artifacts/PERMISSION_IMPLEMENTATION_MAP.md`: Añadir sección de Server Actions protegidas.

---

## 🎯 Fase 2: Implementar Repositorios Firebase Reales

### 2.1 Conexión de `FirebaseUserRepository`

**Estado Actual**: Mock con estructura básica (1983 bytes).

**Pasos**:
1. Revisar interfaz `IUserRepository` en `core/domain/repositories/IUserRepository.ts`.
2. Implementar métodos reales usando Firestore Admin SDK:
   - `getById(userId: string)`
   - `create(userData: CreateUserDTO)`
   - `update(userId: string, userData: UpdateUserDTO)`
   - `delete(userId: string)` (soft delete con `isActive = false`)
   - `getAll(filters?: UserFilters)`

**Esquema Firestore (colección `users`)**:
```typescript
{
  id: string (document ID)
  email: string
  fullName: string
  avatarUrl: string
  roleId: string (FK a roles)
  isActive: boolean
  createdAt: Timestamp
  lastLogin: Timestamp
}
```

---

### 2.2 Conexión de `FirebaseServiceDefinitionRepository`

**Estado Actual**: Mock con estructura básica (1278 bytes).

**Pasos**:
1. Revisar interfaz `IServiceDefinitionRepository`.
2. Implementar métodos reales:
   - `create(userId: string, definition: CreateServiceDefinitionDTO)`
   - `getById(definitionId: string)`
   - `getAllByUser(userId: string)`
   - `update(definitionId: string, data: UpdateServiceDefinitionDTO)`
   - `delete(definitionId: string)`

**Esquema Firestore (colección `serviceDefinitions`)**:
```typescript
{
  id: string (document ID)
  userId: string (FK a users)
  name: string
  description: string
  iconUrl: string
  color: string
  category: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Índice necesario**: Ya definido en `firestore.indexes.json` (userId + createdAt).

---

### 2.3 Conexión de `FirebaseServiceInstanceRepository`

**Estado Actual**: Mock con estructura básica (1015 bytes).

**Pasos**:
1. Revisar interfaz `IServiceInstanceRepository`.
2. Implementar métodos reales:
   - `create(userId: string, instance: CreateServiceInstanceDTO)`
   - `getById(instanceId: string)`
   - `getAllByUser(userId: string, filters?: InstanceFilters)`
   - `update(instanceId: string, data: UpdateServiceInstanceDTO)`
   - `delete(instanceId: string)`
   - `getUpcoming(userId: string, days: number)` (para notificaciones)

**Esquema Firestore (colección `serviceInstances`)**:
```typescript
{
  id: string (document ID)
  userId: string (FK a users)
  definitionId: string (FK a serviceDefinitions)
  amount: number
  dueDate: Timestamp
  status: 'PENDING' | 'PAID' | 'OVERDUE'
  notes: string
  isPaid: boolean
  paidAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Índices necesarios**: Ya definidos en `firestore.indexes.json`.

---

### 2.4 Conexión de `FirebaseActivityRepository`

**Estado Actual**: Mock con estructura básica (932 bytes).

**Pasos**:
1. Revisar interfaz `IActivityRepository`.
2. Implementar métodos reales:
   - `create(activity: CreateActivityDTO)`
   - `getByUser(userId: string, limit?: number)`
   - `getRecent(limit: number)`
   - `deleteOlderThan(days: number)` (para limpieza manual si TTL no está habilitado)

**Esquema Firestore (colección `activityLogs`)**:
```typescript
{
  id: string (document ID)
  userId: string
  tag: 'SERVICE_CREATED' | 'PAYMENT_MADE' | 'USER_LOGIN' | etc.
  description: string
  metadata: object (JSON flexible)
  createdAt: Timestamp
  expiresAt: Timestamp (para TTL)
}
```

**Configuración TTL**: Ver `.artifacts/INFRASTRUCTURE_SETUP.md`.

---

### 2.5 Actualizar `RepositoryFactory`

**Archivo**: `core/infrastructure/RepositoryFactory.ts`

**Pasos**:
1. Verificar que todas las instancias se creen correctamente.
2. Asegurar que se use el patrón Singleton para evitar múltiples conexiones.
3. Validar que las dependencias de Firebase Admin estén correctamente inicializadas.

---

## 🎯 Fase 3: Migrar Lógica de Negocio (Services)

### 3.1 Actualizar `AuthService`

**Archivo**: `features/auth/services/auth.service.ts`

**Estado**: ✅ Ya implementado con lógica real de Firestore.

---

### 3.2 Crear/Actualizar `BillingService`

**Archivo a crear**: `features/billing/services/billing.service.ts`

**Responsabilidades**:
- Crear definiciones de servicios
- Crear instancias de pago
- Marcar pagos como completados
- Obtener próximos pagos
- Calcular estadísticas

**Dependencias**:
- `IServiceDefinitionRepository`
- `IServiceInstanceRepository`
- `IActivityRepository`

---

### 3.3 Crear/Actualizar `ActivityService`

**Archivo a crear**: `features/activity/services/activity.service.ts`

**Responsabilidades**:
- Registrar actividades del usuario
- Obtener feed de actividades
- Limpiar logs antiguos

**Dependencias**:
- `IActivityRepository`

---

## 🎯 Fase 4: Conectar UI con Servicios Reales

### 4.1 Eliminar Mocks de Server Actions

**Archivos a actualizar**:
1. `app/admin/users/actions.ts`: Conectar con `UserRepository`.
2. `app/admin/logs/actions.ts`: Conectar con `ActivityRepository`.
3. `app/admin/roles/actions.ts`: Ya conectado con `RoleRepository` y `PermissionRepository`.

---

### 4.2 Actualizar QuickActions (Home)

**Archivo**: `features/home/components/QuickActions.tsx`

**Cambios**:
- Reemplazar datos mock con llamadas a Server Actions que usen `BillingService`.

---

### 4.3 Actualizar ActivityFeed

**Archivo**: `features/activity/components/ActivityFeed.tsx`

**Cambios**:
- Reemplazar datos mock con llamadas a Server Actions que usen `ActivityService`.

---

---

## 🎯 Fase 5: Automatización de Limpieza de Logs

### 5.1 Implementar Cron Job para Limpieza Automática

**Objetivo**: Eliminar logs expirados diariamente sin requerir billing de Firebase.

**Enfoque**: Usar **Next.js API Route** + **cron-job.org** (o similar) que ejecute la limpieza diariamente.

---

#### API Route + Servicio Externo de Cron

**Archivo a crear**: `app/api/cron/cleanup-logs/route.ts`

**Implementación**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import RepositoryFactory from '@/core/infrastructure/RepositoryFactory';

export async function GET(request: NextRequest) {
    // Validar token de seguridad
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const auditLogRepo = RepositoryFactory.getAuditLogRepository();
        
        // Buscar y eliminar logs expirados
        const deletedCount = await auditLogRepo.deleteExpired();
        
        return NextResponse.json({ 
            success: true, 
            deletedCount,
            timestamp: new Date().toISOString() 
        });
    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
```

**Pasos**:
1. Crear el archivo API route.
2. Añadir `CRON_SECRET` a `.env.local` (token de seguridad).
3. Implementar método `deleteExpired()` en `FirebaseAuditLogRepository.ts`:
   ```typescript
   async deleteExpired(): Promise<number> {
       const now = new Date();
       const snapshot = await adminDb.collection('audit_logs')
           .where('expiresAt', '<=', now)
           .get();
       
       const batch = adminDb.batch();
       snapshot.docs.forEach(doc => batch.delete(doc.ref));
       await batch.commit();
       
       return snapshot.size;
   }
   ```
4. Configurar cron externo (https://cron-job.org):
   - URL: `https://tu-dominio.vercel.app/api/cron/cleanup-logs`
   - Header: `Authorization: Bearer TU_CRON_SECRET`
   - Frecuencia: Diario a las 03:00 AM

**Ventajas**:
- ✅ No requiere billing de Firebase
- ✅ Funciona con Vercel/Netlify gratis
- ✅ Fácil de probar manualmente

---

### 5.2 Actualizar Repositorio

**Archivo**: `core/infrastructure/repositories/FirebaseAuditLogRepository.ts`

**Método a añadir**:
```typescript
async deleteExpired(): Promise<number> {
    const now = new Date();
    const snapshot = await adminDb.collection('audit_logs')
        .where('expiresAt', '<=', now)
        .get();
    
    if (snapshot.empty) return 0;
    
    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    console.log(`[AuditLogRepo] Deleted ${snapshot.size} expired logs`);
    return snapshot.size;
}
```

**Actualizar interfaz**: `core/domain/repositories/IAuditLogRepository.ts`
```typescript
export interface IAuditLogRepository {
    // ... métodos existentes
    deleteExpired(): Promise<number>;
}
```

---

### 5.3 Variables de Entorno

**Añadir a `.env.local`**:
```bash
# Cron Job Security
CRON_SECRET=tu_token_secreto_aleatorio_aqui
```

**Generar token seguro**:
```bash
openssl rand -base64 32
```

---

### 5.4 Testing

**Test manual** (desde terminal o Postman):
```bash
curl -X GET https://localhost:3000/api/cron/cleanup-logs \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

**Respuesta esperada**:
```json
{
  "success": true,
  "deletedCount": 42,
  "timestamp": "2025-11-30T16:00:00.000Z"
}
```

---

## 📋 Checklist de Verificación Final

### Seguridad
- [ ] Todas las Server Actions validan permisos
- [ ] Firestore Rules están publicadas y activas
- [ ] No hay accesos directos a Firebase desde componentes cliente
- [ ] Los bypass de auth (`temp-admin-id`) están eliminados

### Funcionalidad
- [ ] Login con Google funciona y crea usuarios automáticamente
- [ ] SUPER_ADMIN puede acceder a todas las páginas admin
- [ ] FREE_USER solo ve su propio dashboard
- [ ] Los permisos se cargan correctamente desde Firestore

### Base de Datos
- [ ] Índices compuestos están creados
- [ ] Roles y permisos están seeded correctamente (`npx tsx scripts/seed-database.ts`)
- [ ] Usuario SUPER_ADMIN existe (`npx tsx scripts/create-super-admin.ts`)
- [ ] Limpieza automática de logs está configurada (API route + cron externo)

### Código
- [ ] No hay imports directos de Infrastructure en Presentation
- [ ] Todos los Services usan Interfaces de Repository
- [ ] No hay verificaciones de `user.role` para control de acceso
- [ ] Todos los inputs están validados con Zod

---

## 📚 Referencias

- **Arquitectura**: `.github/copilot-instructions.md`
- **Permisos**: `.artifacts/PERMISSION_IMPLEMENTATION_MAP.md`
- **Infraestructura**: `.artifacts/INFRASTRUCTURE_SETUP.md`
- **Seed de Datos**: `scripts/seed-database.ts`
