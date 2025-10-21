# 📦 Sprint 11 - DTOs y Validaciones

## CreateLocationDto

DTO utilizado para crear una ubicación geográfica asociada a una cita.

### Ubicación del Archivo
```
backend/src/sprint11/dto/create-location.dto.ts
```

### Definición TypeScript

```typescript
export class CreateLocationDto {
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

---

## Propiedades

### 🔴 Campos Requeridos

#### `latitude` (number)
- **Tipo:** Number
- **Validación:** 
  - `@IsNumber()` - Debe ser un número
  - `@Type(() => Number)` - Transforma string a número si viene del query/body
  - `@Min(-90)` - Mínimo -90 grados
  - `@Max(90)` - Máximo 90 grados
- **Descripción:** Latitud geográfica en grados decimales
- **Rango:** -90° (Polo Sur) a +90° (Polo Norte)
- **Ejemplo:** `9.9281` (San José, Costa Rica)

#### `longitude` (number)
- **Tipo:** Number
- **Validación:** 
  - `@IsNumber()` - Debe ser un número
  - `@Type(() => Number)` - Transforma string a número
  - `@Min(-180)` - Mínimo -180 grados
  - `@Max(180)` - Máximo 180 grados
- **Descripción:** Longitud geográfica en grados decimales
- **Rango:** -180° (Oeste) a +180° (Este)
- **Ejemplo:** `-84.0907` (San José, Costa Rica)

---

### ⚪ Campos Opcionales

#### `address` (string | undefined)
- **Tipo:** String
- **Validación:** 
  - `@IsOptional()` - Puede ser omitido
  - `@IsString()` - Si se envía, debe ser string
- **Descripción:** Dirección física completa
- **Ejemplo:** `"Avenida Central, Calle 5, San José"`

#### `city` (string | undefined)
- **Tipo:** String
- **Validación:** 
  - `@IsOptional()` - Puede ser omitido
  - `@IsString()` - Si se envía, debe ser string
- **Descripción:** Ciudad o localidad
- **Ejemplo:** `"San José"`

#### `country` (string | undefined)
- **Tipo:** String
- **Validación:** 
  - `@IsOptional()` - Puede ser omitido
  - `@IsString()` - Si se envía, debe ser string
- **Descripción:** País
- **Ejemplo:** `"Costa Rica"`

#### `postalCode` (string | undefined)
- **Tipo:** String
- **Validación:** 
  - `@IsOptional()` - Puede ser omitido
  - `@IsString()` - Si se envía, debe ser string
- **Descripción:** Código postal
- **Ejemplo:** `"10101"`

#### `notes` (string | undefined)
- **Tipo:** String
- **Validación:** 
  - `@IsOptional()` - Puede ser omitido
  - `@IsString()` - Si se envía, debe ser string
- **Descripción:** Notas adicionales sobre la ubicación
- **Ejemplo:** `"Oficina principal, segundo piso, frente al parque"`

---

## Uso

### En el Controller

```typescript
@Post('appointments/:id/location')
@HttpCode(HttpStatus.CREATED)
async createLocation(
  @Param('id', ParseIntPipe) appointmentId: number,
  @Body() createLocationDto: CreateLocationDto,  // ← DTO aquí
  @Request() req: any,
) {
  return this.sprint11Service.createLocation(
    appointmentId,
    createLocationDto,
    req.user.userId,
  );
}
```

### Ejemplo de Request

#### Request Completo
```bash
POST /api/appointments/123/location
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "latitude": 9.9281,
  "longitude": -84.0907,
  "address": "Avenida Central, Calle 5",
  "city": "San José",
  "country": "Costa Rica",
  "postalCode": "10101",
  "notes": "Oficina principal, segundo piso"
}
```

#### Request Mínimo (Solo Campos Requeridos)
```bash
POST /api/appointments/123/location
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "latitude": 9.9281,
  "longitude": -84.0907
}
```

---

## Validaciones Automáticas

### ✅ Validaciones que Pasan

```json
// ✅ Coordenadas válidas
{ "latitude": 9.9281, "longitude": -84.0907 }

// ✅ Con campos opcionales
{
  "latitude": 9.9281,
  "longitude": -84.0907,
  "city": "San José"
}

