# Configuración de Infraestructura Firebase

Este documento detalla la configuración de infraestructura necesaria para BillMate en Firebase.

## 1. Reglas de Seguridad (Firestore Rules)
Las reglas de seguridad se encuentran definidas en el archivo:
`firestore.rules`

Estas reglas implementan la lógica de **Permission-Driven Security**, validando los permisos del usuario contra la colección `roles` antes de permitir operaciones.

## 2. Índices Compuestos
Los índices necesarios para las consultas complejas se encuentran definidos en:
`firestore.indexes.json`

Para desplegarlos:
```bash
firebase deploy --only firestore:indexes
```

## 3. Limpieza Automática de Logs

La limpieza se realiza mediante un proceso automatizado en el servidor Next.js (no requiere billing de Firebase).

**Implementación**: Ver `.artifacts/DEVELOPMENT_ROADMAP.md` → Fase 5: Automatización de Limpieza de Logs.

**Estado**: ⏳ Pendiente de implementación
