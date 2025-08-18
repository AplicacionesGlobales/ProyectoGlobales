// landing\api\endpoints.ts
import { API_BASE_URL, API_CONFIG, API_ENDPOINTS, REQUEST_TIMEOUT } from './constants';
import {
  ApiResponse,
  CreateBrandRequest,
  BrandRegistrationResponse,
  CreatePaymentRequest,
  PaymentResponse,
  LoginRequest,
  AuthResponse,
  HealthResponse,
  LandingConfig,
  BusinessType,
  Feature,
  Plan,
} from './types';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('🌐 ApiClient making request:', {
      url,
      method: options.method || 'GET',
      baseUrl: this.baseURL,
      endpoint
    });

    const config: RequestInit = {
      ...API_CONFIG,
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      console.log('📡 Fetch response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        // Intentar obtener el mensaje de error del backend
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = Array.isArray(errorData.message)
              ? errorData.message.join(', ')
              : errorData.message;
          } else if (errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors.map((e: any) => e.description || e.message).join(', ');
          }
        } catch (e) {
          // Si no puede parsear el JSON, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('📦 Response data parsed:', {
        success: data.success,
        hasData: !!data.data,
        dataType: typeof data.data
      });

      return data;
    } catch (error) {
      console.error('🚨 API request failed:', {
        url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData;

    const config: RequestInit = {
      ...options,
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }), // Solo para JSON
        ...(options?.headers || {}),
      },
    };

    return this.request<T>(endpoint, config);
  }


  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<HealthResponse>> {
    return this.get<HealthResponse>(API_ENDPOINTS.HEALTH);
  }

  // Landing data methods
  async getLandingConfig(): Promise<ApiResponse<LandingConfig>> {
    return this.get<LandingConfig>(API_ENDPOINTS.LANDING.CONFIG);
  }

  async getBusinessTypes(): Promise<ApiResponse<BusinessType[]>> {
    return this.get<BusinessType[]>(API_ENDPOINTS.LANDING.BUSINESS_TYPES);
  }

  async getFeatures(): Promise<ApiResponse<Feature[]>> {
    return this.get<Feature[]>(API_ENDPOINTS.LANDING.FEATURES);
  }

  async getPlans(): Promise<ApiResponse<Plan[]>> {
    return this.get<Plan[]>(API_ENDPOINTS.LANDING.PLANS);
  }

  async getBusinessTypeConfig(businessType: string): Promise<ApiResponse<any>> {
    return this.get<any>(API_ENDPOINTS.LANDING.BUSINESS_TYPE_CONFIG(businessType));
  }

  async getFeaturesForBusiness(businessType: string): Promise<ApiResponse<Feature[]>> {
    return this.get<Feature[]>(API_ENDPOINTS.LANDING.FEATURES_FOR_BUSINESS(businessType));
  }

  // Auth methods
  async registerBrand(data: CreateBrandRequest): Promise<ApiResponse<BrandRegistrationResponse>> {
    return this.post<BrandRegistrationResponse>(API_ENDPOINTS.AUTH.REGISTER_BRAND, data);
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
  }

  async loginAdmin(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN_ADMIN, data);
  }

  async loginClient(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN_CLIENT, data);
  }

  // Payment methods
  async createPayment(data: CreatePaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    return this.post<PaymentResponse>(API_ENDPOINTS.PAYMENT.CREATE, data);
  }

  // Validation methods
  async validateEmail(email: string): Promise<ApiResponse<{ isValid: boolean }>> {
    return this.post<{ isValid: boolean }>(API_ENDPOINTS.VALIDATION.EMAIL, { email });
  }

  async validatePhone(phone: string): Promise<ApiResponse<{ isValid: boolean }>> {
    return this.post<{ isValid: boolean }>(API_ENDPOINTS.VALIDATION.PHONE, { phone });
  }

  async validateBrandName(name: string): Promise<ApiResponse<{ isAvailable: boolean }>> {
    return this.post<{ isAvailable: boolean }>(API_ENDPOINTS.VALIDATION.BRAND_NAME, { name });
  }
}

// Service objects for compatibility with existing code
export const landingService = {
  /**
   * Get complete landing configuration in one optimized request
   */
  async getLandingConfig(): Promise<ApiResponse<LandingConfig>> {
    console.log('🔗 landingService.getLandingConfig() called');
    try {
      const endpoint = API_ENDPOINTS.LANDING.CONFIG;
      console.log('📍 Making request to:', endpoint);

      const response = await apiClient.get<LandingConfig>(endpoint);
      console.log('✅ landingService response received:', {
        success: response.success,
        hasData: !!response.data,
        errors: response.errors
      });

      return response;
    } catch (error) {
      console.error('❌ landingService.getLandingConfig() failed:', error);
      return {
        success: false,
        errors: [{
          code: 500,
          description: 'Failed to load landing configuration'
        }]
      };
    }
  },

  /**
   * Get all business types
   */
  async getBusinessTypes(): Promise<ApiResponse<BusinessType[]>> {
    try {
      return await apiClient.get<BusinessType[]>(API_ENDPOINTS.LANDING.BUSINESS_TYPES);
    } catch (error) {
      console.error('Failed to get business types:', error);
      return {
        success: false,
        errors: [{
          code: 500,
          description: 'Failed to load business types'
        }]
      };
    }
  },

  /**
   * Get all features
   */
  async getFeatures(): Promise<ApiResponse<Feature[]>> {
    try {
      return await apiClient.get<Feature[]>(API_ENDPOINTS.LANDING.FEATURES);
    } catch (error) {
      console.error('Failed to get features:', error);
      return {
        success: false,
        errors: [{
          code: 500,
          description: 'Failed to load features'
        }]
      };
    }
  },

  /**
   * Get all plans
   */
  async getPlans(): Promise<ApiResponse<Plan[]>> {
    try {
      return await apiClient.get<Plan[]>(API_ENDPOINTS.LANDING.PLANS);
    } catch (error) {
      console.error('Failed to get plans:', error);
      return {
        success: false,
        errors: [{
          code: 500,
          description: 'Failed to load plans'
        }]
      };
    }
  },

  /**
   * Get configuration for specific business type
   */
  async getBusinessTypeConfig(businessType: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get<any>(API_ENDPOINTS.LANDING.BUSINESS_TYPE_CONFIG(businessType));
    } catch (error) {
      console.error('Failed to get business type config:', error);
      return {
        success: false,
        errors: [{
          code: 500,
          description: 'Failed to load business type configuration'
        }]
      };
    }
  },

  /**
   * Get features for specific business type
   */
  async getFeaturesForBusiness(businessType: string): Promise<ApiResponse<Feature[]>> {
    try {
      return await apiClient.get<Feature[]>(API_ENDPOINTS.LANDING.FEATURES_FOR_BUSINESS(businessType));
    } catch (error) {
      console.error('Failed to get features for business:', error);
      return {
        success: false,
        errors: [{
          code: 500,
          description: 'Failed to load features for business type'
        }]
      };
    }
  }
};

export const authService = {
  async registerBrand(data: CreateBrandRequest): Promise<ApiResponse<BrandRegistrationResponse>> {
    return apiClient.registerBrand(data);
  },

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.login(data);
  },

  async loginAdmin(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.loginAdmin(data);
  },

  async loginClient(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.loginClient(data);
  }
};

export const apiClient = new ApiClient();
export default apiClient;
