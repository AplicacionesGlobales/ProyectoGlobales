// Business types with recommended services
export interface BusinessType {
  id: string;
  name: string;
  icon: string; // Changed from emoji to icon ID
  services: string[]; // IDs of recommended services
}

// Available services/features for apps
export interface AppFeature {
  id: string;
  name: string;
  description: string;
  icon: string; // Changed from emoji to icon ID
  category: 'core' | 'business' | 'advanced';
  popular?: boolean;
}

// Business types configuration
export const BUSINESS_TYPES: BusinessType[] = [
  { 
    id: "fotografo", 
    name: "Fotógrafo", 
    icon: "fotografo", 
    services: ["citas", "ubicaciones", "archivos", "pagos", "galerias"] 
  },
  { 
    id: "camarografo", 
    name: "Camarógrafo", 
    icon: "camarografo", 
    services: ["citas", "ubicaciones", "archivos", "pagos", "galerias"] 
  },
  { 
    id: "medico", 
    name: "Médico/Dentista", 
    icon: "medico", 
    services: ["citas", "archivos", "pagos", "reportes", "recordatorios"] 
  },
  { 
    id: "estilista", 
    name: "Estilista/Barbero", 
    icon: "estilista", 
    services: ["citas", "pagos", "galerias", "recordatorios"] 
  },
  { 
    id: "consultor", 
    name: "Consultor", 
    icon: "consultor", 
    services: ["citas", "archivos", "pagos", "reportes"] 
  },
  { 
    id: "masajista", 
    name: "Masajista/Spa", 
    icon: "masajista", 
    services: ["citas", "ubicaciones", "pagos", "recordatorios"] 
  },
  { 
    id: "entrenador", 
    name: "Entrenador Personal", 
    icon: "entrenador", 
    services: ["citas", "ubicaciones", "archivos", "pagos", "seguimiento"] 
  },
  { 
    id: "otro", 
    name: "Otro Servicio", 
    icon: "otro", 
    services: ["citas", "pagos"] // Minimal set for custom business
  },
];

// Available app features
export const APP_FEATURES: AppFeature[] = [
  // Core features
  {
    id: "citas",
    name: "Sistema de Citas",
    description: "Agenda y gestión de citas online",
    icon: "citas",
    category: "core",
    popular: true,
  },
  {
    id: "pagos",
    name: "Pagos Online",
    description: "Procesar pagos y facturación",
    icon: "pagos",
    category: "core",
    popular: true,
  },
  {
    id: "clientes",
    name: "Base de Clientes",
    description: "Gestión de información de clientes",
    icon: "clientes",
    category: "core",
    popular: true,
  },
  
  // Business features
  {
    id: "ubicaciones",
    name: "Multi-ubicaciones",
    description: "Gestión de múltiples sucursales",
    icon: "ubicaciones",
    category: "business",
  },
  {
    id: "archivos",
    name: "Gestión de Archivos",
    description: "Almacenamiento y compartir archivos",
    icon: "archivos",
    category: "business",
  },
  {
    id: "galerias",
    name: "Galerías de Trabajo",
    description: "Mostrar tu portafolio visual",
    icon: "galerias",
    category: "business",
  },
  {
    id: "recordatorios",
    name: "Recordatorios Email",
    description: "Notificaciones automáticas por email",
    icon: "recordatorios",
    category: "business",
  },
  
  // Advanced features
  {
    id: "reportes",
    name: "Reportes Avanzados",
    description: "Analytics y métricas de negocio",
    icon: "reportes",
    category: "advanced",
  },
  {
    id: "seguimiento",
    name: "Seguimiento de Progreso",
    description: "Track de objetivos y resultados",
    icon: "seguimiento",
    category: "advanced",
  },
];

// Helper functions
export const getBusinessType = (id: string): BusinessType | undefined => {
  return BUSINESS_TYPES.find(type => type.id === id);
};

export const getAppFeature = (id: string): AppFeature | undefined => {
  return APP_FEATURES.find(feature => feature.id === id);
};

export const getRecommendedFeatures = (businessTypeId: string): AppFeature[] => {
  const businessType = getBusinessType(businessTypeId);
  if (!businessType) return [];
  
  return businessType.services
    .map(serviceId => getAppFeature(serviceId))
    .filter((feature): feature is AppFeature => feature !== undefined);
};
