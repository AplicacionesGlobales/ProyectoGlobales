# 🔄 Guía de Migración: Datos Hardcoded → API

Esta guía explica cómo migrar componentes que aún usan datos quemados (hardcoded) hacia el uso de la API.

## ✅ Estado Actual

### API Endpoints Disponibles
- `GET /landing-data/config` - Configuración completa (recomendado)
- `GET /landing-data/business-types` - Tipos de negocio
- `GET /landing-data/features` - Funcionalidades
- `GET /landing-data/plans` - Planes
- `GET /landing-data/features/business-type/{businessType}` - Features por tipo de negocio
- `GET /landing-data/business-type/{businessType}/config` - Configuración de tipo específico

### Componentes ya Migrados ✅
- `components/pricing-section.tsx`
- `components/onboarding/steps/features-step.tsx`
- `components/onboarding/steps/pricing-step.tsx`
- `components/onboarding/steps/pricing-step-new.tsx`
- `app/registro/page.tsx`

### Componentes Pendientes de Migración ⚠️
- `components/onboarding/steps/features-step-old.tsx`
- `components/onboarding/steps/features-step-new.tsx`
- `components/onboarding/steps/features-step-old-backup.tsx`
- `components/onboarding/steps/confirmation-step.tsx`

## 🚀 Cómo Migrar un Componente

### 1. Reemplazar Imports

**❌ Antes:**
```tsx
import { APP_FEATURES, getRecommendedFeatures, getBusinessType } from "@/lib/business-types"
```

**✅ Después:**
```tsx
import { useLandingData } from "@/hooks/use-landing-data"
import { Feature, BusinessType } from "@/lib/api/types"
```

### 2. Usar el Hook

**❌ Antes:**
```tsx
const coreFeatures = APP_FEATURES.filter(f => f.category === 'core')
const businessFeatures = APP_FEATURES.filter(f => f.category === 'business')
const advancedFeatures = APP_FEATURES.filter(f => f.category === 'advanced')
```

**✅ Después:**
```tsx
const { 
  features, 
  loading, 
  error, 
  getFeaturesByCategory,
  getRecommendedFeatures 
} = useLandingData();

const coreFeatures = getFeaturesByCategory('ESSENTIAL') // Nota: cambió de 'core' a 'ESSENTIAL'
const businessFeatures = getFeaturesByCategory('BUSINESS')  
const advancedFeatures = getFeaturesByCategory('ADVANCED')
```

### 3. Manejar Estados de Loading

```tsx
if (loading) {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      <span className="ml-2 text-lg text-gray-600">Cargando...</span>
    </div>
  );
}

if (error) {
  return (
    <div className="text-center py-20">
      <p className="text-red-600">Error: {error}</p>
      <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
        Reintentar
      </Button>
    </div>
  );
}
```

### 4. Cambios en los Tipos de Datos

#### Categorías de Features
- `'core'` → `'ESSENTIAL'`
- `'business'` → `'BUSINESS'` 
- `'advanced'` → `'ADVANCED'`

#### Estructura de BusinessType
```tsx
// API Response
interface BusinessType {
  id: number;          // Era string en datos quemados
  key: string;         // Identificador único (como el id anterior)
  title: string;       // Era "name"
  subtitle?: string;   // Nuevo campo
  description: string; // Más detallado
  icon: string;
  order: number;       // Para ordenamiento
  recommendedFeatures?: Feature[];
}
```

#### Estructura de Feature
```tsx
// API Response
interface Feature {
  id: number;          // Era string en datos quemados
  key: string;         // Identificador único (como el id anterior)
  title: string;       // Era "name"
  subtitle?: string;   // Nuevo campo
  description: string;
  price: number;
  category: 'ESSENTIAL' | 'BUSINESS' | 'ADVANCED';
  isRecommended: boolean;
  isPopular: boolean;  // Era "popular"
  order: number;       // Para ordenamiento
  businessTypes: string[]; // Lista de keys de business types
}
```

## 📝 Ejemplo Completo de Migración

**features-step-old.tsx** (ejemplo):

```tsx
// ❌ ANTES
import { APP_FEATURES, getRecommendedFeatures } from "@/lib/business-types"

export function FeaturesStep({ businessType }) {
  const coreFeatures = APP_FEATURES.filter(f => f.category === 'core')
  const recommendedIds = getRecommendedFeatures(businessType).map(f => f.id)
  
  return (
    <div>
      {coreFeatures.map(feature => (
        <div key={feature.id}>
          <h3>{feature.name}</h3>
          <p>{feature.description}</p>
          <span>${feature.price}</span>
        </div>
      ))}
    </div>
  )
}
```

```tsx
// ✅ DESPUÉS
import { useLandingData } from "@/hooks/use-landing-data"
import { Loader2 } from "lucide-react"

export function FeaturesStep({ businessType }) {
  const { 
    features,
    loading, 
    error,
    getFeaturesByCategory,
    getRecommendedFeatures 
  } = useLandingData();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2">Cargando funcionalidades...</span>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  const coreFeatures = getFeaturesByCategory('ESSENTIAL')
  const recommendedFeatures = getRecommendedFeatures(businessType)
  
  return (
    <div>
      {coreFeatures.map(feature => (
        <div key={feature.key}>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
          <span>${feature.price}</span>
          {feature.isPopular && <Badge>Popular</Badge>}
          {feature.isRecommended && <Badge variant="secondary">Recomendado</Badge>}
        </div>
      ))}
    </div>
  )
}
```

## 🔧 Funciones Helper Disponibles

### useLandingData Hook
```tsx
const {
  config,                    // Configuración completa
  businessTypes,            // Array de BusinessType
  features,                 // Array de Feature  
  plans,                    // Array de Plan
  loading,                  // boolean
  error,                    // string | null
  getRecommendedFeatures,   // (businessTypeKey: string) => Feature[]
  getBusinessTypeById,      // (id: number) => BusinessType | undefined
  getBusinessTypeByKey,     // (key: string) => BusinessType | undefined
  getFeaturesByCategory,    // (category) => Feature[]
  getPopularFeatures,       // () => Feature[]
  getPlanByType,            // (type) => Plan | undefined
  calculateTotalPrice,      // (selectedFeatures: string[], planType) => number
  refreshData,              // () => Promise<void>
} = useLandingData();
```

## ⚠️ Notas Importantes

1. **Datos de Emergencia**: `business-types.ts` ahora solo contiene datos mínimos de emergencia
2. **Deprecation Warnings**: Las funciones antiguas muestran warnings en consola
3. **Mapeo de IDs**: Los IDs cambiaron de string a number, pero se mantiene `key` como string
4. **Categorías**: Cambiaron de lowercase a UPPERCASE
5. **Testing**: La API debe estar corriendo en `http://localhost:3000`

## 🎯 Próximos Pasos

1. Migrar los componentes pendientes uno por uno
2. Remover completamente las referencias a `APP_FEATURES` y `BUSINESS_TYPES`
3. Eliminar las funciones deprecated del archivo `business-types.ts`
4. Actualizar tests si los hay
