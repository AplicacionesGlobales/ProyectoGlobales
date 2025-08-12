# Componentes de Loading

Este sistema incluye un conjunto completo de componentes reutilizables para manejar estados de carga de manera consistente y escalable.

## Estructura de Archivos

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx               # ✨ Ya incluye funcionalidad de loading
│       └── loading/
│           ├── index.ts              # Exportaciones centralizadas
│           ├── LoadingSpinner.tsx    # Componente básico de spinner
│           ├── LoadingScreen.tsx     # Pantalla completa de loading
│           ├── LoadingOverlay.tsx    # Modal overlay
│           └── LoadingState.tsx      # Wrapper condicional
├── hooks/
│   └── useLoading.ts                 # Hook personalizado
└── types/
    └── loading.types.ts              # Tipos TypeScript
```

## Importaciones

```tsx
// Componentes de loading
import { 
  LoadingSpinner, 
  LoadingScreen, 
  LoadingOverlay, 
  LoadingState
} from '../components/ui/loading';

// Para botones con loading, usa el Button normal
import { Button } from '../components/ui/Button';
```

## Componentes Disponibles

### 1. LoadingSpinner
Componente básico de spinner de carga.

```tsx
import { LoadingSpinner } from '../components/ui/loading';

<LoadingSpinner 
  size="large" 
  color="#3B82F6" 
  className="my-4"
/>
```

**Props:**
- `size`: 'small' | 'large' (default: 'small')
- `color`: string (default: '#3B82F6')
- `className`: string

### 2. LoadingScreen
Pantalla completa de carga para transiciones entre vistas.

```tsx
import { LoadingScreen } from '../components/ui/loading';

<LoadingScreen 
  message="Cargando contenido..." 
  spinnerColor="#3B82F6"
  backgroundColor="#FFFFFF"
/>
```

**Props:**
- `message`: string (default: 'Cargando...')
- `backgroundColor`: string (default: '#FFFFFF')
- `spinnerColor`: string (default: '#3B82F6')
- `textColor`: string (default: '#374151')
- `className`: string

### 3. LoadingOverlay
Modal overlay para mostrar loading sobre contenido existente.

```tsx
import { LoadingOverlay } from '../components/ui/loading';

<LoadingOverlay 
  visible={isLoading}
  message="Procesando..."
  backgroundColor="rgba(0, 0, 0, 0.5)"
/>
```

**Props:**
- `visible`: boolean (required)
- `message`: string (default: 'Cargando...')
- `backgroundColor`: string (default: 'rgba(0, 0, 0, 0.5)')
- `overlayColor`: string (default: '#FFFFFF')
- `spinnerColor`: string (default: '#3B82F6')
- `textColor`: string (default: '#374151')
- `transparent`: boolean (default: true)
- `className`: string

### 4. LoadingState
Wrapper component que muestra loading mientras se carga contenido.

```tsx
import { LoadingState } from '../components/ui/loading';

<LoadingState 
  loading={isLoading}
  message="Cargando datos..."
  variant="spinner"
>
  <MyDataComponent />
</LoadingState>
```

**Props:**
- `loading`: boolean (required)
- `children`: React.ReactNode (required)
- `fallback`: React.ReactNode
- `message`: string (default: 'Cargando...')
- `variant`: 'spinner' | 'inline' | 'overlay' (default: 'spinner')
- `size`: 'small' | 'large' (default: 'small')
- `color`: string (default: '#3B82F6')
- `className`: string

### 4. Button con Loading
El componente Button ya incluye funcionalidad de loading integrada.

```tsx
import { Button } from '../components/ui/Button';

<Button
  title="Guardar"
  loading={isSaving}
  onPress={handleSave}
  variant="solid"
  color="primary"
/>
```

**Props relacionadas con loading:**
- `loading`: boolean (default: false)
- Cuando `loading={true}`:
  - Muestra un `ActivityIndicator`
  - Se desactiva automáticamente
  - Oculta el texto y los iconos

## Hook useLoading

Hook personalizado para manejar estados de loading de manera sencilla.

```tsx
import { useLoading } from '../hooks/useLoading';

function MyComponent() {
  const { loading, startLoading, stopLoading, withLoading } = useLoading();

  const handleApiCall = async () => {
    await withLoading(async () => {
      // Tu llamada async aquí
      await api.getData();
    });
  };

  return (
    <LoadingButton
      title="Cargar Datos"
      loading={loading}
      onPress={handleApiCall}
    />
  );
}
```

**Métodos disponibles:**
- `loading`: boolean - Estado actual de carga
- `setLoading(value: boolean)`: Setter manual del estado
- `startLoading()`: Inicia el estado de carga
- `stopLoading()`: Detiene el estado de carga
- `withLoading(asyncFn)`: Ejecuta una función async envuelta en loading

## Tipos

Todos los tipos están centralizados en `src/types/loading.types.ts`:

```tsx
import {
  LoadingSpinnerProps,
  LoadingScreenProps,
  LoadingOverlayProps,
  LoadingStateProps,
  LoadingButtonProps,
  UseLoadingOptions,
  UseLoadingReturn
} from '../types/loading.types';
```

## Ejemplos de Uso

### Pantalla de Carga Simple
```tsx
function MyScreen() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadData().finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Inicializando aplicación..." />;
  }

  return <MyContent />;
}
```

### Botón con Loading
```tsx
function SaveButton() {
  const { loading, withLoading } = useLoading();

  const handleSave = async () => {
    await withLoading(async () => {
      await saveData();
    });
  };

  return (
    <Button
      title="Guardar Cambios"
      loading={loading}
      onPress={handleSave}
      variant="solid"
      color="primary"
    />
  );
}
```

### Lista con Loading
```tsx
function DataList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <LoadingState loading={loading} message="Cargando lista...">
      {data.map(item => (
        <ListItem key={item.id} data={item} />
      ))}
    </LoadingState>
  );
}
```

### Overlay para Acciones
```tsx
function FormWithOverlay() {
  const [showOverlay, setShowOverlay] = useState(false);

  const handleSubmit = async () => {
    setShowOverlay(true);
    try {
      await submitForm();
    } finally {
      setShowOverlay(false);
    }
  };

  return (
    <>
      <MyForm onSubmit={handleSubmit} />
      <LoadingOverlay 
        visible={showOverlay}
        message="Enviando formulario..."
      />
    </>
  );
}
```

## Configuración Global

Los colores por defecto pueden ser personalizados modificando los valores en cada componente o creando un theme provider.

### Colores por Defecto
- Primary: `#3B82F6`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Text: `#374151`
- Background: `#FFFFFF`

## Mejores Prácticas

1. **Usa LoadingScreen** para transiciones completas entre pantallas
2. **Usa LoadingOverlay** para acciones que bloquean la UI temporalmente
3. **Usa LoadingState** para secciones específicas de contenido
4. **Usa LoadingButton** para acciones de botones
5. **Usa el hook useLoading** para lógica de loading reutilizable
6. **Proporciona mensajes descriptivos** para mejorar la experiencia del usuario
7. **Mantén consistencia** en colores y tamaños a través de la aplicación
