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

### Backend (Supabase)
- **Auth:** Google OAuth
- **Database:** PostgreSQL con RLS
- **Storage:** (No utilizado aún)
- **Functions:** (No utilizadas aún)

### Stack Tecnológico
- **Framework:** Next.js 15 (App Router, RSC)
- **Autenticación:** Supabase Auth + Google OAuth
- **Base de Datos:** PostgreSQL (Supabase)
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Estado:** Zustand + React Context
