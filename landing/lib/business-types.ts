// This file now serves as legacy types and fallback data
// The main data should come from the backend API via landingService

import { BusinessType, Feature, Plan } from './api/types';

// Legacy interfaces for backward compatibility
export interface BusinessTypeLocal {
  id: string;
  name: string;
  icon: string;
  services: string[];
}

export interface AppFeatureLocal {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'business' | 'advanced';
  popular?: boolean;
  price: number;
}

// Re-export API types for convenience
export type { BusinessType, Feature, Plan };

// Fallback data (should be replaced by API calls)
export const BUSINESS_TYPES: BusinessTypeLocal[] = [
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
    services: ["citas", "pagos"]
  },
];

// Fallback features (should be replaced by API calls)
export const APP_FEATURES: AppFeatureLocal[] = [
  {
    id: "citas",
    name: "Sistema de Citas",
    description: "Agenda y gestión de citas online",
    icon: "citas",
    category: "core",
    popular: true,
    price: 15,
  },
  {
    id: "pagos",
    name: "Pagos Online",
    description: "Procesar pagos y facturación",
    icon: "pagos",
    category: "core",
    popular: true,
    price: 10,
  },
  {
    id: "clientes",
    name: "Base de Clientes",
    description: "Gestión de información de clientes",
    icon: "clientes",
    category: "core",
    popular: true,
    price: 8,
  },
  {
    id: "ubicaciones",
    name: "Servicios a Domicilio",
    description: "Para negocios que van donde el cliente",
    icon: "ubicaciones",
    category: "business",
    price: 12,
  },
  {
    id: "archivos",
    name: "Gestión de Archivos",
    description: "Almacenamiento y compartir archivos",
    icon: "archivos",
    category: "business",
    price: 7,
  },
  {
    id: "galerias",
    name: "Galerías de Trabajo",
    description: "Mostrar tu portafolio visual",
    icon: "galerias",
    category: "business",
    price: 9,
  },
  {
    id: "recordatorios",
    name: "Recordatorios Email",
    description: "Notificaciones automáticas por email",
    icon: "recordatorios",
    category: "business",
    price: 6,
  },
  {
    id: "reportes",
    name: "Reportes Avanzados",
    description: "Analytics y métricas de negocio",
    icon: "reportes",
    category: "advanced",
    price: 18,
  },
  {
    id: "seguimiento",
    name: "Seguimiento de Progreso",
    description: "Track de objetivos y resultados",
    icon: "seguimiento",
    category: "advanced",
    price: 14,
  },
];

// Helper functions that work with both legacy and new data
export const getBusinessType = (id: string): BusinessTypeLocal | undefined => {
  return BUSINESS_TYPES.find(type => type.id === id);
};

export const getAppFeature = (id: string): AppFeatureLocal | undefined => {
  return APP_FEATURES.find(feature => feature.id === id);
};

export const getRecommendedFeatures = (businessTypeId: string): AppFeatureLocal[] => {
  const businessType = getBusinessType(businessTypeId);
  if (!businessType) return [];
  
  return businessType.services
    .map(serviceId => getAppFeature(serviceId))
    .filter((feature): feature is AppFeatureLocal => feature !== undefined);
};

// Conversion helpers for API data
export const convertBusinessTypeFromAPI = (apiBusinessType: BusinessType): BusinessTypeLocal => ({
  id: apiBusinessType.key,
  name: apiBusinessType.title,
  icon: apiBusinessType.icon,
  services: apiBusinessType.recommendedFeatures?.map(f => f.key) || [],
});

export const convertFeatureFromAPI = (apiFeature: Feature): AppFeatureLocal => ({
  id: apiFeature.key,
  name: apiFeature.title,
  description: apiFeature.description,
  icon: apiFeature.key, // Use key as icon identifier
  category: apiFeature.category.toLowerCase() as 'core' | 'business' | 'advanced',
  popular: apiFeature.isPopular,
  price: apiFeature.price,
});
