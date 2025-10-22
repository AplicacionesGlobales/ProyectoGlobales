# TASK-018B: Servicio ExcelGenerator - Reporte de Citas

## 📋 Descripción

Servicio básico para exportar las citas de un brand a un archivo Excel (.xlsx).

## 🎯 Objetivo

Crear un reporte simple de citas en Excel con filtros básicos (fechas, estado) para que el ROOT pueda descargar y analizar sus citas.

## 🏗️ Estructura

```
backend/src/reports/
├── reports.module.ts
├── reports.controller.ts
├── reports.service.ts
└── dto/
    └── appointments-report.dto.ts
```

## 🔧 Implementación

### 1. ReportsService

- Consultar citas desde la BD con Prisma
- Generar Excel con ExcelJS (ya instalado)
- Formatear datos básicos (fecha, cliente, servicio, estado)
- Retornar buffer del archivo

### 2. ReportsController

Endpoint único:

```
GET /api/brands/:brandId/reports/appointments
Query params: startDate?, endDate?, status?
Response: Archivo Excel para descargar
```

### 3. AppointmentsReportDto

```typescript
{
  startDate?: string;  // YYYY-MM-DD
  endDate?: string;    // YYYY-MM-DD
  status?: string;     // PENDING, CONFIRMED, etc.
}
```

## 📊 Estructura del Excel

**Columnas:**

1. ID
2. Fecha
3. Hora Inicio
4. Hora Fin
5. Cliente
6. Servicio
7. Duración (min)
8. Estado
9. Notas

**Formato:**

- Header con fondo azul y texto blanco
- Fechas en formato DD/MM/YYYY
- Horas en formato HH:MM

## 🔐 Seguridad

- Solo usuarios ROOT/ADMIN pueden descargar
- Validar que el brand existe
- Máximo 1 año de rango de fechas

## 📝 Ejemplo

```bash
GET /api/brands/1/reports/appointments?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer {token}
```

**Respuesta:**

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="citas-2025-10.xlsx"
```

---

**Estado:** ✅ Implementado
**Fecha:** 21 de octubre, 2025

## 📁 Archivos Creados

1. `src/reports/reports.module.ts` - Módulo principal
2. `src/reports/reports.controller.ts` - Controlador con endpoint
3. `src/reports/reports.service.ts` - Lógica de negocio y generación de Excel
4. `src/reports/dto/appointments-report.dto.ts` - DTO para filtros

## ✅ Funcionalidades Implementadas

- ✅ Endpoint GET `/api/brands/:brandId/reports/appointments`
- ✅ Filtros: startDate, endDate, status
- ✅ Validación de permisos (solo ROOT/ADMIN)
- ✅ Generación de Excel con ExcelJS
- ✅ Estilos y formato profesional
- ✅ Headers con colores
- ✅ Filas alternas con color de fondo
- ✅ Validación de rango máximo (1 año)
- ✅ Traducción de estados al español
- ✅ Integrado en AppModule

## 🚀 Cómo Usar

```bash
# 1. Traer TODAS las citas del brand (sin filtros de fecha)
GET http://localhost:3000/api/brands/1/reports/appointments
Authorization: Bearer {tu_token_jwt}

# 2. Descargar reporte de citas de octubre 2025
GET http://localhost:3000/api/brands/1/reports/appointments?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer {tu_token_jwt}

# 3. Filtrar solo citas confirmadas (todas las fechas)
GET http://localhost:3000/api/brands/1/reports/appointments?status=CONFIRMED
Authorization: Bearer {tu_token_jwt}

# 4. Citas desde una fecha en adelante
GET http://localhost:3000/api/brands/1/reports/appointments?startDate=2025-10-01
Authorization: Bearer {tu_token_jwt}

# 5. Citas hasta una fecha
GET http://localhost:3000/api/brands/1/reports/appointments?endDate=2025-10-31
Authorization: Bearer {tu_token_jwt}

# 6. Combinar filtros: citas confirmadas de octubre
GET http://localhost:3000/api/brands/1/reports/appointments?startDate=2025-10-01&endDate=2025-10-31&status=CONFIRMED
Authorization: Bearer {tu_token_jwt}
```

**⚠️ IMPORTANTE:** Asegúrate de que el servidor esté corriendo:

```bash
cd backend
npm run start:dev
```

El archivo se descargará automáticamente con nombre: `citas-{brandId}-{fecha}.xlsx`

---

## 🔧 Solución de Problemas

### Error 404 "Cannot GET /api/brands/..."

**Causa:** El prefijo global `/api` no estaba configurado en `main.ts`

**Solución aplicada:**
Se agregó `app.setGlobalPrefix('api')` en el archivo `main.ts` para que todas las rutas tengan el prefijo `/api/`

**Debes reiniciar el servidor** después de este cambio:

1. Detener el servidor (Ctrl+C)
2. Iniciar nuevamente: `npm run start:dev`
3. Verificar en consola que el servidor inicie correctamente
