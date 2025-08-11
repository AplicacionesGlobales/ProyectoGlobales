# API de Registro de Marca (Brand Registration)

## Descripción General
Esta API permite el registro completo de una nueva marca white-label junto con su usuario ROOT propietario y su paleta de colores personalizada. Está diseñada siguiendo principios SOLID para garantizar mantenibilidad, extensibilidad y testabilidad.

## Principios SOLID Implementados

### 1. Single Responsibility Principle (SRP)
- **UserCreationService**: Se encarga únicamente de la creación y validación de usuarios
- **BrandCreationService**: Maneja exclusivamente la lógica de creación de marcas
- **ColorPaletteService**: Gestiona solamente las paletas de colores
- **BrandRegistrationService**: Coordina el proceso completo de registro

### 2. Open/Closed Principle (OCP)
- Servicios abiertos para extensión mediante interfaces y inyección de dependencias
- Cerrados para modificación: nuevas funcionalidades se agregan sin modificar código existente

### 3. Liskov Substitution Principle (LSP)
- Todas las implementaciones de servicios pueden ser sustituidas por mocks o implementaciones alternativas
- Interfaces claramente definidas

### 4. Interface Segregation Principle (ISP)
- Interfaces específicas para cada tipo de operación
- DTOs separados para diferentes casos de uso

### 5. Dependency Inversion Principle (DIP)
- Servicios dependen de abstracciones (interfaces) no de implementaciones concretas
- Inyección de dependencias manejada por NestJS

## Endpoint Principal

### POST /auth/register/brand

Registra una nueva marca con usuario ROOT y paleta de colores.

#### Request Body
```json
{
  "user": {
    "email": "owner@business.com",
    "username": "owner_business",
    "password": "SecurePass123!",
    "firstName": "Juan",
    "lastName": "Pérez"
  },
  "brand": {
    "name": "Mi Fotografía Profesional",
    "description": "Servicios profesionales de fotografía para eventos especiales",
    "address": "Av. Principal 123, Ciudad",
    "phone": "+1 234 567 8900"
  },
  "colorPalette": {
    "primary": "#8B5CF6",
    "secondary": "#EC4899",
    "accent": "#F59E0B",
    "neutral": "#6B7280",
    "success": "#10B981"
  },
  "selectedFeatures": ["citas", "pagos", "archivos"],
  "planType": "monthly"
}
```

#### Response Success (201)
```json
{
  "success": true,
  "message": "Registro completado exitosamente",
  "data": {
    "brandId": 1,
    "userId": 1,
    "colorPaletteId": 1,
    "brandName": "Mi Fotografía Profesional",
    "username": "owner_business",
    "email": "owner@business.com",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "createdAt": "2025-08-10T22:00:00Z",
    "message": "Marca y usuario ROOT creados exitosamente. Tu aplicación estará ready en 10 días hábiles."
  },
  "errors": []
}
```

#### Response Error (400/409)
```json
{
  "success": false,
  "message": "Errores de validación encontrados",
  "data": null,
  "errors": [
    {
      "field": "user.email",
      "message": "El email ya está registrado",
      "code": 1004
    }
  ]
}
```

## Validaciones Implementadas

### Datos de Usuario
- ✅ Email único y formato válido
- ✅ Username único (mínimo 3 caracteres)
- ✅ Contraseña fuerte (8+ caracteres, mayúscula, minúscula, número, carácter especial)
- ✅ Campos opcionales validados si están presentes

### Datos de Marca
- ✅ Nombre requerido (mínimo 2 caracteres)
- ✅ Descripción, dirección y teléfono opcionales

### Paleta de Colores
- ✅ Formato hexadecimal válido para todos los colores
- ✅ Normalización automática a formato uppercase
- ✅ Colores requeridos: primary, secondary, accent, neutral, success

## Seguridad

### Hasheo de Contraseñas
- Algoritmo: bcrypt con 12 salt rounds
- Salt único por usuario con timestamp

### JWT Tokens
- Expiración: 24 horas
- Payload incluye: userId, email, username, role
- Firmado con secret del environment

### Transacciones de Base de Datos
- Todo el proceso de registro se ejecuta en una sola transacción
- Rollback automático en caso de error

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 1004 | Email ya existe |
| 1005 | Username ya existe |
| 1006 | Formato de color inválido |
| 1007 | Contraseña débil |
| 5000 | Error interno del servidor |

## Estructura de Archivos

```
src/auth/
├── dto/
│   ├── register-brand.dto.ts
│   └── brand-registration-response.dto.ts
├── interfaces/
│   └── brand-registration.interface.ts
├── services/
│   ├── brand-registration.service.ts
│   ├── user-creation.service.ts
│   ├── brand-creation.service.ts
│   └── color-palette.service.ts
├── auth.controller.ts
├── auth.service.ts
└── auth.module.ts
```

## Beneficios de la Arquitectura

1. **Mantenibilidad**: Cada servicio tiene una responsabilidad clara
2. **Testabilidad**: Servicios pueden ser testeados independientemente
3. **Extensibilidad**: Fácil agregar nuevas funcionalidades
4. **Reutilización**: Servicios pueden ser utilizados en otros contextos
5. **Separation of Concerns**: Lógica de negocio separada de controllers

## Uso desde el Frontend

```typescript
const registerBrand = async (data: RegisterBrandData) => {
  const response = await fetch('/api/auth/register/brand', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
};
```

## Next Steps

1. Agregar tests unitarios para cada servicio
2. Implementar middleware de rate limiting
3. Agregar logging y monitoring
4. Implementar validaciones adicionales de negocio
5. Agregar soporte para carga de logos
