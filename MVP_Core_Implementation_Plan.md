# Plan de Implementación MVP - BillMate (Firebase Edition)

## Estado Actual del Proyecto

### ✅ Implementación Firebase

El proyecto utiliza exclusivamente el ecosistema de Firebase (Auth, Firestore, Hosting/Functions).

### ✅ Implementado

#### 1. Infraestructura Base
- **Firebase CLI:** Instalado y configurado.
- **Dependencias:** `firebase` y `firebase-admin` instaladas.
- **Configuración:** `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json` creados.
- **Librerías:** Estructura `lib/firebase/` creada (`client.ts`, `admin.ts`, `config.ts`).

#### 2. Arquitectura de Datos (Repository Pattern)
- **Interfaces:** Definidas en `core/domain/repositories/`.
- **Implementaciones:** Repositorios base creados en `core/infrastructure/repositories/` (FirebaseUserRepository, etc.).
- **Factory:** `RepositoryFactory` actualizado para usar implementaciones de Firebase.

---

# ⚠️ PLAN DE ACCIÓN: IMPLEMENTACIÓN FIREBASE

Este plan define los pasos para completar la implementación de la lógica de negocio sobre Firebase.

## 📋 FASE 1: Configuración (COMPLETADO)

### 1.1. Configurar Firebase
- [x] Crear proyecto en Firebase Console.
- [x] Obtener credenciales (Web Config y Service Account).
- [ ] Configurar variables de entorno en `.env.local`:
    - `NEXT_PUBLIC_FIREBASE_API_KEY`
    - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    - ...
    - `FIREBASE_CLIENT_EMAIL`
    - `FIREBASE_PRIVATE_KEY`

## 📋 FASE 2: Implementación del Core (Backend/Data) (COMPLETADO)

### 2.1. Implementar Repositorios Firebase
- [x] **`FirebaseUserRepository.ts`**: Implementado.
- [x] **`FirebaseRoleRepository.ts`**: Implementado.
- [x] **`FirebasePermissionRepository.ts`**: Implementado.
- [x] **`FirebaseAuditLogRepository.ts`**: Implementado.

### 2.2. Definir Esquema Firestore (NoSQL)
Estructura de colecciones:
- `users/{userId}`: Perfil de usuario (email, roleId, etc.).
- `roles/{roleId}`: Definición de roles.
- `permissions/{permId}`: Definición de permisos.
- `audit_logs/{logId}`: Logs del sistema.
- `service_definitions/{defId}`: Tipos de servicio.
- `service_instances/{instId}`: Instancias de pago.

## 📋 FASE 3: Autenticación y Frontend (EN PROGRESO)

### 3.1. Actualizar AuthProvider
- [x] Modificar `components/features/auth/AuthProvider.tsx`.
- [x] Usar `firebase/auth`.
- [x] Implementar `onAuthStateChanged`.
- [x] Al iniciar sesión, consultar Firestore para obtener el Rol y Permisos del usuario.

### 3.2. Actualizar Login
- [x] Modificar `app/login/page.tsx`.
- [x] Usar `signInWithPopup(auth, googleProvider)`.

### 3.3. Middleware y Protección
- [ ] Implementar verificación de sesión en `middleware.ts` (opcional: usar cookies de sesión o validar en cliente y redirigir).
- [ ] Verificar que `ProtectedRoute` funcione con el nuevo estado de AuthProvider.

## 📋 FASE 4: Datos Iniciales y Testing
- [ ] Crear script para inicializar roles y permisos en Firestore.
- [ ] Ejecutar script y verificar integridad.

## 📋 FASE 5: Despliegue
- [ ] Configurar `firebase deploy` (Hosting, Firestore Rules).
- [ ] Verificar funcionamiento en producción.

---

## Arquitectura de Carpetas (Referencia)

```
billmate/
├── lib/
│   └── firebase/              ✅ (Creado)
│       ├── client.ts
│       ├── admin.ts
│       └── config.ts
├── core/
│   └── infrastructure/
│       └── repositories/      ✅ (Creado e Implementado)
│           ├── FirebaseUserRepository.ts
│           ├── FirebaseRoleRepository.ts
│           ├── ...
├── firebase.json              ✅
├── firestore.rules            ✅
└── .firebaserc                ✅
```

