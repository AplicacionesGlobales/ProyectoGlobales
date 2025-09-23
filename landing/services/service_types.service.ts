import { apiClient, ApiResponse } from '../api';
import { API_ENDPOINTS } from '../api/constants';

export interface ServiceType {
  id: number;
  brandId: number;
  name: string;
  description: string | null;
  duration: number;
  price: number | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

class ServiceTypesService {
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

  // Obtener los tipos de servicios por brand
  async getServiceTypesByBrand(brandId: number): Promise<ApiResponse<ServiceType[]>> {
    try {
      const response = await apiClient.get<ServiceType[]>(
        API_ENDPOINTS.SERVICES_TYPES.GET(brandId),
        { headers: this.getAuthHeaders() }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        errors: [
          {
            code: 'SERVICE_TYPES_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo los tipos de servicios del brand'
          }
        ]
      };
    }
  }
}

export const serviceTypesService = new ServiceTypesService();