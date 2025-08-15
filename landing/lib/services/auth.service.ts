/**
 * Authentication Service
 * Handles all authentication-related operations
 * Follows Single Responsibility Principle
 */

import { apiClient } from '../api/client';
import { API_ROUTES } from '../constants/api-routes';

// Types
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
  businessTypeId: string;
  selectedFeatureIds: string[];

  // Customization - SOLO los 5 colores hexadecimales
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
  };

  // Images as base64 strings
  logoImage?: string;
  isotopoImage?: string;
  imagotipoImage?: string;

  // Plan information - SOLO ID del plan
  planId: string;
  planBillingPeriod: "monthly" | "annual";
  finalPrice: number;

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

/**
 * Authentication Service Class
 * Handles all authentication operations
 */
export class AuthService {
  
  /**
   * Health check endpoint
   * @returns Promise with health status
   */
  async healthCheck() {
    try {
      return await apiClient.get(API_ROUTES.HEALTH);
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, error: 'Health check failed' };
    }
  }

  /**
   * Register a new brand
   * @param data - Brand registration data
   * @returns Promise<BrandRegistrationResponse>
   */
  async registerBrand(data: BrandRegistrationData) {
    try {
      const response = await apiClient.post<BrandRegistrationResponse>(
        API_ROUTES.AUTH.REGISTER_BRAND,
        data
      );
      return response;
    } catch (error) {
      console.error('Brand registration failed:', error);
      throw error;
    }
  }

  /**
   * Login admin user
   * @param credentials - Login credentials
   * @returns Promise with login result
   */
  async loginAdmin(credentials: LoginData) {
    try {
      return await apiClient.post(API_ROUTES.AUTH.LOGIN_ADMIN, credentials);
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  }

  /**
   * Login client user
   * @param credentials - Login credentials
   * @returns Promise with login result
   */
  async loginClient(credentials: LoginData) {
    try {
      return await apiClient.post(API_ROUTES.AUTH.LOGIN_CLIENT, credentials);
    } catch (error) {
      console.error('Client login failed:', error);
      throw error;
    }
  }

  /**
   * Forgot password
   * @param email - User email
   * @returns Promise with result
   */
  async forgotPassword(email: string) {
    try {
      return await apiClient.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email });
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  }

  /**
   * Reset password
   * @param token - Reset token
   * @param password - New password
   * @returns Promise with result
   */
  async resetPassword(token: string, password: string) {
    try {
      return await apiClient.post(API_ROUTES.AUTH.RESET_PASSWORD, { token, password });
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
