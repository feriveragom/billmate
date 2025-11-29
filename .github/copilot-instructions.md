# BillMate: Arquitectura, Estándares y Patrones

> **Fuente Única de Verdad**: Este documento define las reglas arquitectónicas no negociables para BillMate.
> **Objetivo**: Codebase escalable, mantenible y testeable usando Clean Architecture.

---

## 1. Filosofía Central

1.  **Clean Architecture**: Las dependencias DEBEN apuntar hacia adentro. La capa **Domain** no sabe nada de la Base de Datos o la UI.
2.  **Mobile-First**: Toda la UI DEBE ser diseñada para móviles (320px+) primero, y luego adaptada para pantallas más grandes. Usan Tailwind mobile-first classes (`sm:`, `md:`, `lg:`)
3.  **Strict TypeScript**: Prohibido `any`. Todas las props, retornos y variables deben estar tipadas.
4.  **Permission-Driven Security**: El acceso es controlado por permisos granulares (`users.delete`), NO por roles (`ADMIN`).

---

## 2. Capas Arquitectónicas

### 2.1 Definición de Capas

| Capa | Responsabilidad | Imports Permitidos | Ejemplos |
|------|-----------------|--------------------|----------|
| **Domain** (Core) | Entidades de Negocio, Reglas, **Repository Interfaces**. TypeScript puro. | Ninguno (Nodo hoja) | `User`, `IUserRepository` |
| **Application** | **Services**, Casos de Uso, DTOs (Zod). Orquesta la lógica. | Domain, Shared Libs | `UserService`, `CreateUserSchema` |
| **Infrastructure** | **Repository Implementations**, APIs Externas (Firebase), Adaptadores. | Domain, Application | `FirebaseUserRepository` |
| **Presentation** | **UI Components**, **Server Actions**, Pages. | Application, Domain, UI Libs | `UserProfile`, `actions.ts` |

### 2.2 Regla de Dependencia (CRÍTICO)
`Presentation` -> `Application` -> `Domain` <- `Infrastructure`

- **UI** NUNCA importa **Infrastructure**.
- **Domain** NUNCA importa **Infrastructure** o **Presentation**.
- **Infrastructure** implementa interfaces definidas en **Domain**.
- **Aclaración**: Infrastructure depende de Domain (implementa sus interfaces), pero Domain NO depende de Infrastructure.

---

## 3. Patrones de Diseño Clave

### 3.1 Repository Pattern
Desacopla la aplicación de la fuente de datos.
- **Interface**: Definida en Domain (`core/domain/repositories/IUserRepository.ts`).
- **Implementation**: Definida en Infrastructure (`core/infrastructure/repositories/FirebaseUserRepository.ts`).
- **Uso**: Los **Services** dependen de la *Interface*, inyectada vía Dependency Injection o Factory.

### 3.2 Service Layer
Encapsula toda la lógica de negocio.
- **Ubicación**: `features/[feature]/services/`.
- **Responsabilidad**: Validación, orquestación, llamadas a repositorios.
- **Regla**: Los **Server Actions** DEBEN llamar a **Services**, nunca a Repositorios directamente.

### 3.3 DTO (Data Transfer Object) & Validation
Asegura type safety e integridad de datos.
- **Herramienta**: **Zod**.
- **Uso**: Todos los inputs a **Server Actions** y **Services** deben ser validados con esquemas de Zod.
- **Ubicación**: `features/[feature]/schemas.ts`.

### 3.4 Permission-Driven RBAC
- **Concepto**: Los usuarios tienen Roles; Los Roles tienen Permisos. El código verifica Permisos.
- **Patrón**: `if (user.hasPermission('invoices.pay'))` ✅
- **Anti-Patrón**: `if (user.role === 'ADMIN')` ❌

---

## 4. Estructura del Proyecto (Feature-Based)

Usamos una estructura **Feature-Based** para mantener el código relacionado junto.

```text
/
├── app/                        # Next.js App Router (Solo Rutas y Layouts)
├── components/                 # UI Components Compartidos (Puros, Tontos)
│   └── ui/                     # Elementos de diseño atómico (Button, Input)
├── core/                       # Shared Kernel (Intereses transversales)
│   ├── domain/                 # Entidades Globales e Interfaces de Repositorio
│   ├── infrastructure/         # Implementaciones Globales (Cliente Firebase)
│   └── auth/                   # Lógica de Permisos
├── features/                   # Módulos de Features (El grueso del código)
│   ├── [feature_name]/         # ej., "billing", "users"
│   │   ├── components/         # UI específica del Feature
│   │   ├── services/           # Lógica de Negocio
│   │   ├── actions.ts          # Server Actions (Puntos de entrada)
│   │   ├── schemas.ts          # Zod Schemas (DTOs)
│   │   └── types.ts            # Tipos específicos del Feature
│   └── ...
└── lib/                        # Utilidades Compartidas (Funciones sin estado)
```

---

## 5. Anti-Patterns (PROHIBIDO)

1.  ❌ **God Components**: Componentes > 200 líneas. Divídelos.
2.  ❌ **Logic in UI**: Los componentes solo deben renderizar datos. La lógica va a **Services/Hooks**.
3.  ❌ **Direct DB Access in UI**: Nunca llamar a Firebase/DB desde un **Client Component**. Usa **Server Actions**.
4.  ❌ **Hardcoded Strings**: Usa constantes o archivos de localización.
5.  ❌ **Prop Drilling**: Usa Composición o Zustand para estado global.
6.  ❌ **Ignoring Mobile**: diseñar para escritorio y "arreglar" para móvil después.

---

## 6. Flujo de Trabajo de Desarrollo

1.  **Define Interface**: Empieza definiendo el contrato de datos en `core/domain`.
2.  **Implement Infrastructure**: Crea la implementación de Firebase en `core/infrastructure`.
3.  **Create Service**: Escribe la lógica de negocio en `features/[feature]/services`.
4.  **Define DTO**: Crea esquemas Zod para validación.
5.  **Build UI**: Crea componentes que consuman el **Service** vía **Server Actions**.
6.  **Documentation**: Solo a solicitud del programador, no documentar por defecto.