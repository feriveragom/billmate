# Getting Started

```bash
nvm list
    * 20.17.0 (Currently using 64-bit executable)
    
npx -y create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm

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

#### Chain of Instances Pattern (Base de Datos)
*   **Definition Table:** Almacena solo la *Identidad* (Nombre, Icono, Color). No tiene reglas de tiempo.
*   **Instance Table:** Almacena la *Realidad* (Monto, Fecha, Estado) y la *Regla de Recurrencia* (ej: "Repetir mensualmente").
*   **Chain Generation Engine:** Proceso que mira la *última instancia* activa. Si tiene regla de recurrencia, genera la siguiente (hija) clonando datos y proyectando fecha.
*   **Beneficio:** Flexibilidad total. Cambiar el monto o fecha de un mes no rompe la historia ni el futuro lejano. Cada pago tiene vida propia.

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
   Usuario → PWA → Server Action → Supabase (Crea Definition + Primera Instance)
   ↓
   Server Action → Chain Engine → Supabase (Si es recurrente, proyecta siguiente Instance)

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

*   **Suscripción (Definition):** Solo la "Carpeta" o Etiqueta (Nombre, Icono, Color). No sabe cuándo vence.
*   **Pago (Instance):** El objeto inteligente. Sabe Cuánto, Cuándo y Cómo se repite. Es el que genera alertas.
*   **Generación en Cadena:** El sistema crea el pago de Febrero basándose en las reglas del pago de Enero, no de una plantilla maestra.
*   **Proyección:** Visualización de pagos futuros calculados por el motor de cadena.

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
