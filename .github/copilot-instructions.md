# ADR: Registro de Decisiones de Arquitectura y Reglas de Proyecto

Este documento define la "verdad única" sobre la arquitectura, patrones y estándares de código de BillMate. **Toda generación de código futura debe adherirse estrictamente a estas directrices.**

## 1. Filosofía de Arquitectura
Adoptamos una **Arquitectura Híbrida (Feature-based + Layered)** para equilibrar la organización por capas técnicas con la cohesión por dominio de negocio. Esto evita el "Spaghetti Code" y facilita la escalabilidad modular.

### 1.1 Estructura de Carpetas
*   **`components/ui/`**: (Atomic Design) Componentes base, visuales y agnósticos al negocio. "Tontos" y altamente reutilizables.
    *   *Ejemplos:* `Button`, `Modal`, `Card`, `Input`.
*   **`components/layout/`**: Estructura macro de la aplicación.
    *   *Ejemplos:* `TopHeader`, `BottomNav`, `Sidebar`.
*   **Route Groups:** Usar carpetas `(nombre)` para separar layouts distintos (ej: `(auth)`, `(social)`, `(admin)`).
*   **`components/features/[dominio]/`**: Componentes "inteligentes" conectados al estado y lógica de negocio, agrupados por funcionalidad.
    *   **`dashboard/`**: Widgets de resumen, feeds de actividad.
    *   **`services/`**: Gestión de Definiciones (Tipos de gasto).
    *   **`billing/`**: Gestión de Instancias (Pagos reales), formularios de pago.
    *   **`auth/`**: Login, Perfil, ProtectedRoute. (Lógica de Auth en `lib/supabase/` y `middleware.ts`).
*   **`lib/`**: Utilidades transversales, Store global (Zustand/Context), Tipos TypeScript y constantes.
    *   **`supabase/`**: Clientes tipados (`client.ts`, `server.ts`) para interactuar con Supabase Auth.

### 1.2 Estrategia de Despliegue (Web + APK)
*   **Objetivo Dual:** El proyecto funcionará como Web App y como **APK nativa para Android** (vía TWA/Capacitor).
*   **Compatibilidad Obligatoria:** Todo componente, librería o lógica debe ser compatible con entornos móviles híbridos (WebView).
*   **Restricciones:**
    *   No depender de APIs exclusivas de escritorio.
    *   Diseñar interacciones táctiles nativas (Swipe, Long Press).
    *   Optimizar para rendimiento en dispositivos de gama media (batería/memoria).

## 2. Patrones de Diseño y Código

### 2.1 Clean Architecture en Frontend
*   **Separación de Responsabilidades:**
    *   **UI Components:** Solo renderizan datos y capturan eventos. No deben contener lógica compleja de negocio ni llamadas directas a APIs (usar Hooks/Store).
    *   **Store/Hooks:** Manejan el estado, la lógica de negocio y la comunicación con el backend/servicios.
*   **Single Responsibility Principle (SRP):** Cada componente o función debe hacer una sola cosa bien. Si un componente crece demasiado, refactorizar en sub-componentes.

### 2.2 Seguridad y Control de Acceso (NUEVO - Permission-Driven)
*   **Modelo RBAC Estricto:** El sistema utiliza un modelo de **Control de Acceso Basado en Permisos**.
*   **Regla de Oro:** NUNCA proteger rutas o componentes preguntando por el "Rol" del usuario (ej: `if role == 'ADMIN'`). SIEMPRE preguntar por la "Capacidad" (ej: `if checkPermission('users.delete')`).
*   **Roles:** Son meros contenedores de permisos. Los roles pueden ser dinámicos, pero los permisos son las llaves atómicas del sistema.
*   **Implementación:**
    *   Usar `<ProtectedRoute requiredPermission="scope.action" />` para páginas enteras.
    *   Usar `const { checkPermission } = useAuth()` para renderizado condicional de botones o secciones.

### 2.3 Estilizado y UX
*   **Mobile-First Estricto:** Diseñar siempre pensando primero en pantallas pequeñas (320px). Usar clases `md:`, `lg:` para escalar a desktop.
*   **Tailwind CSS:** Herramienta principal de estilos. Evitar CSS inline o archivos `.css` separados salvo para configuraciones globales.
*   **Estética Premium:** Mantener el lenguaje visual de "Glassmorphism", gradientes sutiles y micro-interacciones.

### 2.4 TypeScript
*   **Tipado Fuerte:** No usar `any`. Definir interfaces claras en `lib/types.ts` para modelos de datos (ej: `ServiceInstance`, `ServiceDefinition`).
*   **Interfaces Explícitas:** Props de componentes deben estar tipadas.

## 3. Reglas para el Asistente (IA)
1.  **Contexto Primero:** Antes de sugerir código, verifica en qué capa de la arquitectura estás trabajando (`ui`, `feature`, `lib`).
2.  **No Romper la Estructura:** Si se pide una nueva funcionalidad, crea las carpetas necesarias en `features/` en lugar de tirar archivos en la raíz de `components/`.
3.  **Importaciones:** Usar siempre alias absolutos (`@/components/...`) en lugar de rutas relativas largas (`../../../`).
4.  **Refactorización Proactiva:** Si detectas código duplicado o componentes gigantes, sugiere dividirlo siguiendo estos patrones.
5.  **Verificación de Entorno:** Antes de pedir credenciales o configuración, verifica si existen archivos como `.env.local` o `tailwind.config.ts`. Asume que la configuración existe si el archivo está presente.
6.  **Seguridad por Permisos:** Al generar nuevas vistas o acciones sensibles, SIEMPRE sugerir el permiso asociado y cómo protegerlo usando `checkPermission`.
