# Diseño del Componente Pagination para Landing (Next.js)

## Overview

Componente funcional de paginación que se integra con los primitivos UI existentes y los servicios backend del proyecto.

## Estructura del Componente

### 1. **SmartPagination.tsx** - Componente Principal

```typescript
interface SmartPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  loading?: boolean;
  showItemsPerPage?: boolean;
  showResultsInfo?: boolean;
}
```

**Ubicación**: `landing/components/reusable-components/SmartPagination.tsx`

### 2. **usePagination.ts** - Hook personalizado

```typescript
interface UsePaginationProps {
  initialPage?: number;
  initialItemsPerPage?: number;
  onFetch: (page: number, limit: number) => Promise<PaginatedResponse<T>>;
}

interface UsePaginationReturn<T> {
  // Estado
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  loading: boolean;
  error: string | null;

  // Acciones
  goToPage: (page: number) => void;
  changeItemsPerPage: (newLimit: number) => void;
  refresh: () => void;
}
```

**Ubicación**: `landing/hooks/usePagination.ts`

## Funcionalidades

### ✅ Navegación de páginas

- Botones Previous/Next
- Números de página con ellipsis (...)
- Salto directo a primera/última página
- Máximo 7 números visibles: `[1] ... [4] [5] [6] ... [20]`

### ✅ Selector de elementos por página

- Dropdown con opciones: 10, 25, 50, 100
- Recalcula totalPages automáticamente
- Resetea a página 1 al cambiar

### ✅ Contador de resultados

- "Mostrando 1-25 de 157 resultados"
- "Página 2 de 7"

### ✅ Estados de loading

- Skeleton loader durante carga
- Deshabilitación de controles
- Indicador visual de proceso

## Integración con Backend

### Patrón de uso en servicios existentes:

```typescript
// En client.service.ts, appointment.service.ts, etc.
const response = await api.get(`/endpoint?page=${page}&limit=${limit}`)

// Response esperado:
{
  success: true,
  data: {
    items: [...],           // Los datos
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 125,
      itemsPerPage: 25,
      hasNextPage: true,
      hasPrevPage: false
    }
  }
}
```

## Casos de Uso

### 1. **Página de Clientes** (`/panel/clientes`)

**Estado Actual**: Ya existe una tabla completa con `DataTable` component

```tsx
// Configuración existente de columnas
const columns: ColumnConfig<Client>[] = [
  { key: 'name', title: 'Cliente', render: (client) => ... },
  { key: 'phone', title: 'Teléfono', render: (client) => ... },
  { key: 'stats', title: 'Estadísticas', render: (client) => ... },
  { key: 'status', title: 'Estado', render: (client) => ... }
]

// Integración con paginación
const ClientesPage = () => {
  const {
    data: clients,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    loading,
    goToPage,
    changeItemsPerPage
  } = usePagination({
    onFetch: (page, limit) => clientsService.getClients(brandId, page, limit, filters)
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" ... />
      <SearchBar value={searchTerm} ... />

      <DataTable
        data={clients}
        columns={columns}
        keyExtractor={(client) => client.id.toString()}
        title="Lista de Clientes"
        titleIcon={Users}
        loading={loading}
        avatar={avatarConfig}
        actions={rowActions}
      />

      {/* Nueva integración de paginación */}
      <SmartPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={goToPage}
        onItemsPerPageChange={changeItemsPerPage}
        loading={loading}
        showItemsPerPage={true}
        showResultsInfo={true}
      />
    </div>
  )
}
```

**Componentes existentes a integrar**:

- ✅ `DataTable` - Tabla reutilizable con columnas configurables
- ✅ `useClients` - Hook que maneja estado de clientes
- ✅ `PageHeader` - Header con título y botón crear cliente
- ✅ `SearchBar` - Búsqueda en tiempo real
- ❌ **Falta**: Paginación en `useClients` hook

### 2. **Página de Citas** (`/panel/calendario`)

- Lista tabular de citas con filtros
- Paginación por días/semanas
- Integración con AppointmentService existente

### 3. **Historial en Perfil de Cliente**

- Citas pasadas del cliente
- Actividad del cliente
- Integración con ClientDetailView

