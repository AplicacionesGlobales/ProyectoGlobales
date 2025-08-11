// This file now serves as legacy types and minimal fallback data
// The main data should ALWAYS come from the backend API via landingService
// Use useLandingData hook instead of these fallback constants

import { BusinessType, Feature, Plan } from './api/types';

// Legacy interfaces for backward compatibility ONLY
// These should not be used in new code - use API types instead
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

// DEPRECATED: Minimal fallback data for emergency use only
// ⚠️  DO NOT USE THESE IN NEW CODE - Use useLandingData hook instead
// These are kept only for extreme fallback scenarios when API is completely unavailable

const EMERGENCY_BUSINESS_TYPES: BusinessTypeLocal[] = [
  { 
    id: "fotografo", 
    name: "Fotógrafo", 
    icon: "fotografo", 
    services: ["citas", "pagos", "clientes"] 
  },
  { 
    id: "estilista", 
    name: "Estilista/Barbero", 
    icon: "estilista", 
    services: ["citas", "pagos", "clientes"] 
  },
  { 
    id: "otro", 
    name: "Otro Servicio", 
    icon: "otro", 
    services: ["citas", "pagos"]
  },
];

const EMERGENCY_APP_FEATURES: AppFeatureLocal[] = [
  {
    id: "citas",
    name: "Sistema de Citas",
    description: "Agenda y gestión de citas online",
    icon: "citas",
    category: "core",
    popular: true,
    price: 20,
  },
  {
    id: "pagos",
    name: "Pagos Online",
    description: "Procesar pagos y facturación",
    icon: "pagos",
    category: "core",
    popular: true,
    price: 25,
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
];

// ⚠️ DEPRECATED HELPER FUNCTIONS - Use useLandingData hook instead!
// These functions are only for legacy compatibility and emergency fallback
// For new code, use: const { businessTypes, features } = useLandingData();

/**
 * @deprecated Use useLandingData().getBusinessTypeByKey() instead
 */
export const getBusinessType = (id: string): BusinessTypeLocal | undefined => {
  console.warn('⚠️ DEPRECATED: getBusinessType() - Use useLandingData().getBusinessTypeByKey() instead');
  return EMERGENCY_BUSINESS_TYPES.find(type => type.id === id);
};

/**
 * @deprecated Use useLandingData().features.find() instead
 */
export const getAppFeature = (id: string): AppFeatureLocal | undefined => {
  console.warn('⚠️ DEPRECATED: getAppFeature() - Use useLandingData().features.find() instead');
  return EMERGENCY_APP_FEATURES.find(feature => feature.id === id);
};

/**
 * @deprecated Use useLandingData().getRecommendedFeatures() instead
 */
export const getRecommendedFeatures = (businessTypeId: string): AppFeatureLocal[] => {
  console.warn('⚠️ DEPRECATED: getRecommendedFeatures() - Use useLandingData().getRecommendedFeatures() instead');
  const businessType = getBusinessType(businessTypeId);
  if (!businessType) return [];
  
  return businessType.services
    .map(serviceId => getAppFeature(serviceId))
    .filter((feature): feature is AppFeatureLocal => feature !== undefined);
};

// Modern conversion helpers for API data (RECOMMENDED)
// These are useful for converting API responses to legacy formats if needed

/**
 * Convert API BusinessType to legacy BusinessTypeLocal format
 * @param apiBusinessType - BusinessType from API
 * @returns BusinessTypeLocal format
 */
export const convertBusinessTypeFromAPI = (apiBusinessType: BusinessType): BusinessTypeLocal => ({
  id: apiBusinessType.key,
  name: apiBusinessType.title,
  icon: apiBusinessType.icon,
  services: apiBusinessType.recommendedFeatures?.map(f => f.key) || [],
});

/**
 * Convert API Feature to legacy AppFeatureLocal format
 * @param apiFeature - Feature from API
 * @returns AppFeatureLocal format
 */
export const convertFeatureFromAPI = (apiFeature: Feature): AppFeatureLocal => ({
  id: apiFeature.key,
  name: apiFeature.title,
  description: apiFeature.description,
  icon: apiFeature.key, // Use key as icon identifier
  category: apiFeature.category.toLowerCase() as 'core' | 'business' | 'advanced',
  popular: apiFeature.isPopular,
  price: apiFeature.price,
});
