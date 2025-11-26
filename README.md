# Getting Started

```bash
npx -y create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
```

```bash
npm run dev
```

# BillMate

## 1. La Visión (El Negocio)
**El Problema:** La gestión de pagos personales es caótica y reactiva. Dependemos de herramientas desconectadas: Google Calendar (fechas), Alarmas del reloj (urgencia inmediata sin contexto) y notas mentales (montos). Esto genera carga mental, incertidumbre financiera ("¿cuánto me falta por pagar este mes?") y falta de control.

**La Solución:** BillMate es un sistema operativo financiero personal. Unifica la planificación (calendario), la ejecución (alarmas proactivas) y el control (dashboard financiero). Su valor central es la **Proactividad**: no espera a que recuerdes pagar, el sistema te persigue, te informa cuánto debes y te facilita cerrar la tarea.

## 2. Alcance del MVP (Producto Mínimo Viable)
El objetivo del MVP es **"Centralizar y Pacificar"**. Que el usuario sienta que tiene el control total de sus deudas recurrentes.

### A. El Núcleo: Motor de Definiciones
Capacidad de modelar la realidad de cualquier servicio:
*   **Recurrencia Fija:** "Alquiler, día 5 de cada mes".
*   **Recurrencia Cíclica:** "Gas, cada 45 días" (El sistema calcula la próxima fecha automáticamente).
*   **Proyección:** Al crear el servicio, el sistema proyecta las instancias futuras para previsión de gastos.

### B. El Cerebro: Sistema de Alarmas Proactivas (PWA)
Supera a la alarma del reloj y al Calendar:
*   **Contexto:** La notificación no solo suena, te dice *Qué*, *Cuánto* y *Cuándo*.
*   **Persistencia:** Estrategia de notificación escalonada (Aviso previo -> Aviso día de pago -> Alerta crítica).
*   **Accionable:** Desde la alerta se puede marcar como pagado.

### C. La Visión: Dashboard Financiero
Supera a la lista de tareas:
*   **Totalizador:** "¿Cuánto dinero necesito para sobrevivir este mes?". Suma de todas las instancias pendientes del periodo.
*   **Estado de Salud:** Visualización rápida de Pagado vs. Pendiente.

### D. La Ejecución: Registro de Pagos
*   Cierre manual de la instancia.
*   Carga de comprobante simple (foto) para evidencia histórica.

### E. UX Esencial
*   **Búsqueda funcional:** Filtrado en tiempo real de suscripciones y pagos.
*   **Historial de Notificaciones:** Archivo accesible de alertas (retención: 6 meses).
*   **Ayuda contextual:** Botón de ayuda (top-right) con guías rápidas.
*   **Multilenguaje (i18n):** Soporte desde día 1 (ES, EN).
*   **Identidad visual:** Logo/icono único (no solo texto).
*   **Vista adaptable:** Toggle entre Grid View (cuadrícula) y List View (compacta).

## 3. Arquitectura del Sistema

### Patrón Arquitectónico Principal
**Event-Driven Serverless Architecture** - Arquitectura serverless dirigida por eventos que garantiza costo $0, escalabilidad automática y separación de responsabilidades.

### Capas Arquitectónicas

#### A. Capa de Presentación (Frontend)
*   **Tecnología:** Next.js como PWA (Progressive Web App)
*   **Hosting:** Vercel Edge Network (CDN global)
*   **Responsabilidades:**
    *   Renderizado de UI (React Server Components + Client Components)
    *   Service Worker para soporte offline y recepción de Push Notifications
    *   Web App Manifest para instalación en dispositivos móviles

#### B. Capa de Lógica de Negocio (Backend)
*   **Tecnología:** Next.js Server Actions + API Routes
*   **Hosting:** Vercel Serverless Functions
*   **Responsabilidades:**
    *   CRUD de Definiciones e Instancias
    *   **Motor de Proyección:** Algoritmo que genera instancias futuras a partir de reglas de recurrencia
    *   Integración con IA (Gemini API) para procesamiento de comprobantes
    *   Envío de Push Notifications (Web Push Protocol con VAPID)

#### C. Capa de Datos (Persistencia)
*   **Tecnología:** Supabase PostgreSQL (Managed)
*   **Hosting:** Infraestructura de Supabase (AWS)
*   **Responsabilidades:**
    *   Almacenamiento de definiciones, instancias, usuarios y suscripciones push
    *   Autenticación (Supabase Auth con Google/Email)
    *   Row-Level Security (RLS) para garantizar confidencialidad
    *   Storage para comprobantes de pago

#### D. Capa de Orquestación (Automatización)
*   **Tecnología:** Vercel Cron Jobs
*   **Hosting:** Vercel
*   **Responsabilidades:**
    *   Ejecución diaria del motor de proyección (regenerar instancias)
    *   Evaluación de alertas pendientes y disparo de notificaciones
    *   Limpieza de datos históricos

