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

  // Business details
  businessType?: string;
  selectedFeatures?: string[];

  // Customization
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
  };

  // Files (these will be handled as FormData)
  logoFile?: File;
  isotopoFile?: File;
  imagotipoFile?: File;

  // Plan and pricing information
  plan?: {
    type: "web" | "app" | "complete";
    price: number;
    features: string[];
    billingPeriod?: "monthly" | "annual";
  };

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
    // Check if we have files to upload
    const hasFiles = data.logoFile || data.isotopoFile || data.imagotipoFile;

    if (hasFiles) {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add text fields
      formData.append('email', data.email);
      formData.append('username', data.username);
      formData.append('password', data.password);
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('brandName', data.brandName);
      
      if (data.brandDescription) formData.append('brandDescription', data.brandDescription);
      if (data.brandPhone) formData.append('brandPhone', data.brandPhone);
      if (data.businessType) formData.append('businessType', data.businessType);
      
      // Add arrays and objects as JSON strings
      if (data.selectedFeatures) formData.append('selectedFeatures', JSON.stringify(data.selectedFeatures));
      formData.append('colorPalette', JSON.stringify(data.colorPalette));
      if (data.plan) formData.append('plan', JSON.stringify(data.plan));
      
      // Add optional metadata
      if (data.registrationDate) formData.append('registrationDate', data.registrationDate);
      if (data.source) formData.append('source', data.source);
      
      // Add files
      if (data.logoFile) formData.append('logoFile', data.logoFile);
      if (data.isotopoFile) formData.append('isotopoFile', data.isotopoFile);
      if (data.imagotipoFile) formData.append('imagotipoFile', data.imagotipoFile);

      // Use apiClient.postFormData for file uploads
      return apiClient.postFormData(API_ENDPOINTS.AUTH.REGISTER_BRAND, formData);
    } else {
      // Use regular JSON post when no files
      return apiClient.post(API_ENDPOINTS.AUTH.REGISTER_BRAND, data);
    }
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
