# Plan de Implementación: El Corazón del MVP

Este documento detalla la estrategia para implementar los 3 pilares fundamentales de BillMate: El Motor de Replicación, el Dashboard Financiero y el Calendario.

## 1. El Motor de Replicación (Chain Generation Engine)

El objetivo es automatizar la continuidad de los pagos sin intervención manual constante.

### Lógica de Negocio
*   **Disparador (Trigger):**
    *   **Evento Principal:** "Cierre de Día" (Nightly Job). Un proceso que corre cada noche (ej: 00:01 AM).
    *   **Condición:** Busca todas las `ServiceInstance` activas.
    *   **Reglas de Replicación (Chain Generation):**
        *   **Pending -> Overdue:** Si `dueDate` < `today` y status es `pending` -> Pasa a `overdue` y **GENERA REPLICA**.
        *   **Pending -> Paid:** Al marcarse como `paid` -> **GENERA REPLICA** (Discusión pendiente: ¿inmediata o al vencimiento?).
        *   **Pending -> Cancelled:** Al marcarse como `cancelled` -> **NO GENERA REPLICA** (Rompe la cadena).
    *   **Regla de "Rescate":** Un usuario puede reactivar una instancia `cancelled` a `pending`. Si la fecha ya pasó, el usuario debería actualizarla al mes siguiente manualmente o el sistema sugerirlo.

## 1.1 Matriz de Transiciones de Estado (Lógica de Replicación)

Esta matriz define qué sucede con el **Motor de Replicación** cuando una instancia cambia de estado.

### Desde PENDIENTE (Flujo Normal)
| Transición | Acción del Motor | Descripción |
| :--- | :--- | :--- |
| **Pending -> Paid** | 🚀 **CREA RÉPLICA** | El usuario cumplió. Se genera la instancia del próximo mes. |
| **Pending -> Overdue** | 🚀 **CREA RÉPLICA** | Se venció la fecha. Se asume continuidad y se genera la del próximo mes para no perder el hilo. |
| **Pending -> Cancelled** | 🛑 **ROMPE CADENA** | El usuario indica que este servicio ya no corre. No se genera nada a futuro. |

### Desde CANCELADO (Flujo de "Rescate" / Corrección)
| Transición | Acción del Motor | Descripción |
| :--- | :--- | :--- |
| **Cancelled -> Pending** | ⏳ **ESPERA** | "Rescate". Vuelve a estar activa. **No crea réplica aún**; esperará a que se pague o venza de nuevo. *Nota: Si la fecha es pasada, el usuario debe actualizarla.* |
| **Cancelled -> Overdue** | 🚀 **CREA RÉPLICA** | "Rescate Tardío". Al pasar a vencida, el sistema asume que la deuda es válida y restaura la cadena creando la siguiente. |
| **Cancelled -> Paid** | 🚀 **CREA RÉPLICA** | "Rescate Pagado". Al pagar una cancelada, se restaura la cadena y se crea la siguiente. |

### Desde PAGADO (Corrección de Error)
| Transición | Acción del Motor | Descripción |
| :--- | :--- | :--- |
| **Paid -> Pending** | ⚠️ **MANTIENE** | "Me equivoqué, no pagué". Si la réplica ya existía, **se deja quieta** (no se borra para evitar pérdida de datos). |
| **Paid -> Cancelled** | 🛑 **ROMPE FUTURO** | "Me devolvieron el dinero". Se corta la generación de *subsiguientes* réplicas. |
| **Paid -> Overdue** | ⚠️ **MANTIENE** | Raro. Corrección de estado. La réplica ya debería existir. |

### Desde VENCIDO (Gestión de Mora)
| Transición | Acción del Motor | Descripción |
| :--- | :--- | :--- |
| **Overdue -> Paid** | ✅ **VERIFICA** | Se paga tarde. La réplica ya debería existir (se creó al vencer). Si no existe, la crea. |
| **Overdue -> Cancelled** | 🛑 **ROMPE CADENA** | "No voy a pagar y cancelo el servicio". Se detiene la generación futura. |
| **Overdue -> Pending** | ⏳ **ESPERA** | Raro (quizás extensión de fecha). Se comporta igual que Pending normal. |

## 1.2 Escenarios de Disparo de Replicación

Basado en la matriz anterior, identificamos dos tipos de disparadores para la creación de réplicas:

### A. Disparo Automático (Nightly Job)
*Ocurre sin intervención del usuario, por el paso del tiempo.*
1.  **Vencimiento Natural:**
    *   **Condición:** `CurrentDate > DueDate` Y `Status == Pending`.
    *   **Acción:** El sistema cambia el estado a `Overdue` Y **crea la réplica** del mes siguiente.

