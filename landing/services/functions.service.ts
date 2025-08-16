// services/functionsService.ts
import { apiClient, ApiResponse } from '../app/api/client';
import { API_ENDPOINTS } from '../app/api/config';
import { FunctionCategory } from '../types/functions.types';

// Interfaces para Functions (Features como funciones del negocio)
export interface BrandFunction {
  id: number;
  featureId: number;
  key: string;
  title: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  category: FunctionCategory;
  duration: number; // en minutos
  isActive: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  activatedAt: string;
}

export interface CreateFunctionData {
  featureId: number;
  customPrice?: number;
  duration: number;
  isActive?: boolean;
  order?: number;
}

export interface UpdateFunctionData {
  title?: string;
  description?: string;
  currentPrice?: number;
  duration?: number;
  isActive?: boolean;
  order?: number;
}

export interface FunctionStats {
  totalFunctions: number;
  activeFunctions: number;
  mostPopular: {
    id: number;
    title: string;
    usage: number;
  } | null;
  averagePrice: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageDuration: number;
  monthlyBookings: number;
  bookingGrowth: number;
}

export interface AvailableFeature {
  id: number;
  key: string;
  title: string;
  description: string;
  basePrice: number;
  category: FunctionCategory;
  isPopular: boolean;
  isRecommended: boolean;
  businessTypes: string[];
  isActive: boolean;
}

class FunctionsService {
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

  // ==================== BRAND FUNCTIONS ====================

