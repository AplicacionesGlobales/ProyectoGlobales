// services/clients.service.ts
import { apiClient, ApiResponse } from '../api';
import { API_ENDPOINTS } from '../api/constants';

// Interfaces basadas en la API real
export interface Client {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  notes?: string;
  isActive: boolean;
  brandId: number;
  totalAppointments: number;
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  notes?: string;
  createAccess?: boolean;
  tempPassword?: string;
}

export interface ClientNote {
  id: number;
  clientId: number;
  brandId: number;
  note: string;
  isPrivate: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ClientActivity {
  id: number;
  type: string;
  description: string;
  createdAt: string;
}

export interface ClientsListResponse {
  clients: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ClientNotesResponse {
  notes: ClientNote[];
}

export interface ClientActivityResponse {
  activities: ClientActivity[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ClientsService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    if (token) {
      return { 'Authorization': `Bearer ${token}` };
    }
    return {};
  }

  // Obtener todos los clientes
  async getClients(brandId: number, filters: {
    page?: number;
    limit?: number;
    search?: string;
    active?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<ApiResponse<ClientsListResponse>> {
    try {
      console.log('🚀 Getting clients:', { brandId, filters });
      
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.active) params.append('active', filters.active);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const queryString = params.toString();
      const endpoint = API_ENDPOINTS.CLIENTS.GET_ALL(brandId) + (queryString ? `?${queryString}` : '');
      
      const response = await apiClient.get<ClientsListResponse>(
        endpoint,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Clients response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Clients error:', error);
      return {
        success: false,
        errors: [{
          code: 'CLIENTS_ERROR',
          description: 'Error obteniendo clientes'
        }]
      };
    }
  }

  // Obtener cliente por ID
  async getClient(brandId: number, clientId: number): Promise<ApiResponse<Client>> {
    try {
      console.log('🚀 Getting client:', { brandId, clientId });
      
      const response = await apiClient.get<Client>(
        API_ENDPOINTS.CLIENTS.GET_BY_ID(brandId, clientId),
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Client response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Client error:', error);
      return {
        success: false,
        errors: [{
          code: 'CLIENT_ERROR',
          description: 'Error obteniendo cliente'
        }]
      };
    }
  }

  // Crear nuevo cliente
  async createClient(brandId: number, data: CreateClientData): Promise<ApiResponse<Client>> {
    try {
      console.log('🚀 Creating client:', { brandId, data });
      
      const response = await apiClient.post<Client>(
        API_ENDPOINTS.CLIENTS.CREATE(brandId),
        data,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Client creation response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Client creation error:', error);
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.success === false && errorData.errors) {
          return {
            success: false,
            errors: errorData.errors
          };
        }
        
        if (errorData.message) {
          const messages = Array.isArray(errorData.message) ? errorData.message : [errorData.message];
          return {
            success: false,
            errors: messages.map((msg: string) => ({
              code: 'VALIDATION_ERROR',
              description: msg
            }))
          };
        }
      }
      
      return {
        success: false,
        errors: [{
          code: 'CLIENT_CREATE_ERROR',
          description: 'Error creando cliente'
        }]
      };
    }
  }

  // Obtener notas del cliente
  async getClientNotes(brandId: number, clientId: number): Promise<ApiResponse<ClientNotesResponse>> {
    try {
      console.log('🚀 Getting client notes:', { brandId, clientId });
      
      const response = await apiClient.get<ClientNotesResponse>(
        `/brands/${brandId}/clients/${clientId}/notes`,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Client notes response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Client notes error:', error);
      return {
        success: false,
        errors: [{
          code: 'CLIENT_NOTES_ERROR',
          description: 'Error obteniendo notas del cliente'
        }]
      };
    }
  }

  // Obtener actividad del cliente
  async getClientActivity(
    brandId: number, 
    clientId: number, 
    page: number = 1, 
    limit: number = 20
  ): Promise<ApiResponse<ClientActivityResponse>> {
    try {
      console.log('🚀 Getting client activity:', { brandId, clientId, page, limit });
      
      const response = await apiClient.get<ClientActivityResponse>(
        `/brands/${brandId}/clients/${clientId}/activity?page=${page}&limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Client activity response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Client activity error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'EMAIL_VALIDATION_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error validando email'
          }
        ]
      };
    }
  }

  // Obtener clientes recientes
  async getRecentClients(brandId: number, limit: number = 10): Promise<ApiResponse<Client[]>> {
    try {
      console.log('🚀 Getting recent clients:', { brandId, limit });
      const response = await apiClient.get<Client[]>(
        `${API_ENDPOINTS.CLIENTS.GET_ALL(brandId)}?sortBy=createdAt&order=desc&limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Recent clients response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Recent clients error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'RECENT_CLIENTS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo clientes recientes'
          }
        ]
      };
    }
  }

  // Obtener clientes top 
  async getVIPClients(brandId: number): Promise<ApiResponse<Client[]>> {
    try {
      console.log('🚀 Getting top clients:', brandId);
      const response = await apiClient.get<Client[]>(
        `${API_ENDPOINTS.CLIENTS.GET_ALL(brandId)}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Top clients response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ VIP clients error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'VIP_CLIENTS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo clientes VIP'
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
}

export const clientsService = new ClientsService();