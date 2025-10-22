# 🧪 Pruebas del Servicio de Reportes Excel

## ⚡ Inicio Rápido

### 1. Iniciar el servidor

```bash
cd backend
npm run start:dev
```

### 2. Obtener un token JWT

Primero necesitas autenticarte como ROOT de un brand:

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "tu_usuario",
  "password": "tu_password"
}
```

Guarda el `accessToken` de la respuesta.

### 3. Probar el endpoint de reportes

#### Reporte básico (todas las citas)

```bash
GET http://localhost:3000/api/brands/1/reports/appointments
Authorization: Bearer {tu_token_aqui}
```

#### Reporte filtrado por fechas

```bash
GET http://localhost:3000/api/brands/1/reports/appointments?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer {tu_token_aqui}
```

#### Reporte filtrado por estado

```bash
GET http://localhost:3000/api/brands/1/reports/appointments?status=CONFIRMED
Authorization: Bearer {tu_token_aqui}
```

#### Reporte con múltiples filtros

```bash
GET http://localhost:3000/api/brands/1/reports/appointments?startDate=2025-10-01&endDate=2025-10-31&status=COMPLETED
Authorization: Bearer {tu_token_aqui}
```

## 📝 Notas

- El archivo Excel se descargará automáticamente
- El nombre del archivo será: `citas-{brandId}-{fecha}.xlsx`
- Solo usuarios ROOT o ADMIN pueden descargar reportes
- El rango de fechas no puede ser mayor a 1 año

## ✅ Casos de Prueba

### ✔️ Prueba Exitosa

- Usuario ROOT solicita reporte de su brand
- Resultado: Archivo Excel descargado con todas las citas

### ❌ Pruebas de Error

#### Usuario sin permisos

```bash
# Usuario CLIENT intenta descargar reporte
Resultado esperado: 403 Forbidden
```

#### Brand inexistente

```bash
GET /api/brands/999999/reports/appointments
Resultado esperado: 404 Not Found
```

#### Rango de fechas inválido

```bash
GET /api/brands/1/reports/appointments?startDate=2024-01-01&endDate=2025-12-31
Resultado esperado: 400 Bad Request - "El rango de fechas no puede ser mayor a 1 año"
```

## 🔍 Verificar el Archivo Excel

Al abrir el archivo descargado deberías ver:

1. **Header azul** con texto blanco
2. **Columnas:**
   - ID
   - Fecha
   - Hora Inicio
   - Hora Fin
   - Cliente
   - Servicio
   - Duración (min)
   - Estado
   - Notas
3. **Filas alternas** con fondo gris claro
4. **Bordes** en todas las celdas
5. **Estados traducidos** al español (Pendiente, Confirmada, etc.)

## 📦 Estados Disponibles para Filtrar

- `PENDING` - Pendiente
- `CONFIRMED` - Confirmada
- `IN_PROGRESS` - En Progreso
- `COMPLETED` - Completada
- `CANCELLED` - Cancelada
- `NO_SHOW` - No Asistió
