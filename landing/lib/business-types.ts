// Business types with recommended services
export interface BusinessType {
  id: string;
  name: string;
  emoji: string;
  services: string[]; // IDs of recommended services
}

// Available services/features for apps
export interface AppFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'business' | 'advanced';
  popular?: boolean;
}

// Business types configuration
export const BUSINESS_TYPES: BusinessType[] = [
  { 
    id: "fotografo", 
    name: "Fotógrafo", 
    emoji: "📸", 
    services: ["citas", "ubicaciones", "archivos", "pagos", "galerias"] 
  },
  { 
    id: "camarografo", 
    name: "Camarógrafo", 
    emoji: "🎥", 
    services: ["citas", "ubicaciones", "archivos", "pagos", "galerias"] 
  },
  { 
    id: "medico", 
    name: "Médico/Dentista", 
    emoji: "🦷", 
    services: ["citas", "archivos", "pagos", "reportes", "recordatorios"] 
  },
  { 
    id: "estilista", 
    name: "Estilista/Barbero", 
    emoji: "💇", 
    services: ["citas", "pagos", "galerias", "recordatorios"] 
  },
  { 
    id: "consultor", 
    name: "Consultor", 
    emoji: "💼", 
    services: ["citas", "archivos", "pagos", "reportes", "videollamadas"] 
  },
  { 
    id: "masajista", 
    name: "Masajista/Spa", 
    emoji: "💆", 
    services: ["citas", "ubicaciones", "pagos", "recordatorios"] 
  },
  { 
    id: "entrenador", 
    name: "Entrenador Personal", 
    emoji: "🏋️", 
    services: ["citas", "ubicaciones", "archivos", "pagos", "seguimiento"] 
  },
  { 
    id: "otro", 
    name: "Otro Servicio", 
    emoji: "🏢", 
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
    icon: "📅",
    category: "core",
    popular: true,
  },
  {
    id: "pagos",
    name: "Pagos Online",
    description: "Procesar pagos y facturación",
    icon: "💳",
    category: "core",
    popular: true,
  },
  {
    id: "clientes",
    name: "Base de Clientes",
    description: "Gestión de información de clientes",
    icon: "👥",
    category: "core",
    popular: true,
  },
  
  // Business features
  {
    id: "ubicaciones",
    name: "Multi-ubicaciones",
    description: "Gestión de múltiples sucursales",
    icon: "📍",
    category: "business",
  },
  {
    id: "archivos",
    name: "Gestión de Archivos",
    description: "Almacenamiento y compartir archivos",
    icon: "📁",
    category: "business",
  },
  {
    id: "galerias",
    name: "Galerías de Trabajo",
    description: "Mostrar tu portafolio visual",
    icon: "🖼️",
    category: "business",
  },
  {
    id: "recordatorios",
    name: "Recordatorios SMS/Email",
    description: "Notificaciones automáticas",
    icon: "🔔",
    category: "business",
  },
  {
    id: "inventario",
    name: "Control de Inventario",
    description: "Gestión de productos y stock",
    icon: "📦",
    category: "business",
  },
  
  // Advanced features
  {
    id: "reportes",
    name: "Reportes Avanzados",
    description: "Analytics y métricas de negocio",
    icon: "📊",
    category: "advanced",
  },
  {
    id: "videollamadas",
    name: "Videollamadas",
    description: "Consultas virtuales integradas",
    icon: "📹",
    category: "advanced",
  },
  {
    id: "seguimiento",
    name: "Seguimiento de Progreso",
    description: "Track de objetivos y resultados",
    icon: "📈",
    category: "advanced",
  },
  {
    id: "automatizacion",
    name: "Automatización",
    description: "Workflows y procesos automáticos",
    icon: "🤖",
    category: "advanced",
  },
  {
    id: "integraciones",
    name: "Integraciones",
    description: "Conectar con otras herramientas",
    icon: "🔗",
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
