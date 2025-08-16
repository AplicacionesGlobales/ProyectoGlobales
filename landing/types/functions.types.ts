// types/functions.types.ts

// Categorías de funciones
export enum FunctionCategory {
  ESSENTIAL = 'ESSENTIAL',
  BUSINESS = 'BUSINESS', 
  ADVANCED = 'ADVANCED'
}

// Estados de función
export enum FunctionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

// Etiquetas para categorías
export const CATEGORY_LABELS: Record<FunctionCategory, string> = {
  [FunctionCategory.ESSENTIAL]: 'Esencial',
  [FunctionCategory.BUSINESS]: 'Negocio',
  [FunctionCategory.ADVANCED]: 'Avanzado'
};

// Colores para categorías
export const CATEGORY_COLORS: Record<FunctionCategory, string> = {
  [FunctionCategory.ESSENTIAL]: 'blue',
  [FunctionCategory.BUSINESS]: 'green', 
  [FunctionCategory.ADVANCED]: 'purple'
};

// Iconos para categorías (usando lucide-react)
export const CATEGORY_ICONS: Record<FunctionCategory, string> = {
  [FunctionCategory.ESSENTIAL]: 'Zap',
  [FunctionCategory.BUSINESS]: 'Briefcase',
  [FunctionCategory.ADVANCED]: 'Crown'
};

// Interface para función completa
export interface BrandFunction {
  id: number;
  featureId: number;
  key: string;
  title: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  category: FunctionCategory;
  duration: number; // en minutos
  isActive: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  activatedAt: string;
  // Estadísticas de uso (opcional)
  stats?: {
    monthlyUsage: number;
    totalRevenue: number;
    averageRating: number;
    totalAppointments: number;
  };
}

// Interface para feature disponible
export interface AvailableFeature {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  description: string;
  basePrice: number;
  category: FunctionCategory;
  isPopular: boolean;
  isRecommended: boolean;
  businessTypes: string[];
  isActive: boolean;
  order: number;
}

// Interface para formulario de función
export interface FunctionFormData {
  title: string;
  description: string;
  currentPrice: number;
  duration: number;
  isActive: boolean;
  category: FunctionCategory;
}

// Interface para configuración de duración
export interface DurationConfig {
  min: number; // mínimo en minutos
  max: number; // máximo en minutos  
  step: number; // incremento en minutos
  default: number; // duración por defecto
}

// Configuraciones de duración predefinidas
export const DURATION_PRESETS = {
  QUICK: { min: 15, max: 60, step: 15, default: 30 },
  STANDARD: { min: 30, max: 180, step: 15, default: 60 },
  EXTENDED: { min: 60, max: 480, step: 30, default: 120 }
} as const;

// Duraciones comunes por categoría
export const COMMON_DURATIONS: Record<FunctionCategory, number[]> = {
  [FunctionCategory.ESSENTIAL]: [15, 30, 45, 60],
  [FunctionCategory.BUSINESS]: [30, 60, 90, 120],
  [FunctionCategory.ADVANCED]: [60, 90, 120, 180, 240]
};

// Rangos de precios sugeridos por categoría
export const PRICE_RANGES: Record<FunctionCategory, { min: number; max: number }> = {
  [FunctionCategory.ESSENTIAL]: { min: 5, max: 50 },
  [FunctionCategory.BUSINESS]: { min: 25, max: 150 },
  [FunctionCategory.ADVANCED]: { min: 75, max: 500 }
};

// Plantillas de funciones predefinidas por tipo de negocio
export const FUNCTION_TEMPLATES = {
  SALON: {
    name: 'Peluquería/Salón',
    functions: [
      {
        title: 'Corte de Cabello',
        description: 'Corte profesional con lavado incluido',
        duration: 45,
        price: 25,
        category: FunctionCategory.ESSENTIAL
      },
      {
        title: 'Tinte Completo',
        description: 'Coloración completa con productos premium',
        duration: 150,
        price: 65,
        category: FunctionCategory.BUSINESS
      },
      {
        title: 'Tratamiento Capilar',
        description: 'Tratamiento intensivo para el cabello',
        duration: 90,
        price: 45,
        category: FunctionCategory.BUSINESS
      },
      {
        title: 'Peinado Especial',
        description: 'Peinados para eventos especiales',
        duration: 75,
        price: 50,
        category: FunctionCategory.ADVANCED
      }
    ]
  },
  SPA: {
    name: 'Spa/Wellness',
    functions: [
      {
        title: 'Masaje Relajante',
        description: 'Masaje corporal completo',
        duration: 60,
        price: 80,
        category: FunctionCategory.ESSENTIAL
      },
      {
        title: 'Facial Rejuvenecedor',
        description: 'Tratamiento facial anti-edad',
        duration: 90,
        price: 120,
        category: FunctionCategory.BUSINESS
      },
      {
        title: 'Exfoliación Corporal',
        description: 'Exfoliación completa con aceites esenciales',
        duration: 75,
        price: 95,
        category: FunctionCategory.BUSINESS
      }
    ]
  },
  CLINIC: {
    name: 'Clínica/Consultorio',
    functions: [
      {
        title: 'Consulta General',
        description: 'Consulta médica general',
        duration: 30,
        price: 50,
        category: FunctionCategory.ESSENTIAL
      },
      {
        title: 'Consulta Especializada',
        description: 'Consulta con especialista',
        duration: 45,
        price: 85,
        category: FunctionCategory.BUSINESS
      },
      {
        title: 'Procedimiento Menor',
        description: 'Procedimientos ambulatorios',
        duration: 60,
        price: 150,
        category: FunctionCategory.ADVANCED
      }
    ]
  }
} as const;

