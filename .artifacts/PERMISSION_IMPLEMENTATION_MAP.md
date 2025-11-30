# Mapa de Implementación de Permisos (RBAC)

Este documento es la **fuente de verdad técnica** sobre dónde y cómo se verifican los permisos en el código fuente de BillMate. Se genera para garantizar que la seguridad sea robusta, precisa y auditable.

> **Última Actualización:** 2025-11-30
> **Estado:** ✅ Sincronizado con Código

---

## 1. Definición de Permisos (Granularidad)

Los permisos se definen como cadenas de texto (`resource.action`) y se almacenan en la colección `permissions` de Firestore.

| Recurso | Permiso | Descripción |
|---------|---------|-------------|
| **Usuarios** | `users.view` | Acceso de lectura al listado de usuarios. |
| | `users.edit.role` | Capacidad para modificar el rol de un usuario. |
| | `users.disable` | Capacidad para bloquear/desbloquear el acceso de un usuario. |
| | `users.view.log` | Acceso al historial de actividad de un usuario específico. |
| **Roles** | `roles.view` | Acceso de lectura al listado de roles. |
| | `roles.create` | Capacidad para crear nuevos roles. |
| | `roles.delete` | Capacidad para eliminar roles (excepto roles de sistema). |
| | `roles.permissions.assign` | Asignar permisos a un rol. |
| | `roles.permissions.revoke` | Revocar permisos de un rol. |
| **Permisos** | `permissions.view` | Acceso de lectura al catálogo de permisos. |
| | `permissions.create` | Capacidad para registrar nuevos permisos en el sistema. |
| | `permissions.edit` | Capacidad para editar metadatos de permisos. |
| | `permissions.delete` | Capacidad para eliminar permisos. |
| **Logs** | `logs.view` | Acceso de lectura a los logs de auditoría globales. |
| | `logs.delete` | Capacidad para eliminar registros de auditoría. |
| **Servicios** | `services.view` | Acceso base a la funcionalidad de servicios. |
| | `services.definition.*` | (Pendiente de implementación en UI) CRUD de definiciones. |
| | `services.instance.*` | (Pendiente de implementación en UI) CRUD de instancias. |

---

## 2. Implementación en Rutas (Page Level Security)

Protección de nivel superior para impedir la carga de páginas completas. Se implementa usando el componente `ProtectedRoute`.

| Ruta (Page) | Archivo | Permiso Requerido (`requiredPermission`) |
|-------------|---------|------------------------------------------|
| `/admin` (Layout) | `app/admin/layout.tsx` | `users.view` (Acceso base al panel) |
| `/admin/users` | `app/admin/users/page.tsx` | `users.view` |
| `/admin/roles` | `app/admin/roles/page.tsx` | `roles.view` |
| `/admin/permissions` | `app/admin/permissions/page.tsx` | `permissions.view` |
| `/admin/logs` | `app/admin/logs/page.tsx` | `logs.view` |

---

## 3. Implementación en Componentes (Conditional Rendering)

Protección de elementos de UI específicos (botones, enlaces, menús). Se implementa usando el hook `useAuth().checkPermission()`.

### Navegación y Menús

| Componente | Ubicación | Permiso Verificado | Acción Controlada |
|------------|-----------|--------------------|-------------------|
| `UserMenu` | `features/auth/components/user-menu.tsx` | `users.view` | Mostrar enlace "Admin Panel" en el menú de usuario. |
| `AdminLayout` (Sidebar) | `app/admin/layout.tsx` | `users.view` | Mostrar enlace "Usuarios" en sidebar. |
| | | `permissions.view` | Mostrar enlace "Gestión de Permisos" en sidebar. |
| | | `roles.view` | Mostrar enlace "Roles y Permisos" en sidebar. |
| | | `logs.view` | Mostrar enlace "Logs de Auditoría" en sidebar. |

### Acciones Administrativas

| Componente | Ubicación | Permiso Verificado | Acción Controlada |
|------------|-----------|--------------------|-------------------|
| `UserActionsMenu` | `features/admin/components/UserActionsMenu.tsx` | `users.edit.role` | Mostrar opción "Cambiar Rol". |
| | | `users.view.log` | Mostrar opción "Ver Logs". |
| | | `users.disable` | Mostrar opción "Deshabilitar/Habilitar Acceso". |
| `RolesGrid` | `features/admin/components/RolesGrid.tsx` | `roles.create` | Mostrar botón "Crear Rol". |
| `PermissionsTable` | `features/admin/components/PermissionsTable.tsx` | `permissions.create` | Mostrar botón "Crear Permiso". |

---

## 4. Reglas de Seguridad en Firestore (Backend)

La seguridad final reside en las reglas de Firestore (`firestore.rules`), que replican la lógica de permisos para impedir accesos no autorizados a nivel de datos, independientemente de la UI.

```javascript
function hasPermission(permission) {
  let role = get(/databases/$(database)/documents/roles/$(getUserRole()));
  return permission in role.data.permissions;
}

// Ejemplos de aplicación:
match /users/{userId} {
  allow update: if isAuthenticated() && hasPermission('users.edit.role');
}
```

---

## 5. Auditoría y Mantenimiento

*   **Agregar una nueva ruta protegida**:
    1.  Definir el permiso en `scripts/seed-roles.ts` y ejecutar seed.
    2.  Envolver la página en `ProtectedRoute` con el nuevo permiso.
    3.  Actualizar este documento.

*   **Agregar un nuevo botón de acción**:
    1.  Usar `checkPermission('resource.action')` para ocultarlo/mostrarlo.
    2.  Asegurar que la Server Action correspondiente también valide el permiso.
