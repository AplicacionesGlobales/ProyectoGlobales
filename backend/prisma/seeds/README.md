# Database Seeds

Esta carpeta contiene todos los scripts de inicialización de la base de datos organizados en archivos separados pero ejecutables de manera unificada.

## Estructura

```
prisma/seeds/
├── index.ts              # Ejecuta todos los seeds en orden
├── 01-business-types.ts  # Tipos de negocio
├── 02-features.ts        # Características/funcionalidades
├── 03-plans.ts          # Planes de suscripción
├── 04-users.ts          # Usuarios y marcas de ejemplo
└── README.md            # Este archivo
```

## Comandos disponibles

### Ejecutar todos los seeds
```bash
npm run seed
```

### Ejecutar seeds individuales
```bash
npm run seed:business-types  # Solo tipos de negocio
npm run seed:features       # Solo características
npm run seed:plans         # Solo planes
npm run seed:users         # Solo usuarios y marcas
```

## Orden de ejecución

Los seeds se ejecutan en el siguiente orden:

1. **Business Types**: Tipos de negocio (fotógrafo, médico, estilista, etc.)
2. **Features**: Características y funcionalidades disponibles
3. **Plans**: Planes de suscripción (web, app, completo)
4. **Users**: Usuarios de ejemplo y marcas

## Datos de prueba incluidos

### Usuarios
- **ROOT**: `owner@barbershop.com` / `barbershop_owner`
- **CLIENT**: `juan@gmail.com` / `juan_perez`
- **CLIENT**: `maria@gmail.com` / `maria_gonzalez`
- **ADMIN**: `admin@barbershop.com` / `admin_user`

### Marca de ejemplo
- **Nombre**: Barbershop Pro
- **Descripción**: La mejor barbería de la ciudad
- **Dirección**: Av. Principal 123, Centro
- **Teléfono**: +1234567890

### Contraseña para pruebas
- Todos los usuarios tienen la contraseña: `password123`

## Desarrollo

Si necesitas agregar un nuevo seed:

1. Crea un archivo `05-nuevo-seed.ts` siguiendo el patrón de los existentes
2. Exporta una función async con el nombre `seedNombreDelArchivo`
3. Agrega la importación y llamada en `index.ts`
4. Agrega el script individual en `package.json`

### Patrón de archivo seed

```typescript
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export async function seedMiNuevoSeed() {
  console.log('🔧 Seeding mi nuevo seed...');
  
  try {
    // Lógica del seed aquí
    console.log('✅ Mi nuevo seed completado');
  } catch (error) {
    console.error('❌ Error en mi nuevo seed:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  seedMiNuevoSeed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
```