### B. Disparo por Acción de Usuario (Immediate Trigger)
*Ocurre en tiempo real cuando el usuario interactúa con la UI.*
1.  **Pago Anticipado/Puntual:**
    *   **Acción:** Usuario marca `Pending` -> `Paid`.
    *   **Resultado:** Se crea la réplica inmediatamente.
2.  **Rescate de Cancelado (a Vencido/Pagado):**
    *   **Acción:** Usuario corrige un error y pasa `Cancelled` -> `Overdue` o `Paid`.
    *   **Resultado:** Se restaura la cadena creando la réplica faltante.
3.  **Pago Tardío (Safety Net):**
    *   **Acción:** Usuario marca `Overdue` -> `Paid`.
    *   **Resultado:** El sistema verifica si existe la réplica (debería, por el punto A). Si por alguna razón no existe (ej: fallo del cron), la crea en este momento.

### Algoritmo de Generación (`GenerateNextInstanceUseCase`)
1.  **Input:** Una `ServiceInstance` existente (la "madre").
2.  **Verificación:**
    *   ¿Tiene regla de recurrencia? (Si es `null`, termina).
    *   ¿Ya existe una instancia hija para el siguiente periodo? (Evitar duplicados).
3.  **Cálculo de Nueva Fecha (`NextDueDate`):**
    *   *Mensual:* `CurrentDueDate` + 1 Mes (Manejo de días 28/30/31).
    *   *Semanal:* `CurrentDueDate` + 7 días.
    *   *Intervalo:* `CurrentDueDate` + `intervalDays`.
4.  **Clonación y Persistencia:**
    *   Crear nueva `ServiceInstance` con:
        *   `definitionId`: Igual a la madre.
        *   `name`: Generar nombre dinámico (ej: "Gimnasio" -> "Gimnasio [Mes Actual]").
        *   `dueDate`: La calculada.
        *   `status`: `pending`.
        *   `amount`: Copiar de la madre (el usuario puede editarlo después si varió).

### Tareas Técnicas
- [ ] Crear `GenerateNextInstanceUseCase.ts`.
- [ ] Implementar lógica de cálculo de fechas robusta (usando `date-fns` o nativo).
- [ ] Simular el "Nightly Job" con un botón de "Debug: Avanzar Día" en la UI por ahora (ya que no tenemos backend real de Cron aún).

---

## 2. Dashboard Financiero (El Totalizador)

El objetivo es responder: "¿Cómo voy este mes?".

### Lógica de Negocio
*   **Alcance Temporal:** Mes Calendario (1 al 30/31).
*   **Filtrado:** Incluir todas las `ServiceInstance` cuya `dueDate` caiga en el mes seleccionado.

### Métricas Clave
1.  **Total a Pagar (Presupuesto):** Suma de `amount` de todas las instancias del mes.
2.  **Total Pagado:** Suma de `amount` (o `paidAmount`) de las instancias con status `paid`.
3.  **Pendiente:** (Total a Pagar - Total Pagado).
4.  **Proyección:** Si hay servicios recurrentes que aún no tienen instancia generada para este mes (porque la cadena viene del mes anterior), el dashboard debería ser capaz de "prever" ese gasto (Opcional para V1, pero ideal).

### Tareas Técnicas
- [ ] Crear `GetMonthlyFinancialsUseCase.ts`.
- [ ] Diseñar componente `FinancialSummaryCard` en el Dashboard.
- [ ] Implementar selector de mes (Anterior / Actual / Siguiente).

---

## 3. Calendario Mensual (El Almanaque)

El objetivo es visualizar la distribución temporal de los pagos.

### Diseño de Interfaz
*   **Vista:** Grilla clásica de mes (7 columnas, 5-6 filas).
*   **Celdas (Días):**
    *   Mostrar indicadores (puntos o mini-barras) de los pagos de ese día.
    *   Color según estado: Verde (Pagado), Gris (Pendiente), Rojo (Vencido).
*   **Interacción:**
    *   Clic en un día -> Despliega lista de pagos de ese día (Bottom Sheet o Modal).

### Lógica de Visualización
*   Reutilizar la lógica de filtrado por mes del Dashboard.
*   Mapear `ServiceInstance[]` a un objeto `Record<DayString, ServiceInstance[]>`.

### Tareas Técnicas
- [ ] Crear componente `CalendarView.tsx`.
- [ ] Implementar navegación entre meses.
- [ ] Integrar con el store para obtener las instancias.

---

## Plan de Ejecución (Siguientes Pasos)

1.  **Paso 1:** Implementar el **Calendario y Dashboard** (Puntos 2 y 3) primero. Esto nos da la visualización necesaria para verificar si el motor funciona.
2.  **Paso 2:** Implementar el **Motor de Replicación** (Punto 1) y probarlo manualmente con el botón de debug.
