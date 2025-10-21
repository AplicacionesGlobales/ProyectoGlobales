# Sprint 11 - Appointment Locations API

## Descripción
Módulo para gestionar ubicaciones geográficas asociadas a citas (appointments). Proporciona endpoints para crear y consultar ubicaciones con validación de coordenadas geográficas y control de permisos.

## Control de Acceso

Los endpoints están protegidos por autenticación JWT y validan que el usuario tenga permisos para acceder/modificar la ubicación:

**Usuarios Autorizados:**
- ✅ **Cliente de la cita** - Usuario asignado como `clientId` en el appointment
- ✅ **Owner del Brand** - Usuario propietario del brand (`ownerId`)
- ✅ **Usuarios del Brand** - Usuarios con acceso al brand (tabla `user_brands`)

Si el usuario no cumple ninguna de estas condiciones, recibirá un error `403 Forbidden`.

## Modelo de Datos

### AppointmentLocation
```prisma
model AppointmentLocation {
  id            Int      @id @default(autoincrement())
  appointmentId Int      @unique
  latitude      Float
  longitude     Float
  address       String?
  city          String?
  country       String?
  postalCode    String?
  notes         String?  @db.Text
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)

  @@index([appointmentId])
  @@map("appointment_locations")
}
```

## Endpoints

### ⚠️ Importante: Parámetros de ID

Los endpoints utilizan diferentes tipos de ID según la ruta:

| Endpoint | Parámetro | Tipo | Descripción | Request Body |
|----------|-----------|------|-------------|--------------|
| `POST /api/appointments/:id/location` | `:id` | `appointment.id` | ID de la cita (appointment) | ✅ `CreateLocationDto` |
| `GET /api/appointments/:id/location` | `:id` | `appointment.id` | ID de la cita (appointment) | ❌ No |
| `GET /api/locations/:id` | `:id` | `location.id` | ID de la ubicación (appointment_location) | ❌ No |

**Ejemplo:**
- Cita con `id=123` → `POST /api/appointments/123/location`
- Ubicación con `id=5` → `GET /api/locations/5`

---

### 📦 DTOs Utilizados

#### CreateLocationDto (Request Body para POST)
```typescript
{
  latitude: number;      // Requerido: -90 a 90
  longitude: number;     // Requerido: -180 a 180
  address?: string;      // Opcional
  city?: string;         // Opcional
  country?: string;      // Opcional
  postalCode?: string;   // Opcional
  notes?: string;        // Opcional
}
```

**Validaciones:**
- `latitude`: Número entre -90 y 90 (validado con `@Min(-90)` y `@Max(90)`)
- `longitude`: Número entre -180 y 180 (validado con `@Min(-180)` y `@Max(180)`)
- Todos los strings son opcionales

---

### 1. Crear Ubicación para una Cita
**POST** `/api/appointments/:id/location`

Crea una nueva ubicación geográfica para una cita específica.

#### Request
- **Params:** 
  - `id` (number): **ID del appointment (cita)** - El identificador único de la cita a la que se asociará la ubicación

- **Body:**
```json
{
  "latitude": 9.9281,
  "longitude": -84.0907,
  "address": "Avenida Central, San José",
  "city": "San José",
  "country": "Costa Rica",
  "postalCode": "10101",
  "notes": "Oficina principal, segundo piso"
}
```

#### Validaciones
- `latitude`: Número requerido entre -90 y 90
- `longitude`: Número requerido entre -180 y 180
- `address`: String opcional
- `city`: String opcional
- `country`: String opcional
- `postalCode`: String opcional
- `notes`: String opcional

#### Response (201 Created)
```json
{
  "id": 1,
  "appointmentId": 123,
  "latitude": 9.9281,
  "longitude": -84.0907,
  "address": "Avenida Central, San José",
  "city": "San José",
  "country": "Costa Rica",
  "postalCode": "10101",
  "notes": "Oficina principal, segundo piso",
  "createdAt": "2025-10-20T10:30:00.000Z",
  "updatedAt": "2025-10-20T10:30:00.000Z"
}
```

#### Errores
- **400 Bad Request:** Coordenadas inválidas
- **403 Forbidden:** Usuario sin permisos para acceder a esta cita
- **404 Not Found:** Cita no encontrada
- **409 Conflict:** Ya existe una ubicación para esta cita

---

### 2. Obtener Ubicación por ID de Cita
**GET** `/api/appointments/:id/location`

Obtiene la ubicación asociada a una cita específica.

#### Request
- **Params:** 
  - `id` (number): **ID del appointment (cita)** - El identificador único de la cita cuya ubicación se desea obtener

