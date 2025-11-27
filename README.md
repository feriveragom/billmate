# Getting Started

```bash
nvm list
    * 20.17.0 (Currently using 64-bit executable)
    
npx -y create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm

npm run dev
```

# BillMate

## 1. La Visión (El Negocio)
**El Problema:** La gestión de pagos personales es caótica. Dependemos de herramientas desconectadas: Calendarios, Alarmas sin contexto y Notas mentales. Esto genera carga mental e incertidumbre financiera.

**La Solución:** BillMate es un **Asistente Financiero Personal**. No es solo una lista de tareas, es un sistema proactivo que unifica la planificación y la ejecución. Su valor central es la **Proactividad**: el sistema te persigue, te informa cuánto debes y te facilita cerrar la tarea a través de canales que ya usas (como WhatsApp/Telegram).

## 2. Alcance del Negocio (MVP)
El objetivo es **"Centralizar y Pacificar"**. Que el usuario sienta control total sobre sus obligaciones recurrentes.

### A. Metáfora "Carpetas y Archivos" (Core)
Para simplificar la gestión mental, utilizamos una metáfora de oficina:
*   **La Carpeta (Service Definition):** Es el contenedor. Representa el contrato o servicio (ej: "Netflix", "Alquiler", "Gimnasio"). Define la identidad visual (Icono, Color) y las reglas generales.
*   **El Archivo (Service Instance):** Es la factura real del mes. Representa la obligación temporal (ej: "Netflix Enero", "Alquiler Febrero"). Tiene fecha de vencimiento, monto específico y estado (Pendiente/Pagado).

### B. BillMate Assistant (Notificaciones)
El sistema actúa como un asistente personal:
*   **Canales Familiares:** Notificaciones proactivas vía mensajería (WhatsApp/Telegram) además de la App.
*   **Contexto Completo:** "Hola, recuerda que mañana vence el Gas ($35.00)".
*   **Accionable:** Confirmación de pagos simplificada.

### C. Dashboard & Control
*   **Totalizador Mensual:** "¿Cuánto necesito para sobrevivir este mes?". Suma inteligente de todas las instancias activas.
*   **Feed de Actividad:** Bitácora de todo lo que sucede (pagos realizados, recordatorios enviados, ayudas solicitadas).
*   **Vista de Calendario:** Visualización temporal de las obligaciones.

### D. Social & Ayuda (Roadmap Inmediato)
*   **Solicitud de Ayuda:** Capacidad de pedir a un contacto que pague una instancia específica por ti.
*   **Gestión de Terceros:** Manejo de pagos que no son tuyos pero gestionas (ej: servicios de los padres).

## 3. Arquitectura Empresarial (Clean Architecture)
Hemos adoptado **Clean Architecture** para garantizar que el negocio sea independiente de la tecnología. Esto protege la inversión y asegura la escalabilidad.

### Principios Clave
1.  **Independencia del Framework:** Las reglas de negocio (Core) no dependen de React, Next.js o la Base de Datos.
2.  **Reglas de Negocio Puras:**
    *   **Entidades:** Los objetos fundamentales del negocio (`ServiceInstance`, `ServiceDefinition`, `Activity`) están aislados y protegidos.
    *   **Casos de Uso:** La lógica de "Crear un Servicio" o "Archivar una Actividad" es agnóstica a la interfaz visual.
3.  **Escalabilidad:** Podemos cambiar la base de datos (de Mock a Supabase) o la interfaz (de Web a Móvil Nativo) sin tocar una sola línea de la lógica de negocio.

### Modelo de Datos Conceptual
*   **ServiceDefinition (Carpeta):**
    *   *Identidad:* Nombre, Icono, Color, Categoría.
    *   *Regla:* ¿Es eliminable? (Servicios del Sistema vs Personalizados).
*   **ServiceInstance (Factura):**
    *   *Datos:* Monto, Fecha Vencimiento, Estado (Pendiente/Pagado/Vencido).
    *   *Recurrencia:* Reglas para generar la siguiente factura automáticamente (Mensual, Semanal, Intervalo).
    *   *Metadata:* Notas, Comprobantes.