// Utilidades para trabajar con funciones
export const functionUtils = {
  // Formatear precio para mostrar
  formatPrice: (price: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  },

  // Formatear duración para mostrar
  formatDuration: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  },

  // Calcular precio por hora
  getPricePerHour: (price: number, duration: number): number => {
    return (price / duration) * 60;
  },

  // Obtener color de categoría
  getCategoryColor: (category: FunctionCategory): string => {
    return CATEGORY_COLORS[category];
  },

  // Obtener etiqueta de categoría
  getCategoryLabel: (category: FunctionCategory): string => {
    return CATEGORY_LABELS[category];
  },

  // Validar precio dentro del rango de categoría
  isPriceValid: (price: number, category: FunctionCategory): boolean => {
    const range = PRICE_RANGES[category];
    return price >= range.min && price <= range.max;
  },

  // Obtener precio sugerido basado en duración y categoría
  getSuggestedPrice: (duration: number, category: FunctionCategory): number => {
    const range = PRICE_RANGES[category];
    const basePricePerMinute = (range.min + range.max) / 2 / 60; // precio promedio por minuto
    return Math.round(duration * basePricePerMinute);
  },

  // Ordenar funciones por categoría y orden
  sortFunctions: (functions: BrandFunction[]): BrandFunction[] => {
    const categoryOrder = {
      [FunctionCategory.ESSENTIAL]: 1,
      [FunctionCategory.BUSINESS]: 2,
      [FunctionCategory.ADVANCED]: 3
    };

    return functions.sort((a, b) => {
      // Primero por categoría
      const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category];
      if (categoryDiff !== 0) return categoryDiff;
      
      // Luego por orden específico
      const orderDiff = a.order - b.order;
      if (orderDiff !== 0) return orderDiff;
      
      // Finalmente por título
      return a.title.localeCompare(b.title);
    });
  },

  // Filtrar funciones por categoría
  filterByCategory: (functions: BrandFunction[], category: FunctionCategory): BrandFunction[] => {
    return functions.filter(func => func.category === category);
  },

  // Buscar funciones por texto
  searchFunctions: (functions: BrandFunction[], searchTerm: string): BrandFunction[] => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return functions;

    return functions.filter(func => 
      func.title.toLowerCase().includes(term) ||
      func.description.toLowerCase().includes(term) ||
      func.key.toLowerCase().includes(term)
    );
  },

  // Calcular estadísticas de funciones
  calculateStats: (functions: BrandFunction[]) => {
    const active = functions.filter(f => f.isActive);
    const totalRevenue = active.reduce((sum, f) => sum + (f.stats?.totalRevenue || 0), 0);
    const avgPrice = active.length > 0 ? active.reduce((sum, f) => sum + f.currentPrice, 0) / active.length : 0;
    const avgDuration = active.length > 0 ? active.reduce((sum, f) => sum + f.duration, 0) / active.length : 0;

    return {
      total: functions.length,
      active: active.length,
      inactive: functions.length - active.length,
      averagePrice: avgPrice,
      averageDuration: avgDuration,
      totalRevenue,
      byCategory: {
        [FunctionCategory.ESSENTIAL]: functions.filter(f => f.category === FunctionCategory.ESSENTIAL).length,
        [FunctionCategory.BUSINESS]: functions.filter(f => f.category === FunctionCategory.BUSINESS).length,
        [FunctionCategory.ADVANCED]: functions.filter(f => f.category === FunctionCategory.ADVANCED).length
      }
    };
  }
};