# Getting Started

```bash
npx -y create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
```

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

# BillMate

## 🎯 Problema & Solución
El olvido de pagar servicios recurrentes (Agua, Luz, Gas, Nauta) genera cortes y recargos.
**BillMate** es un asistente personal que notifica fechas de pago y permite registrar pagos enviando el comprobante por chat, puede solicitar a otro usuario ayuda con el pago dado el id del servicio.

## 🚀 Alcance del MVP
1.  **Gestión de Servicios**: CRUD de servicios con fechas de corte y pago.
2.  **Notificaciones (Telegram)**:
    *   Recordatorios diarios en rango de pago.
    *   Alertas críticas 1 día antes del vencimiento.
3.  **Registro con IA**:
    *   Usuario envía foto/texto del pago al Bot.
    *   **Gemini AI** extrae datos y marca la factura como pagada.
4.  **Solicitar Ayuda**:
    *   Compartir información de pago con otro usuario para que realice el pago.
5.  **Dashboard**: Semáforo de estado (Pagado/Pendiente/Vencido).

## 🛠 Stack Tecnológico (Serverless & Gratis)
Arquitectura diseñada para costo $0 y despliegue rápido.

| Capa | Tecnología | Función |
| :--- | :--- | :--- |
| **Frontend** | **Next.js** + **Tailwind CSS** | App Web Responsive y API Routes. |
| **Backend** | **Next.js Server Actions** | Lógica de negocio y Webhooks de Telegram. |
| **Base de Datos** | **Supabase** | PostgreSQL, Auth (Google) y Realtime. |
| **IA** | **Google Gemini API** | Clasificación de comprobantes de pago. |
| **Infraestructura** | **Vercel** | Hosting Web y Cron Jobs diarios. |

## 🔄 Flujo de Datos
1.  **Cron (9:00 AM)** → Next.js API → Supabase (Consulta) → Telegram Bot (Alerta).
2.  **Usuario** → Telegram (Comprobante) → Next.js Webhook → Gemini (OCR/Texto) → Supabase (Update).

