export enum PlanType {
  WEB = 'web',
  APP = 'app',
  COMPLETO = 'completo',
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

// API Request/Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  errors?: ErrorDetail[];
  message?: string;
}

export interface ErrorDetail {
  code: number;
  description: string;
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
