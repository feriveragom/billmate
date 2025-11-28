# Desarrollo Local

```bash
# Instalación
npm install

# Ejecución
npm run dev
```

> Para detalles técnicos de implementación, arquitectura y lógica de los motores, consultar: `MVP_Core_Implementation_Plan.md`.

# BillMate

> **Tu Asistente Financiero Personal: Centraliza, Organiza y Controla.**

## Visión del Producto
La gestión de pagos personales suele ser caótica, dispersa entre calendarios, alarmas y notas mentales. **BillMate** nace para eliminar esa carga mental. No es solo una lista de tareas; es un sistema **proactivo** que unifica la planificación y la ejecución de tus obligaciones financieras recurrentes.

Su promesa es simple: **El sistema te persigue a ti, no tú al sistema.**

---

## Conceptos Clave del Negocio

### 1. La Metáfora de Organización
Para simplificar la gestión, utilizamos un modelo mental de oficina:
*   **📂 La Carpeta (Service Definition):** Representa el contrato o servicio (ej: "Netflix", "Alquiler"). Define la identidad (icono, color) y las reglas generales. Es el contenedor.
*   **📄 El Archivo (Service Instance):** Es la factura real del mes (ej: "Netflix Enero"). Tiene fecha de vencimiento, monto específico y estado. Es lo que realmente pagas.

### 2. BillMate Assistant
Más que una app, BillMate es un asistente que vive donde tú estás:
*   **Notificaciones Proactivas:** Te avisa mediante notificaciones nativas (PWA/APK) antes de que algo venza.
*   **Contexto Completo:** Mensajes claros como "Mañana vence el Gas ($35.00)".
*   **Acción Inmediata:** Facilita el registro del pago o la solicitud de ayuda.

### 3. Dashboard Financiero
Responde a la pregunta fundamental: **"¿Cuánto necesito para sobrevivir este mes?"**.
*   **Totalizador Mensual:** Suma inteligente de compromisos pendientes.
*   **Calendario:** Visualización temporal de tus obligaciones.
*   **Feed de Actividad:** Bitácora de todo lo sucedido para tu tranquilidad.

---

## Estado del Proyecto (MVP)

### ✅ Completado
*   **Identidad Visual:** Diseño moderno, Dark/Light mode, Responsive (Mobile First).
*   **Arquitectura Base:** Clean Architecture implementada (Dominio, Casos de Uso, Repositorios).
*   **Gestión de Servicios:** Creación y edición de Definiciones e Instancias.
*   **UI Core:** Listados, Tarjetas, Modales y Navegación.

### 🚧 En Desarrollo (Próximos Pasos)
*   **Motor de Replicación:** Generación automática de facturas futuras (recurrencia).
*   **Dashboard Financiero:** Cálculos en tiempo real y proyecciones.
*   **Calendario:** Vista mensual interactiva.
*   **Notificaciones Nativas:** Implementación PWA y generación de APK.
*   **Autenticacion con Google:** Implementacion de autenticacion con Google.
*   **Sistema Multiusuario:** Implementacion de sistema multiusuario.
*   **Roles Permisos para funcionalidades publicas y de pago:** Implementacion.

### 📝 Ambiciones
*   **Inteligencia Artificial:** Análisis de patrones y predicciones.
*   **Gestión de Presupuesto:** Generación de documentación para Pago de Impuestos.
*   **E-Commerce:** Cada usuario podra tener su catalogo (seccion productos).
*   **Solicitud de Ayuda:** Un usuario podra solicitar ayuda a otro para pagar una factura.
*   **Scrapping en Sitios Externos:** Mostrar tasas de cambio, info util publica.

