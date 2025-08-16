// landing\services\auth.service.ts
import { apiClient } from '../src/api';
import { API_ROUTES } from '../constants/api-routes';

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
  brandPhone?: string;
  
  // Business details - ONLY IDs
  businessTypeId: number;
  selectedFeatureIds: number[];
  
  // Customization
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
  
  // Plan information - ONLY NUMERIC ID
  planId: number;
  planBillingPeriod: 'monthly' | 'annual';
  totalPrice: number;
  
  // Metadata
  registrationDate: string;
  source: string;
}

export interface BrandRegistrationResponse {
  success: boolean;
  data?: {
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
      phone?: string;
      businessType?: string;
      features?: string[];
      logoUrl?: string;
      isotopoUrl?: string;
      imagotipoUrl?: string;
    };
    colorPalette: {
      id: number;
      primary: string;
      secondary: string;
      accent: string;
      neutral: string;
      success: string;
    };
    plan: {
      id: number;
      type: string;
      price: number;
      features: string[];
      billingPeriod: string;
    };
    payment?: {
      status: string;
      tilopayReference?: string;
      processedAt?: string;
    };
    token: string;
    refreshToken?: string;
    rememberMe?: boolean;
  };
  errors?: Array<{
    code: string;
    description: string;
  }>;
}

class AuthService {
  async registerBrand(data: BrandRegistrationData): Promise<BrandRegistrationResponse> {
    try {
      console.log('🚀 Sending registration data:', JSON.stringify(data, null, 2));
      
      const response = await apiClient.post<BrandRegistrationResponse>(
        API_ROUTES.AUTH.REGISTER_BRAND,
        data
      );
      
      console.log('✅ Registration response:', response);
      
      // El response del apiClient ya es del tipo ApiResponse<BrandRegistrationResponse>
      // Si la respuesta es exitosa, debería tener success: true y data
      if (response.success && response.data) {
        return response as BrandRegistrationResponse;
      } else {
        return {
          success: false,
          errors: response.errors?.map(error => ({
            code: String(error.code),
            description: error.description ?? 'No description provided'
          })) || [{ code: 'NO_DATA', description: 'No data received' }]
        };
      }
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      return {
        success: false,
        errors: [
          {
            code: 'REGISTRATION_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error durante el registro'
          }
        ]
      };
    }
  }

  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await apiClient.get('/health');
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error' };
    }
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<BrandRegistrationResponse> {
    try {
      console.log('🚀 Sending login data:', { email, rememberMe });
      
      const response = await apiClient.post<BrandRegistrationResponse>(
        '/auth/login',
        {
          email,
          password,
          rememberMe
        }
      );
      
      console.log('✅ Login response:', response);
      
      if (response.success && response.data) {
        return response as BrandRegistrationResponse;
      } else {
        return {
          success: false,
          errors: response.errors?.map(error => ({
            code: String(error.code),
            description: error.description ?? 'No description provided'
          })) || [{ code: 'LOGIN_ERROR', description: 'Error en el login' }]
        };
      }
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      return {
        success: false,
        errors: [
          {
            code: 'LOGIN_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error durante el login'
          }
        ]
      };
    }
  }
}

export const authService = new AuthService();
