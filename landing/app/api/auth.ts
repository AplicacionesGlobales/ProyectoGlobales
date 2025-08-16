import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// Types for registration
export interface BrandRegistrationData {
  // User authentication info
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;

  // Brand info
  brandName: string;
  brandDescription?: string;
  brandAddress?: string;
  brandPhone?: string;

  // Business details - SOLO IDs
  businessTypeId: string; // Solo el ID del tipo de negocio
  selectedFeatureIds: string[]; // Solo los IDs de las features seleccionadas

  // Customization - SOLO los 5 colores hexadecimales procesados
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
  };

  // Files - convertir a base64 strings para envío JSON
  logoImage?: string; // Base64 string de la imagen
  isotopoImage?: string; // Base64 string de la imagen  
  imagotipoImage?: string; // Base64 string de la imagen

  // Plan information - SOLO ID del plan
  planId: string; // ID del plan seleccionado
  planBillingPeriod: "monthly" | "annual"; // Período de facturación
  finalPrice: number; // Precio final calculado

  // Additional metadata
  registrationDate?: string;
  source?: string;
}

export interface BrandRegistrationResponse {
  user: {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  brand: {
    id: number;
    name: string;
    description?: string;
  };
  colorPalette: {
    id: number;
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
  };
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
  brandId?: number;
}

// Validation interfaces
export interface EmailValidationRequest {
  email: string;
}

export interface UsernameValidationRequest {
  username: string;
}

export interface ValidationResponse {
  success: boolean;
  data: {
    isAvailable: boolean;
    username?: string;
    email?: string;
  };
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  token: string;
}

// Auth service
export const authService = {
  /**
   * Register a new brand with ROOT user
   */
  async registerBrand(data: BrandRegistrationData): Promise<ApiResponse<BrandRegistrationResponse>> {
    // Now we only use JSON since images are base64 strings
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER_BRAND, data);
  },

  // Validation methods
  async validateEmail(data: EmailValidationRequest): Promise<ValidationResponse> {
    const response = await apiClient.post(API_ENDPOINTS.VALIDATE.EMAIL, data);
    return response as ValidationResponse;
  },

  async validateUsername(data: UsernameValidationRequest): Promise<ValidationResponse> {
    const response = await apiClient.post(API_ENDPOINTS.VALIDATE.USERNAME, data);
    return response as ValidationResponse;
  },

  /**
   * Login as admin/root user
   */
  async loginAdmin(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN_ADMIN, data);
  },

  /**
   * Login as client user
   */
  async loginClient(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN_CLIENT, data);
  },

  /**
   * Check backend health
   */
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return apiClient.healthCheck();
  },
};
