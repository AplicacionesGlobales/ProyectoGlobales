import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// Types for registration
export interface BrandRegistrationData {
  // User info
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

  // Color palette
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
  };
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
    return apiClient.post(API_ENDPOINTS.REGISTER_BRAND, data);
  },

  /**
   * Login as admin/root user
   */
  async loginAdmin(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post(API_ENDPOINTS.LOGIN_ADMIN, data);
  },

  /**
   * Login as client user
   */
  async loginClient(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post(API_ENDPOINTS.LOGIN_CLIENT, data);
  },

  /**
   * Check backend health
   */
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return apiClient.healthCheck();
  },
};
