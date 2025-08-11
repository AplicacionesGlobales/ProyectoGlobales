# API Structure Documentation

Esta carpeta contiene la estructura centralizada para manejar todas las llamadas a la API del backend.

## Estructura de archivos

### `constants.ts`
- Contiene todas las rutas de endpoints y configuraciones base
- Define `BASE_URL` y `API_ENDPOINTS`
- Centraliza todas las URLs para fácil mantenimiento

### `types.ts`
- Define todos los tipos TypeScript para requests y responses
- Mantiene consistencia de tipos entre frontend y backend
- Facilita el autocompletado y validación de tipos

### `endpoints.ts`
- Implementa las funciones que hacen las llamadas HTTP
- Usa la función helper `apiRequest` para centralizar la lógica común
- Maneja errores de forma consistente
- Exporta funciones limpias para usar en servicios

### `index.ts`
- Punto de entrada único para importar todo lo relacionado con la API
- Facilita las importaciones en otros archivos

## Beneficios de esta estructura

1. **Centralización**: Toda la lógica de API en un solo lugar
2. **Reutilización**: La función `apiRequest` maneja la lógica común
3. **Tipado fuerte**: TypeScript garantiza la correcta estructura de datos
4. **Mantenibilidad**: Cambios en endpoints se hacen solo en `constants.ts`
5. **Consistencia**: Todos los endpoints siguen el mismo patrón
6. **Separación de responsabilidades**: Los servicios solo manejan lógica de negocio

## Uso en servicios

```typescript
import { registerUser, loginUser } from '../api';

// En lugar de manejar fetch directamente, usamos las funciones exportadas
const response = await loginUser({ email, password });
```

## Agregar nuevos endpoints

1. Agregar la ruta en `constants.ts`
2. Definir tipos en `types.ts`
3. Implementar función en `endpoints.ts`
4. Exportar en `index.ts` si es necesario