## Ventajas del Diseño

1. **Reutilizable**: Un solo componente para todas las listas
2. **Consistente**: Misma UX en todo el panel admin
3. **Performante**: Solo carga datos necesarios
4. **Flexible**: Configurable según necesidades
5. **Integrado**: Usa servicios backend existentes

## Archivos a Crear

1. `landing/components/reusable-components/SmartPagination.tsx`
2. `landing/hooks/usePagination.ts`
3. `landing/types/pagination.types.ts`

## Archivos a Modificar

### 1. `landing/app/panel/clientes/page.tsx`

**Cambios**: Integrar `SmartPagination` con la `DataTable` existente

```tsx
// Reemplazar useClients con usePagination
const { data: clients, ...paginationProps } = usePagination({
  onFetch: (page, limit) => clientsService.getClients(brandId, page, limit, searchTerm)
})

// Agregar componente después de DataTable
<SmartPagination {...paginationProps} />
```

### 2. `landing/hooks/use-clients.ts`

**Cambios**: Modificar para soportar paginación

- Agregar parámetros `page` y `limit` a `loadClients()`
- Retornar metadata de paginación del backend
- Integrar con `usePagination` hook

### 3. `landing/services/client.service.ts`

**Cambios**: Actualizar método `getClients` para usar paginación

```typescript
// Método existente a actualizar
async getClients(brandId: number, page = 1, limit = 25, searchTerm?: string): Promise<ApiResponse<ClientListResponse>> {
  const endpoint = API_ENDPOINTS.CLIENTS.GET_ALL(brandId)
  const params = { page, limit, search: searchTerm }
  return apiClient.get(buildApiUrl(endpoint, params))
}
```

### 4. `landing/components/reusable-components/DateTable.tsx`

**Cambios**: Agregar prop opcional para deshabilitar durante paginación

```tsx
interface DataTableProps<T = any> {
  // ... props existentes
  paginationLoading?: boolean; // Nueva prop
}
```

## Timeline Estimado

### **Día 1**: Crear componentes base

- ✅ Crear `SmartPagination.tsx` usando primitivos UI existentes
- ✅ Crear `usePagination.ts` hook genérico
- ✅ Crear types en `pagination.types.ts`

### **Día 2**: Integrar en página de clientes

- ✅ Modificar `client.service.ts` para recibir parámetros de paginación
- ✅ Actualizar `use-clients.ts` para usar `usePagination`
- ✅ Integrar `SmartPagination` en `/panel/clientes/page.tsx`
- ✅ Testing con datos reales

### **Día 3**: Extender a otras páginas

- ✅ Integrar en calendario (`/panel/calendario/page.tsx`)
- ✅ Integrar en historial de `ClientDetailView`
- ✅ Testing final y optimizaciones

## Implementación Específica

### Paso 1: Modificar `client.service.ts`

```typescript
// Actualizar método existente
async getClients(
  brandId: number,
  page: number = 1,
  limit: number = 25,
  searchTerm?: string
): Promise<ApiResponse<ClientListResponse>> {
  const endpoint = API_ENDPOINTS.CLIENTS.GET_ALL(brandId)
  const params = {
    [QUERY_PARAMS.PAGINATION.PAGE]: page,
    [QUERY_PARAMS.PAGINATION.LIMIT]: limit,
    ...(searchTerm && { [QUERY_PARAMS.FILTERING.SEARCH]: searchTerm })
  }

  return apiClient.get(buildApiUrl(endpoint, params))
}
```

### Paso 2: Integrar en `ClientesPage`

```tsx
// Reemplazar useClients con usePagination en línea ~17
const {
  data: clients,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  loading,
  error,
  goToPage,
  changeItemsPerPage,
  refresh
} = usePagination<Client>({
  initialItemsPerPage: 25,
  onFetch: (page, limit) => clientsService.getClients(brandId!, page, limit, searchTerm)
})

// Agregar después del DataTable (línea ~169)
<SmartPagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={goToPage}
  onItemsPerPageChange={changeItemsPerPage}
  loading={loading}
  showItemsPerPage={true}
  showResultsInfo={true}
/>
```
