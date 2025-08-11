export interface BusinessTypeDto {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  order: number;
  recommendedFeatures?: FeatureDto[];
}

export interface FeatureDto {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  category: 'ESSENTIAL' | 'BUSINESS' | 'ADVANCED';
  isRecommended: boolean;
  isPopular: boolean;
  order: number;
  businessTypes: string[];
}

export interface PlanDto {
  id: number;
  type: 'web' | 'app' | 'complete';
  name: string;
  description?: string;
  basePrice: number;
}

export interface LandingConfigDto {
  businessTypes: BusinessTypeDto[];
  features: FeatureDto[];
  plans: PlanDto[];
}
