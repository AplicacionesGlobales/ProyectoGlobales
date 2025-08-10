# 🔐 Agenda Pro - Backend

Sistema de autenticación backend con NestJS, Prisma y JWT para manejo de usuarios con roles y sucursales.

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
```

### Base de Datos
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Poblar con datos de prueba
npm run prisma:seed
```

## 🖥️ Ejecutar el Proyecto

```bash
# Desarrollo (con hot reload)
npm run start:dev

# Tests
npm test
```

### Crear Nueva Migración
```bash
npx prisma migrate dev 
```

### Ejecutar Seeder
```bash
npm run prisma:seed
```

### Reiniciar Base de Datos
```bash
npx prisma migrate reset
```

## 📋 Datos de Prueba

Después de ejecutar el seeder tendrás:
- **3 Sucursales** disponibles (IDs: 1, 2, 3)
- **Usuario ROOT**: `barbershop_owner`
- **Clientes de ejemplo**: `juan_perez`, `maria_gonzalez`

### Ejemplo de Registro
```bash
curl -X POST http://localhost:3000/auth/register/client \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "username": "test_user", 
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "branchId": 1
  }'
```