// ✅ Latitud en los extremos
{ "latitude": -90, "longitude": 0 }
{ "latitude": 90, "longitude": 0 }

// ✅ Longitud en los extremos
{ "latitude": 0, "longitude": -180 }
{ "latitude": 0, "longitude": 180 }
```

### ❌ Validaciones que Fallan

```json
// ❌ Latitud fuera de rango
{
  "latitude": 100,  // Error: Max 90
  "longitude": -84.0907
}

// ❌ Longitud fuera de rango
{
  "latitude": 9.9281,
  "longitude": 200  // Error: Max 180
}

// ❌ Latitud no es número
{
  "latitude": "9.9281",  // Error: Debe ser number (aunque se transforma)
  "longitude": -84.0907
}

// ❌ Falta campo requerido
{
  "longitude": -84.0907  // Error: Falta latitude
}

// ❌ Tipo incorrecto en campo opcional
{
  "latitude": 9.9281,
  "longitude": -84.0907,
  "city": 12345  // Error: city debe ser string
}
```

---

## Mensajes de Error

### Error de Validación
```json
{
  "statusCode": 400,
  "message": [
    "latitude must not be greater than 90",
    "latitude must not be less than -90"
  ],
  "error": "Bad Request"
}
```

### Error de Tipo
```json
{
  "statusCode": 400,
  "message": [
    "latitude must be a number conforming to the specified constraints"
  ],
  "error": "Bad Request"
}
```

---

## Transformación de Datos

El decorator `@Type(() => Number)` permite que si envías las coordenadas como strings, se conviertan automáticamente a números:

```typescript
// Request con strings (se transforman automáticamente)
{
  "latitude": "9.9281",    // → 9.9281
  "longitude": "-84.0907"  // → -84.0907
}
```

Esto es útil cuando los datos vienen de formularios o query params.

---

## Testing

### Test Unitario del DTO
```typescript
import { validate } from 'class-validator';
import { CreateLocationDto } from './create-location.dto';

describe('CreateLocationDto', () => {
  it('should validate correct coordinates', async () => {
    const dto = new CreateLocationDto();
    dto.latitude = 9.9281;
    dto.longitude = -84.0907;
    
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid latitude', async () => {
    const dto = new CreateLocationDto();
    dto.latitude = 100; // > 90
    dto.longitude = -84.0907;
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

---

## Notas Adicionales

### Sistema de Coordenadas
- **Sistema:** WGS84 (World Geodetic System 1984)
- **Formato:** Grados decimales
- **Precisión:** Los valores con más decimales son más precisos
  - 1 decimal ≈ 11 km
  - 2 decimales ≈ 1.1 km
  - 3 decimales ≈ 110 m
  - 4 decimales ≈ 11 m
  - 5 decimales ≈ 1.1 m

### Ejemplos de Coordenadas Válidas

```typescript
// Costa Rica
{ latitude: 9.9281, longitude: -84.0907 }  // San José

// España
{ latitude: 40.4168, longitude: -3.7038 }  // Madrid

// Japón
{ latitude: 35.6762, longitude: 139.6503 } // Tokyo

// Australia
{ latitude: -33.8688, longitude: 151.2093 } // Sydney

// Polo Norte
{ latitude: 90, longitude: 0 }

// Polo Sur
{ latitude: -90, longitude: 0 }
```

---

## Exportación

El DTO se exporta desde el barrel file:

```typescript
// src/sprint11/dto/index.ts
export * from './create-location.dto';
```

Y se puede importar fácilmente:

```typescript
import { CreateLocationDto } from './dto';
// o
import { CreateLocationDto } from '../sprint11/dto';
```

---

## Resumen

| Campo | Tipo | Requerido | Validación | Ejemplo |
|-------|------|-----------|------------|---------|
| `latitude` | number | ✅ Sí | -90 a 90 | `9.9281` |
| `longitude` | number | ✅ Sí | -180 a 180 | `-84.0907` |
| `address` | string | ❌ No | - | `"Avenida Central"` |
| `city` | string | ❌ No | - | `"San José"` |
| `country` | string | ❌ No | - | `"Costa Rica"` |
| `postalCode` | string | ❌ No | - | `"10101"` |
| `notes` | string | ❌ No | - | `"Segundo piso"` |
