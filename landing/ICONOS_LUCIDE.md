# Librería de Iconos - Lucide React

## ¿Por qué Lucide React?

He implementado **Lucide React** como la librería de iconos para este proyecto. Es una excelente elección por las siguientes razones:

### ✅ Ventajas de Lucide React

1. **Completamente gratuita** - Sin restricciones de uso comercial
2. **Más de 1,400+ iconos** - Una de las colecciones más grandes y completas
3. **Optimizada para React/Next.js** - Tree-shaking automático, solo importa los iconos que uses
4. **SVG nativos** - Renderizado rápido y escalable
5. **Consistente** - Todos los iconos siguen el mismo estilo visual
6. **Tamaño pequeño** - ~2KB por icono, solo los que uses se incluyen en el bundle
7. **Actualizada regularmente** - Mantenimiento activo y nuevos iconos constantemente

### 🎨 Iconos Implementados

En el archivo `lib/icons.tsx` he mapeado los siguientes iconos:

- **Tipos de Negocio:**
  - Fotógrafo: `Camera`
  - Camarógrafo: `Video`
  - Médico/Dentista: `Stethoscope`
  - Estilista/Barbero: `Scissors`
  - Consultor: `Briefcase`
  - Masajista/Spa: `Heart`
  - Entrenador Personal: `Dumbbell`
  - Otro: `Building`

- **Funciones de la App:**
  - Citas: `Calendar`
  - Pagos: `CreditCard`
  - Clientes: `Users`
  - Ubicaciones: `MapPin`
  - Archivos: `FolderOpen`
  - Galerías: `Image`
  - Recordatorios Email: `Mail`
  - Reportes: `BarChart3`
  - Seguimiento: `TrendingUp`

### 🚀 Cómo usar

```tsx
import { Icon } from '@/lib/icons'

// Uso básico
<Icon name="citas" size={24} className="text-blue-600" />

// Con diferentes tamaños
<Icon name="pagos" size={32} />
<Icon name="archivos" size={16} />
```

### 📦 Instalación

La librería ya está instalada:
```bash
npm install lucide-react --legacy-peer-deps
```

### 🔄 Agregar nuevos iconos

Para agregar más iconos:

1. Busca el icono en [lucide.dev](https://lucide.dev/)
2. Importa el componente en `lib/icons.tsx`
3. Agrega el mapeo en `iconMap`

Ejemplo:
```tsx
import { NewIcon } from 'lucide-react';

export const iconMap = {
  // ... iconos existentes
  'nuevo-servicio': NewIcon,
};
```

### 🎯 Cambios Realizados

✅ Eliminé las funciones solicitadas:
- ❌ Control de Inventario
- ❌ Videollamadas 
- ❌ Automatización
- ❌ Integraciones

✅ Modifiqué "Recordatorios SMS/Email" a "Recordatorios Email"

✅ Reemplacé todos los emojis por iconos de Lucide React

La aplicación ahora tiene una apariencia más profesional y consistente con iconos vectoriales escalables en lugar de emojis.
