// landing\api\types.ts

// API Response types matching backend
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  errors?: ErrorDetail[];
  message?: string;
}

export interface ErrorDetail {
  code: number | string;
  description?: string;
  field?: string;
  message?: string;
}

// Business Type from backend
export interface BusinessType {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  order: number;
  recommendedFeatures?: Feature[];
}

// Feature from backend
export interface Feature {
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

// Plan from backend
export interface Plan {
  id: number;
  type: 'web' | 'app' | 'complete';
  name: string;
  description?: string;
  basePrice: number;
}

// Complete landing configuration
export interface LandingConfig {
  businessTypes: BusinessType[];
  features: Feature[];
  plans: Plan[];
}

// Legacy types for existing components
export enum PlanType {
  WEB = 'web',
  APP = 'app',
  COMPLETO = 'complete',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  ROOT = 'ROOT', 
  CLIENT = 'CLIENT',
}

// Brand registration types
export interface CreateBrandRequest {
  name: string;
  email: string;
  phone: string;
  ownerName: string;
  password: string;
  description?: string;
  location?: string;
  businessType?: string;
  selectedServices?: string[];
  colorPalette?: string;
  customColors?: string[];
  planType: PlanType;
  billingCycle: BillingCycle;
  logoUrl?: string;
  isotopoUrl?: string;
  imagotipoUrl?: string;
}

export interface BrandRegistrationResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
  };
  brand: {
    id: number;
    name: string;
  };
  token: string;
}

// Payment types
export interface CreatePaymentRequest {
  name: string;
  email: string;
  phone: string;
  ownerName: string;
  location?: string;
  planType: PlanType;
  billingCycle: BillingCycle;
  selectedServices?: string[];
}

export interface PaymentResponse {
  paymentUrl: string;
  orderNumber: string;
  amount: number;
}

// Login types
export interface LoginRequest {
  email: string;
  password: string;
  brandId?: number;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
  };
  brand?: {
    id: number;
    name: string;
  };
  token: string;
}

// Health check types
export interface HealthResponse {
  status: string;
  timestamp: string;
  database: {
    status: string;
    responseTime: number;
  };
}