## 4. Glosario de Términos
*   **Service Definition (Carpeta):** La definición abstracta del servicio. No tiene fecha de vencimiento.
*   **Service Instance (Factura):** La concreción temporal de un pago. Es lo que realmente se paga.
*   **Activity Feed:** Registro histórico de eventos para auditoría personal.
*   **Proyección:** Capacidad del sistema de calcular facturas futuras basadas en reglas de recurrencia.

------------

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

```
hay cosas interesantes en lo que lei de tu investigacion, y hay cosas con las que discrepo, 
aca mi idea para que la discutamos
1- sera ServiceInstance
2- seran creadas por 2 vias
- desde un servicio das clic y abre formulario de creacion del serviceinstance
- no es par el mvp, alguien solicita que le ayudes con un servicio y aceptas, pasando a crearse un serviceinstance en tu dashboard, estos estaran en un servicio generico no eliminable que ahora no tiene sentido porque ese canal de creacion no existe aun, solo el formulario

hablemos de un serviceinstance
name <- nombre que se le pone al serviceidentity
serviceId <- el id del servicio del que se creo, usualmente el name del servicedefinition
paymentId <-- este dato es el id para pagar en un sistema externo de pago
color <- el mismo que el serviceidentity

aca empezamos con lo complicado
frecuencia <- 1 vez | periodico <- (mismo dia de la semana | mes) | ciclico <-- (cada n dias)
alarmas <-- las alarmas al dia
proactividad <-- cuantos dias antes del dia de vencimiento empiezan las notificaciones

-se reutilizara lo que esta ahora mismo en components\ServiceDefinitions.tsx en cuanto  a actions
-solo programara la siguiente serviceinstance una vez vencida la actual
-elimiar la serviceinstance actual no vencida detiene la propagacion o creacion de la siguiente
```

```
1. Problema: "¿Cuánto necesito este mes?" (Dashboard)
lo estas pensando demasiado o yo demasiado poco, si el serviceinstance tiene fecha entre el 1 y el ultimo dis del mes, cae en el mes, va al dashboard del mes, se movera entre pendiente, pagado, impago, pero del mes donde este la fecha de ese serviceinstance, del lado derecho estara en el calendario el serviceinstance y tambien tendra un tag que dira si esta en pendiente, pagado, impago, el usuario puede cambiar estas categorias manualmente

2. Problema: Dato "serviceId" ambiguo
name <- nombre que se le pone al serviceinstance, da igual si coincide o no con el servicedefinition, incluso puede coincidir con el nombre de otro serviceinstance, el name que no debe repetirse es entre los servicedefinition
esto puede ser
ServiceDefinition
 "Gimnasio" (genérico)
Creo instancia "Gimnasio Enero - Cuota mensual"
Creo instancia "Gimnasio Enero - Matrícula anual"

3. Lógica de propagación refinada: no crearia nuevas instancias hasta no haber vencido la anterior, mañana creo la instancia siguiente, ahi me preocupa algo para recordar diariamente, asi que en lugar de mañana puede ser al cerrar el dia actual y resuelto
el mismo dia del evento aun se envian notificaciones

4. Schema de BD final propuesto: <-- estaremos con mock, cuando le demos unas vueltas mas, en varios dias, hablaremos de esto
```

```
Hay 3 grandes temas que se van acercando, de los que hablaremos antes de implementarlos
1- Cuando un serviceinstance se va a vencer, en la noche crear, si es el caso, la nueva instanceservice
2- Hacer el totalizador mensual con lo que haya dentro del rango del mes
3- Crear el calendario del mes, donde estaran colocados los serviceinstances de ese mes

Estos puntos llevan mas analisis porque es importante que quede claro el automatismo del pumto 1, la "hoja de calculo" del punto 2 y el almanaque estilo google calendar del punto 3

vamos a crear un plan para abordar estos 3 puntos que son sin duda alguna el corazon del MVP
- sistema automatico de replica de serviceinstance cuando corresponda
- dashboard financiero
-calendario mensual y mes siguiente con serviceinstance activos/replicados, notese que un serviceiinstance estara pendiente, vencido, pagado,  activo o replicado, porque el replicado existira si el activo para a pagado o vencido

ver MVP_Core_Implementation_Plan.md
```

