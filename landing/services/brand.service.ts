// landing\services\brand.service.ts
import { apiClient, ApiResponse } from '../api';
import { API_ROUTES } from '../constants/api-routes';

// Interfaces para Brand
export interface BrandAdminData {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  isotopoUrl?: string;
  imagotipoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  businessType: {
    id: number;
    key: string;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
  };
  users: BrandUser[];
  features: BrandFeature[];
  currentPlan: BrandPlan;
  colorPalette: ColorPalette;
  recentPayments: Payment[];
  stats: BrandStats;
}

export interface BrandUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface BrandFeature {
  id: number;
  key: string;
  title: string;
  description: string;
  price: number;
  category: string;
  isRecommended: boolean;
  isPopular: boolean;
  isActive: boolean;
  activatedAt: string;
}

export interface BrandPlan {
  id: number;
  planId: number;
  planType: string;
  planName: string;
  planDescription: string;
  basePrice: number;
  currentPrice: number;
  billingPeriod: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  nextBillingDate?: string;
}

export interface ColorPalette {
  id: number;
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  tilopayReference?: string;
  createdAt: string;
  processedAt?: string;
}

export interface BrandStats {
  totalUsers: number;
  totalFeatures: number;
  activeFeatures: number;
  totalRevenue: number;
  monthlyRevenue: number;
  daysUntilNextBilling: number;
  isSubscriptionActive: boolean;
  lastActivity: string;
}

export interface UpdateBrandData {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  businessTypeId?: number;
  colorPalette?: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
  };
  selectedFeatureIds?: number[];
  logoImage?: string;
  isotopoImage?: string;
  imagotipoImage?: string;
}

export interface CreateBrandUserData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

class BrandService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Obtener información completa del brand
  async getBrandInfo(brandId: number): Promise<ApiResponse<BrandAdminData>> {
    try {
      console.log('🚀 Getting brand info for ID:', brandId);
      const response = await apiClient.get<BrandAdminData>(
        `/brand/${brandId}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand info response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand info error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_INFO_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo información del brand'
          }
        ]
      };
    }
  }

  // Actualizar información del brand
  async updateBrand(brandId: number, data: UpdateBrandData): Promise<ApiResponse<BrandAdminData>> {
    try {
      console.log('🚀 Updating brand:', { brandId, data });
      const response = await apiClient.put<BrandAdminData>(
        `/brand/${brandId}`,
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand update response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand update error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_UPDATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando el brand'
          }
        ]
      };
    }
  }

  // Obtener usuarios del brand
  async getBrandUsers(brandId: number, page: number = 1, limit: number = 10): Promise<ApiResponse<BrandUser[]>> {
    try {
      console.log('🚀 Getting brand users:', { brandId, page, limit });
      const response = await apiClient.get<BrandUser[]>(
        `/brand/${brandId}/users?page=${page}&limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand users response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand users error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_USERS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo usuarios del brand'
          }
        ]
      };
    }
  }

  // Crear usuario en el brand
  async createBrandUser(brandId: number, userData: CreateBrandUserData): Promise<ApiResponse<BrandUser>> {
    try {
      console.log('🚀 Creating brand user:', { brandId, userData });
      const response = await apiClient.post<BrandUser>(
        `/brand/${brandId}/users`,
        userData,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand user creation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand user creation error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_USER_CREATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error creando usuario del brand'
          }
        ]
      };
    }
  }

  // Actualizar features del brand
  async updateBrandFeatures(brandId: number, featureIds: number[]): Promise<ApiResponse<BrandAdminData>> {
    try {
      console.log('🚀 Updating brand features:', { brandId, featureIds });
      const response = await apiClient.put<BrandAdminData>(
        `/brand/${brandId}/features`,
        { featureIds },
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand features update response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand features update error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_FEATURES_UPDATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando features del brand'
          }
        ]
      };
    }
  }

  // Obtener información del plan
  async getBrandPlan(brandId: number): Promise<ApiResponse<BrandPlan>> {
    try {
      console.log('🚀 Getting brand plan:', brandId);
      const response = await apiClient.get<BrandPlan>(
        `/brand/${brandId}/plan`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand plan response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand plan error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_PLAN_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo plan del brand'
          }
        ]
      };
    }
  }

  // Obtener estadísticas del brand
  async getBrandStats(brandId: number, period: string = '30d'): Promise<ApiResponse<any>> {
    try {
      console.log('🚀 Getting brand stats:', { brandId, period });
      const response = await apiClient.get<any>(
        `/brand/${brandId}/stats?period=${period}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand stats response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand stats error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_STATS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo estadísticas del brand'
          }
        ]
      };
    }
  }

  // Obtener historial de pagos
  async getBrandPayments(
    brandId: number, 
    page: number = 1, 
    limit: number = 10, 
    status?: string
  ): Promise<ApiResponse<Payment[]>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });
      
      console.log('🚀 Getting brand payments:', { brandId, page, limit, status });
      const response = await apiClient.get<Payment[]>(
        `/brand/${brandId}/payments?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand payments response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand payments error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_PAYMENTS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo pagos del brand'
          }
        ]
      };
    }
  }

  // Health check específico para brand endpoints
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await apiClient.get('/health');
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error' };
    }
  }
}

export const brandService = new BrandService();