# Loading Components

Esta carpeta contiene los componentes especializados para estados de carga (loading).

## Archivos

- **`index.ts`** - Exportaciones centralizadas de todos los componentes
- **`LoadingSpinner.tsx`** - Componente básico de spinner animado
- **`LoadingScreen.tsx`** - Pantalla completa de loading para transiciones
- **`LoadingOverlay.tsx`** - Modal overlay que se superpone al contenido
- **`LoadingState.tsx`** - Wrapper condicional para mostrar/ocultar contenido

## Botones con Loading

**Nota:** Para botones con loading, usa el componente `Button` normal que ya tiene esta funcionalidad integrada:

```tsx
import { Button } from '../Button';

<Button 
  title="Guardar" 
  loading={isLoading} 
  onPress={handleSave} 
/>
```

## Uso

```tsx
// Importación desde loading
import { 
  LoadingSpinner, 
  LoadingScreen, 
  LoadingOverlay, 
  LoadingState
} from './loading';

// Para botones, usa el Button normal
import { Button } from '../Button';

// Ejemplo de botón con loading
<Button 
  title="Procesar" 
  loading={isProcessing} 
  onPress={handleProcess} 
/>
```

## Dependencias

- Todos los componentes usan estilos nativos de React Native
- Los tipos están centralizados en `../../../types/loading.types.ts`
- Para botones con loading, usa el componente `Button` en `../Button.tsx`
- Hook relacionado: `../../../hooks/useLoading.ts`

## Estructura de Dependencias

```
LoadingSpinner (base)
├── LoadingScreen
├── LoadingOverlay  
└── LoadingState