#### Response (200 OK)
```json
{
  "id": 1,
  "appointmentId": 123,
  "latitude": 9.9281,
  "longitude": -84.0907,
  "address": "Avenida Central, San José",
  "city": "San José",
  "country": "Costa Rica",
  "postalCode": "10101",
  "notes": "Oficina principal, segundo piso",
  "createdAt": "2025-10-20T10:30:00.000Z",
  "updatedAt": "2025-10-20T10:30:00.000Z"
}
```

#### Errores
- **403 Forbidden:** Usuario sin permisos para acceder a esta cita
- **404 Not Found:** Ubicación no encontrada para la cita

---

### 3. Obtener Ubicación por ID
**GET** `/api/locations/:id`

Obtiene una ubicación específica por su ID único.

#### Request
- **Params:** 
  - `id` (number): **ID de la ubicación (location)** - El identificador único de la ubicación en la tabla `appointment_locations`

#### Response (200 OK)
```json
{
  "id": 1,
  "appointmentId": 123,
  "latitude": 9.9281,
  "longitude": -84.0907,
  "address": "Avenida Central, San José",
  "city": "San José",
  "country": "Costa Rica",
  "postalCode": "10101",
  "notes": "Oficina principal, segundo piso",
  "createdAt": "2025-10-20T10:30:00.000Z",
  "updatedAt": "2025-10-20T10:30:00.000Z"
}
```

#### Errores
- **403 Forbidden:** Usuario sin permisos para acceder a esta cita
- **404 Not Found:** Ubicación no encontrada

---

## Características

### Control de Permisos
El servicio valida automáticamente que el usuario tenga acceso a la cita antes de permitir cualquier operación:

```typescript
// Validación de acceso:
// 1. Es el cliente de la cita (clientId)
// 2. Es el owner del brand (brand.ownerId)
// 3. Es un usuario del brand (existe en user_brands)
```

**Nota:** Si el usuario no tiene permisos, recibirá `403 Forbidden` con el mensaje:
```json
{
  "statusCode": 403,
  "message": "You do not have permission to modify this appointment location"
}
```

### Validación Geográfica
El servicio `LocationService` incluye validación automática de coordenadas:
- Latitud: -90 a 90 grados
- Longitud: -180 a 180 grados

### Restricciones
- Una cita solo puede tener una ubicación asociada
- Si se intenta crear una segunda ubicación para la misma cita, se retorna un error 409 (Conflict)
- Las ubicaciones se eliminan automáticamente si se elimina la cita (CASCADE)

### Seguridad
- Los endpoints están protegidos por el guard JWT global
- Se requiere autenticación para acceder a todos los endpoints
- **Control de permisos granular:**
  - Cliente de la cita puede crear/ver su ubicación
  - Owner del brand puede crear/ver ubicaciones de todas las citas del brand
  - Usuarios del brand pueden crear/ver ubicaciones de citas del brand
- Usuarios no autorizados reciben `403 Forbidden`

## Ejemplos de Uso

### Crear Ubicación
```bash
curl -X POST http://localhost:3001/api/appointments/123/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "latitude": 9.9281,
    "longitude": -84.0907,
    "address": "Avenida Central, San José",
    "city": "San José",
    "country": "Costa Rica"
  }'
```

### Consultar por Cita
```bash
curl -X GET http://localhost:3001/api/appointments/123/location \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Consultar por ID de Ubicación
```bash
curl -X GET http://localhost:3001/api/locations/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Integración

### Importar el Módulo
```typescript
import { Sprint11Module } from './sprint11/sprint11.module';

@Module({
  imports: [Sprint11Module],
})
export class AppModule {}
```

### Usar el Servicio
```typescript
import { Sprint11Service } from './sprint11/sprint11.service';

constructor(private sprint11Service: Sprint11Service) {}

async createAppointmentLocation() {
  const location = await this.sprint11Service.createLocation(123, {
    latitude: 9.9281,
    longitude: -84.0907,
    address: 'Avenida Central, San José',
  });
}
```

## Base de Datos

### Migración
La tabla `appointment_locations` se crea automáticamente con la migración de Prisma.

### Índices
- Índice único en `appointmentId` para garantizar una ubicación por cita
- Índice en `appointmentId` para consultas rápidas

## Notas Técnicas
- Todas las respuestas retornan únicamente datos de ubicación (no incluyen datos del appointment)
- Los campos opcionales pueden ser null en la respuesta
- Las fechas se retornan en formato ISO 8601 (UTC)
- Las coordenadas se almacenan como números de punto flotante (Float)
