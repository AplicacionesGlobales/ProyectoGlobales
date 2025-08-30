// services/clients.service.ts
import { apiClient, ApiResponse } from '../api';

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

export interface UpdateClientData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  notes?: string;
  isActive?: boolean;
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

export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: string;
  sortBy?: 'createdAt' | 'firstName' | 'email' | 'lastVisit';
  sortOrder?: 'asc' | 'desc';
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

  // ==================== CRUD OPERATIONS ====================
  
  // Obtener todos los clientes
  async getClients(
    brandId: number,
    filters: ClientFilters = {}
  ): Promise<ApiResponse<ClientsListResponse>> {
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
      const endpoint = `/brands/${brandId}/clients${queryString ? `?${queryString}` : ''}`;
      
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
        errors: [
          {
            code: 'CLIENTS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo clientes'
          }
        ]
      };
    }
  }

  // Obtener cliente por ID
  async getClient(brandId: number, clientId: number): Promise<ApiResponse<Client>> {
    try {
      console.log('🚀 Getting client:', { brandId, clientId });
      
      const response = await apiClient.get<Client>(
        `/brands/${brandId}/clients/${clientId}`,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Client response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Client error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'CLIENT_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo cliente'
          }
        ]
      };
    }
  }

  // Crear nuevo cliente
  async createClient(brandId: number, data: CreateClientData): Promise<ApiResponse<Client>> {
    try {
      console.log('🚀 Creating client:', { brandId, data });
      
      const response = await apiClient.post<Client>(
        `/brands/${brandId}/clients`,
        data,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Client creation response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Client creation error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'CLIENT_CREATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error creando cliente'
          }
        ]
      };
    }
  }

  // Actualizar cliente
  async updateClient(
    brandId: number, 
    clientId: number, 
    data: UpdateClientData
  ): Promise<ApiResponse<Client>> {
    try {
      console.log('🚀 Updating client:', { brandId, clientId, data });
      
      const response = await apiClient.put<Client>(
        `/brands/${brandId}/clients/${clientId}`,
        data,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Client update response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Client update error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'CLIENT_UPDATE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando cliente'
          }
        ]
      };
    }
  }

  // Eliminar cliente
  async deleteClient(brandId: number, clientId: number): Promise<ApiResponse<void>> {
    try {
      console.log('🚀 Deleting client:', { brandId, clientId });
      
      const response = await apiClient.delete<void>(
        `/brands/${brandId}/clients/${clientId}`,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Client deletion response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Client deletion error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'CLIENT_DELETE_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error eliminando cliente'
          }
        ]
      };
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await apiClient.get('/health');
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error' };
    }
  }
}

export const clientsService = new ClientsService();