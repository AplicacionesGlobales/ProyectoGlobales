# 📅 Agenda Pro

Sistema de gestión de citas con backend NestJS y frontend React Native.

## Prerrequisitos

```bash
node >= 18.0.0
npm o yarn
git
```

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/AplicacionesGlobales/ProyectoGlobales.git
cd ProyectoGlobales
```

### 2. Configurar Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### 3. Configurar Frontend
```bash
cd frontend
npm install
npm start
```

## Tests del Backend

```bash
cd backend
npm run test          # Tests unitarios
npm run test:e2e      # Tests end-to-end
npm run test:cov      # Coverage report
```

## Migraciones de Base de Datos

```bash
cd backend
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Reset completo de la base de datos
npx prisma migrate reset
```

## Cómo hacer un Pull Request

1. Crea una rama desde `develop`:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/mi-nueva-feature
```

2. Realiza tus cambios y haz commit:
```bash
git add .
git commit -m "feat: descripción del cambio"
```

3. Push y crea el PR:
```bash
git push origin feature/mi-nueva-feature
```

4. Ve a GitHub y crea un Pull Request hacia la rama `develop`

### Flujo de Ramas
- **main**: Rama principal protegida (producción)
- **develop**: Rama de desarrollo activa
