# Plan de Migración de Arquitectura - BillMate

> **Estado**: En Progreso
> **Objetivo**: Transformar BillMate a Clean Architecture + Feature-Based Structure como establece .github\copilot-instructions.md.
> **Instrucciones**: Marcar con `[x]` cada paso completado. Este archivo es la fuente de verdad para el progreso de la migración.

---

## 🚀 Fase 1: Preparación y Estructura Base

- [x] **1.1 Crear Directorios Base**
    - Crear carpeta `features/`.
    - Verificar estructura de `core/` (`domain`, `infrastructure`, `auth`).

- [x] **1.2 Limpieza Inicial de `core/`**
    - Eliminar `core/application` (si existe).
    - Asegurar que `core/domain` solo tenga interfaces/entidades.
    - Asegurar que `core/infrastructure` tenga implementaciones.

---

## 📦 Fase 2: Extracción de Features (Migración)

### 2.1 Feature: Auth (`features/auth`)
- [x] Crear estructura: `components`, `services`, `actions.ts`, `schemas.ts`.
- [x] Mover componentes de UI (Login, Register) desde `app/(auth)` o `components/`.
- [x] Mover lógica de autenticación a `AuthService`.
- [x] Implementar `actions.ts` llamando a `AuthService`.
- [x] Actualizar rutas en `app/(auth)` para usar los nuevos componentes.

### 2.2 Feature: Billing (`features/billing`)
- [x] Crear estructura.
- [x] Identificar y mover componentes de facturación.
- [x] Crear `BillingService` y mover lógica de negocio.
- [x] Crear `actions.ts` y `schemas.ts`.

### 2.3 Feature: Users (`features/users`)
- [x] Crear estructura.
- [x] Mover gestión de usuarios y perfiles.
- [x] Crear `UserService`.

---

## 🏗️ Fase 3: Implementación de Patrones (Core)

- [x] **3.1 Repositorios (Domain)**
    - Definir `IAuthRepository` en `core/domain`.
    - Definir `IUserRepository` en `core/domain`.
    - Definir `IBillingRepository` en `core/domain`.

- [x] **3.2 Repositorios (Infrastructure)**
    - Implementar `FirebaseAuthRepository`.
    - Implementar `FirebaseUserRepository`.
    - Implementar `FirebaseBillingRepository`.

- [x] **3.3 Inyección de Dependencias**
    - Conectar Servicios con Repositorios (usando Factory o inyección manual simple).

---

## 🧹 Fase 4: Limpieza y Verificación

- [x] **4.1 Limpieza de `app/`**
    - Verificar que `app/` solo contenga `page.tsx`, `layout.tsx` y `route.ts`.
    - Eliminar cualquier componente o lógica residual.

- [x] **4.2 Verificación de Dependencias**
    - [x] UI no importa Infraestructura.
    - [x] Domain no importa nada externo.
    - [x] Server Actions usan Zod.
    - [x] Actualizar imports antiguos a nuevas ubicaciones.

- [ ] **4.3 Build & Test**
    - [x] Ejecutar `npm run build` para validar imports.