  // Obtener todas las funciones del brand
  async getBrandFunctions(brandId: number): Promise<ApiResponse<BrandFunction[]>> {
    try {
      console.log('🚀 Getting brand functions for:', brandId);
      const response = await apiClient.get<BrandFunction[]>(
        API_ENDPOINTS.SERVICES.GET_ALL(brandId),
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand functions response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand functions error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_FUNCTIONS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo funciones del brand'
          }
        ]
      };
    }
  }

  // Obtener función específica
  async getBrandFunction(brandId: number, functionId: number): Promise<ApiResponse<BrandFunction>> {
    try {
      console.log('🚀 Getting brand function:', { brandId, functionId });
      const response = await apiClient.get<BrandFunction>(
        API_ENDPOINTS.SERVICES.GET_BY_ID(brandId, functionId),
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand function response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand function error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_FUNCTION_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo función del brand'
          }
        ]
      };
    }
  }

  // Crear nueva función (activar feature)
  async createBrandFunction(brandId: number, data: CreateFunctionData): Promise<ApiResponse<BrandFunction>> {
    try {
      console.log('🚀 Creating brand function:', { brandId, data });
      const response = await apiClient.post<BrandFunction>(
        API_ENDPOINTS.SERVICES.CREATE(brandId),
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand function creation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand function creation error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_FUNCTION_CREATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error creando función del brand'
          }
        ]
      };
    }
  }

  // Actualizar función existente
  async updateBrandFunction(
    brandId: number, 
    functionId: number, 
    data: UpdateFunctionData
  ): Promise<ApiResponse<BrandFunction>> {
    try {
      console.log('🚀 Updating brand function:', { brandId, functionId, data });
      const response = await apiClient.put<BrandFunction>(
        API_ENDPOINTS.SERVICES.UPDATE(brandId, functionId),
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand function update response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand function update error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_FUNCTION_UPDATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando función del brand'
          }
        ]
      };
    }
  }

  // Eliminar/desactivar función
  async deleteBrandFunction(brandId: number, functionId: number): Promise<ApiResponse<void>> {
    try {
      console.log('🚀 Deleting brand function:', { brandId, functionId });
      const response = await apiClient.delete<void>(
        API_ENDPOINTS.SERVICES.DELETE(brandId, functionId),
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Brand function deletion response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Brand function deletion error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'BRAND_FUNCTION_DELETE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error eliminando función del brand'
          }
        ]
      };
    }
  }

  // ==================== AVAILABLE FEATURES ====================

  // Obtener features disponibles para activar
  async getAvailableFeatures(businessType?: string): Promise<ApiResponse<AvailableFeature[]>> {
    try {
      console.log('🚀 Getting available features for business type:', businessType);
      let endpoint = '/landing-data/features'; // Usar la API que ya tienes
      
      if (businessType) {
        endpoint = API_ENDPOINTS.LANDING.FEATURES_FOR_BUSINESS(businessType);
      }
      
      const response = await apiClient.get<AvailableFeature[]>(endpoint);
      console.log('✅ Available features response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Available features error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'AVAILABLE_FEATURES_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo features disponibles'
          }
        ]
      };
    }
  }

  // ==================== STATISTICS ====================

  // Obtener estadísticas de funciones
  async getFunctionStats(brandId: number, period: string = '30d'): Promise<ApiResponse<FunctionStats>> {
    try {
      console.log('🚀 Getting function stats:', { brandId, period });
      const response = await apiClient.get<FunctionStats>(
        `${API_ENDPOINTS.BRAND.GET_STATS(brandId)}?type=functions&period=${period}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Function stats response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Function stats error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'FUNCTION_STATS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo estadísticas de funciones'
          }
        ]
      };
    }
  }

  // ==================== BATCH OPERATIONS ====================

  // Actualizar múltiples funciones
  async updateMultipleFunctions(
    brandId: number, 
    updates: Array<{ functionId: number; data: UpdateFunctionData }>
  ): Promise<ApiResponse<BrandFunction[]>> {
    try {
      console.log('🚀 Updating multiple functions:', { brandId, updates });
      const response = await apiClient.put<BrandFunction[]>(
        `${API_ENDPOINTS.SERVICES.GET_ALL(brandId)}/batch`,
        { updates },
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Multiple functions update response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Multiple functions update error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'MULTIPLE_FUNCTIONS_UPDATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando múltiples funciones'
          }
        ]
      };
    }
  }

  // Reordenar funciones
  async reorderFunctions(
    brandId: number, 
    functionIds: number[]
  ): Promise<ApiResponse<BrandFunction[]>> {
    try {
      console.log('🚀 Reordering functions:', { brandId, functionIds });
      const response = await apiClient.put<BrandFunction[]>(
        `${API_ENDPOINTS.SERVICES.GET_ALL(brandId)}/reorder`,
        { functionIds },
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Functions reorder response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Functions reorder error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'FUNCTIONS_REORDER_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error reordenando funciones'
          }
        ]
      };
    }
  }

  // ==================== UTILITIES ====================

  // Validar precio de función
  async validateFunctionPrice(
    brandId: number, 
    featureId: number, 
    price: number
  ): Promise<ApiResponse<{ isValid: boolean; minPrice: number; maxPrice: number }>> {
    try {
      console.log('🚀 Validating function price:', { brandId, featureId, price });
      const response = await apiClient.post<{ isValid: boolean; minPrice: number; maxPrice: number }>(
        `${API_ENDPOINTS.SERVICES.GET_ALL(brandId)}/validate-price`,
        { featureId, price },
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Price validation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Price validation error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'PRICE_VALIDATION_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error validando precio'
          }
        ]
      };
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH);
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error' };
    }
  }

  // ==================== MISSING METHODS ====================

  // Crear función
  async createFunction(brandId: number, data: Partial<BrandFunction>): Promise<ApiResponse<BrandFunction>> {
    try {
      console.log('🚀 Creating function:', { brandId, data });
      const response = await apiClient.post<BrandFunction>(
        API_ENDPOINTS.SERVICES.CREATE(brandId),
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Function creation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Function creation error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'FUNCTION_CREATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error creando función'
          }
        ]
      };
    }
  }

  // Actualizar función
  async updateFunction(brandId: number, functionId: number, data: Partial<BrandFunction>): Promise<ApiResponse<BrandFunction>> {
    try {
      console.log('🚀 Updating function:', { brandId, functionId, data });
      const response = await apiClient.put<BrandFunction>(
        API_ENDPOINTS.SERVICES.UPDATE(brandId, functionId),
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Function update response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Function update error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'FUNCTION_UPDATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando función'
          }
        ]
      };
    }
  }

  // Eliminar función
  async deleteFunction(brandId: number, functionId: number): Promise<ApiResponse<void>> {
    try {
      console.log('🚀 Deleting function:', { brandId, functionId });
      const response = await apiClient.delete<void>(
        API_ENDPOINTS.SERVICES.DELETE(brandId, functionId),
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Function deletion response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Function deletion error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'FUNCTION_DELETE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error eliminando función'
          }
        ]
      };
    }
  }
}

export const functionsService = new FunctionsService();