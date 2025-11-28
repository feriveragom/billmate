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
- `components/features/auth/AuthProvider.tsx`: Context con estado de usuario
- `components/features/auth/ProtectedRoute.tsx`: Wrapper para rutas privadas
- `app/login/page.tsx`: Página de login con botón de Google

**Base de Datos (Supabase SQL):**
```sql
-- Tabla de perfiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'FREE_USER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger de auto-creación
CREATE FUNCTION handle_new_user() ...
CREATE TRIGGER on_auth_user_created ...
```

#### 2. Sistema de Roles (RBAC)

**Roles Activos:**
- `SUPER_ADMIN`: Acceso total (asignado a `feriveragom@gmail.com`)
- `FREE_USER`: Usuario estándar (por defecto)

**Protección de Rutas:**
- `/admin/*`: Solo `SUPER_ADMIN`
- Rutas generales: Cualquier usuario autenticado

#### 3. Panel de Administración

**Rutas:**
- `/admin` -> Redirige a `/admin/users`
- `/admin/users` -> Gestión de Usuarios
- `/admin/roles` -> Visualización de Roles (Mock)
- `/admin/logs` -> Logs de Auditoría

**Funcionalidades Activas:**
- **Layout Admin (`admin/layout.tsx`):** Sidebar persistente y navegación separada.
- Lista de usuarios reales desde Supabase
- Visualización de roles
- Avatar de Google (con `referrerPolicy="no-referrer"`)
- Búsqueda de usuarios (UI lista, lógica pendiente)
- **Logs de Auditoría (implementado con Supabase)**

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
- ✅ Solo accesible para SUPER_ADMIN (protegido por RLS)
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
    - `(admin)`: Panel de administración con layout denso y sidebar.
- [ ] Crear componente reutilizable `UserMenu` (Avatar + Dropdown) para usar en ambos layouts.
- [ ] Limpiar `app/layout.tsx` raíz (eliminar UI global, dejar solo Providers).

### Autenticación y Admin
- [ ] Implementar lógica de búsqueda de usuarios en Panel Admin
- [ ] Crear menú de acciones por usuario (editar rol, banear, etc.)
- [ ] Sistema dinámico de Roles y Permisos (CRUD completo desde UI)
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