#### E. Integración Externa (IA)
*   **Tecnología:** Google Gemini API
*   **Hosting:** Google Cloud
*   **Responsabilidades:**
    *   OCR y extracción de datos de recibos (monto, fecha, proveedor)

### Patrones de Diseño Aplicados

#### Definition + Projection Pattern (Base de Datos)
*   **Definition Table:** Almacena la *regla* (ej: "Internet, día 5 de cada mes").
*   **Instance Table:** Almacena las *materializaciones* concretas (ej: "Internet Noviembre 2024").
*   **Projection Engine:** Proceso (Cron Job) que lee las Definitions y genera Instances futuras para un "window" de tiempo (próximos 90 días).
*   **Beneficio:** Eficiencia (no duplicados infinitos) y flexibilidad (modificar Definition recalcula Instances futuras).

#### Offline-First Pattern (PWA)
*   **Service Worker** cachea la UI y datos críticos.
*   **IndexedDB** guarda estado temporal cuando el usuario está offline.
*   **Background Sync API** sincroniza cambios con Supabase al recuperar conexión.
*   **Beneficio:** Disponibilidad total de la información.

#### Web Push Protocol Pattern (Notificaciones)
*   **Suscripción:** El navegador genera un endpoint único por usuario guardado en BD.
*   **Disparo:** Cron Job envía mensaje HTTP al endpoint usando VAPID (firma criptográfica).
*   **Entrega:** Service Worker intercepta el mensaje y muestra notificación nativa del SO.
*   **Beneficio:** Control total, sin dependencia de terceros (Telegram, email).

#### Row-Level Security Pattern (Seguridad)
*   Políticas a nivel de fila en PostgreSQL.
*   Cada query automáticamente filtra por `user_id = auth.uid()`.
*   **Beneficio:** Confidencialidad garantizada a nivel de infraestructura.

### Flujo de Datos End-to-End (Caso de Uso: Alerta de Pago)

```
1. CREACIÓN (Usuario):
   Usuario → PWA → Server Action → Supabase (Definition creada)
   ↓
   Server Action → Projection Engine → Supabase (Instances para 90 días)

2. ORQUESTACIÓN DIARIA (Cron):
   Vercel Cron (9:00 AM) → API Route → Supabase (consulta instances próximas)
   ↓
   API Route → Lee push_subscriptions de usuarios afectados
   ↓
   API Route → Envía Web Push a cada endpoint

3. ENTREGA (Dispositivo):
   Service Worker → Recibe Push Event → Muestra notificación nativa

4. ACCIÓN (Usuario):
   Usuario toca notificación → PWA abre → Marca como pagado → Supabase (status = 'paid')
```

### Decisiones Clave de Diseño

*   **PWA vs APK:** Menor fricción de instalación, multiplataforma, actualizaciones instantáneas.
*   **Supabase vs Firebase:** PostgreSQL real, RLS nativo, Open Source.
*   **Cron Jobs vs Real-time:** Simplicidad y costo $0 (evaluar alertas 1 vez/día es suficiente).

## 4. Mejoras (Roadmap Futuro)
Funcionalidades para la "Magia Social" y automatización avanzada:
1.  **Ecosistema Social (Chat & Delegación):**
    *   **Transferencia de Deuda:** Enviar una *Instancia de Servicio* a otro usuario para que asuma la responsabilidad y la alarma.
    *   **Chat Contextual:** Integrado en cada servicio.
2.  **Inteligencia Artificial (Gemini):**
    *   Lectura automática de facturas para autocompletar montos variables.
3.  **Instancias Puntuales (One-Off):**
    *   Creación rápida de deudas únicas sin definición recurrente.

## 5. Glosario de Términos

*   **Suscripción (antes "Definición"):** La regla recurrente (ej: "Internet, día 5 de cada mes"). Configura recurrencia y alertas.
*   **Pago (antes "Instancia"):** La obligación concreta a pagar (ej: "Internet Diciembre 2024"). Tiene fecha, monto y estado.
*   **Ciclo:** Periodo entre un pago y el siguiente.
*   **Proyección:** Generación automática de pagos futuros basados en la suscripción.

## Del MVP Definido, lo que YA funciona:
### ✅ HECHO (Funcional):
Logo/Icono único ✅
Dark/Light mode toggle ✅
Tailwind + Responsive (mobile/desktop) ✅
UI base del layout ✅

### ❌ FALTA TODO LO IMPORTANTE:
Motor de Definiciones → UI existe, pero no crea suscripciones reales (no hay BD)
Sistema de Alarmas PWA → 0% (ni Service Worker ni Push)
Dashboard Financiero → 0% (no hay totalizador visible)
Registro de Pagos → 0% (no hay instancias reales)
Búsqueda funcional → 0% (es solo un input decorativo)
Historial de notificaciones → 0% (no hay notificaciones)
Ayuda contextual → 0% (no existe el botón)
Multilenguaje → 0% (todo hardcodeado en español)
Grid View toggle → 0% (solo carousel)
