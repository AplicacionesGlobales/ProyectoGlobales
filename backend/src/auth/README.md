# 🔐 Auth API - Registro de Clientes

## 📋 Descripción

Sistema de autenticación escalable para registro de clientes en sucursales de comercios. Implementa JWT, validaciones robustas y estructura modular.

## 🚀 Características

- ✅ Estructura escalable con módulos separados
- ✅ DTO base común para respuestas consistentes
- ✅ Validación automática de datos
- ✅ JWT para autenticación
- ✅ Hash seguro de contraseñas
- ✅ API Keys únicas por usuario-sucursal
- ✅ Manejo de errores detallado

## 📦 Estructura

```
src/
├── auth/
│   ├── dto/
│   │   ├── register-client.dto.ts
│   │   ├── auth-response.dto.ts
│   │   └── index.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── common/
│   └── dto/
│       ├── base-response.dto.ts
│       └── index.ts
└── prisma/
    ├── prisma.service.ts
    ├── prisma.module.ts
    └── seed.ts
```

## 🔧 Endpoints

### POST `/auth/register/client`

Registra un nuevo cliente en una sucursal específica.

**Body:**
```json
{
  "email": "cliente@example.com",
  "username": "cliente123",
  "password": "contraseña123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "branchId": 1
}
```

**Response Success:**
```json
{
  "successful": true,
  "data": {
    "user": {
      "id": 2,
      "email": "cliente@example.com",
      "username": "cliente123",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "CLIENT"
    },
    "branch": {
      "id": 1,
      "name": "Sucursal Centro",
      "businessName": "Barbershop Pro"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Error:**
```json
{
  "successful": false,
  "error": [
    {
      "code": 1001,
      "description": "El username ya está en uso"
    }
  ]
}
```

## 🔑 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 1001 | Username ya está en uso |
| 1002 | La sucursal no existe |
| 1003 | Ya existe una cuenta con este email en esta sucursal |
| 5000 | Error interno del servidor |

## 🧪 Datos de Prueba

Para crear datos de prueba, ejecuta:

```bash
npm run prisma:seed
```

Esto creará:
- Un usuario ROOT (dueño)
- Un comercio "Barbershop Pro"
- Una sucursal "Sucursal Centro"

## 📝 Ejemplo de uso con curl

```bash
curl -X POST http://localhost:3000/auth/register/client \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@test.com",
    "username": "cliente_test",
    "password": "123456",
    "firstName": "Test",
    "lastName": "User",
    "branchId": 1
  }'
```

## 🔐 JWT Token

El token JWT contiene:
```json
{
  "userId": 2,
  "userBranchId": 1,
  "branchId": 1,
  "role": "CLIENT",
  "iat": 1609459200,
  "exp": 1610064000
}
```

## 🏗️ Arquitectura

- **BaseResponseDto**: Respuesta estandarizada para toda la API
- **PrismaService**: Servicio global para base de datos
- **AuthService**: Lógica de negocio de autenticación
- **AuthController**: Endpoints REST
- **DTOs**: Validación automática de entrada y salida

## ⚙️ Variables de Entorno

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your_super_secret_jwt_key"
```
