// services/clientsService.ts
import { apiClient } from '../app/api/client';
import { API_ENDPOINTS } from '../app/api/config';

// Interfaces para Clients
export interface Client {
  id: number;
  brandId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastVisit?: string;
  totalVisits: number;
  totalSpent: number;
  preferredServices: string[];
  clientType: ClientType;
}

export interface CreateClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ClientAppointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  serviceName: string;
  status: string;
  price: number;
  notes?: string;
}

export interface ClientHistory {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalSpent: number;
  averageSpent: number;
  lastVisit?: string;
  favoriteServices: Array<{
    serviceName: string;
    count: number;
  }>;
  appointmentHistory: ClientAppointment[];
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  topClients: Array<{
    id: number;
    name: string;
    totalSpent: number;
    totalVisits: number;
  }>;
  clientTypes: {
    [ClientType.NEW]: number;
    [ClientType.REGULAR]: number;
    [ClientType.VIP]: number;
  };
}

export enum ClientType {
  NEW = 'new',
  REGULAR = 'regular',
  VIP = 'vip'
}

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  [ClientType.NEW]: 'Nuevo',
  [ClientType.REGULAR]: 'Regular',
  [ClientType.VIP]: 'VIP'
};

export const CLIENT_TYPE_COLORS: Record<ClientType, string> = {
  [ClientType.NEW]: 'green',
  [ClientType.REGULAR]: 'blue',
  [ClientType.VIP]: 'purple'
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  errors?: Array<{
    code: string;
    description: string;
  }>;
}

class ClientsService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getAuthHeaders() {
    const token = this.getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // ==================== CRUD OPERATIONS ====================

  // Obtener todos los clientes
  async getClients(
    brandId: number,
    page: number = 1,
    limit: number = 50,
    filters?: {
      search?: string;
      clientType?: ClientType;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<Client[]>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      console.log('🚀 Getting clients:', { brandId, page, limit, filters });
      const response = await apiClient.get<Client[]>(
        `${API_ENDPOINTS.CLIENTS.GET_ALL(brandId)}?${params.toString()}`,
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
        API_ENDPOINTS.CLIENTS.GET_BY_ID(brandId, clientId),
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
        API_ENDPOINTS.CLIENTS.CREATE(brandId),
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
        API_ENDPOINTS.CLIENTS.UPDATE(brandId, clientId),
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
        API_ENDPOINTS.CLIENTS.DELETE(brandId, clientId),
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

  // ==================== CLIENT HISTORY & APPOINTMENTS ====================

  // Obtener citas de un cliente
  async getClientAppointments(
    brandId: number, 
    clientId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<ClientAppointment[]>> {
    try {
      console.log('🚀 Getting client appointments:', { brandId, clientId, page, limit });
      const response = await apiClient.get<ClientAppointment[]>(
        `${API_ENDPOINTS.CLIENTS.GET_APPOINTMENTS(brandId, clientId)}?page=${page}&limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Client appointments response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Client appointments error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'CLIENT_APPOINTMENTS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo citas del cliente'
          }
        ]
      };
    }
  }

  // Obtener historial completo del cliente
  async getClientHistory(brandId: number, clientId: number): Promise<ApiResponse<ClientHistory>> {
    try {
      console.log('🚀 Getting client history:', { brandId, clientId });
      const response = await apiClient.get<ClientHistory>(
        API_ENDPOINTS.CLIENTS.GET_HISTORY(brandId, clientId),
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Client history response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Client history error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'CLIENT_HISTORY_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo historial del cliente'
          }
        ]
      };
    }
  }

  // ==================== SEARCH & FILTERING ====================

  // Buscar clientes
  async searchClients(
    brandId: number,
    searchTerm: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<Client[]>> {
    try {
      console.log('🚀 Searching clients:', { brandId, searchTerm, page, limit });
      const response = await apiClient.get<Client[]>(
        `${API_ENDPOINTS.CLIENTS.SEARCH(brandId)}?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Client search response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Client search error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'CLIENT_SEARCH_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error buscando clientes'
          }
        ]
      };
    }
  }

  // ==================== STATISTICS ====================

  // Obtener estadísticas de clientes
  async getClientStats(brandId: number, period: string = '30d'): Promise<ApiResponse<ClientStats>> {
    try {
      console.log('🚀 Getting client stats:', { brandId, period });
      const response = await apiClient.get<ClientStats>(
        `${API_ENDPOINTS.BRAND.GET_STATS(brandId)}?type=clients&period=${period}`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Client stats response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Client stats error:', error);
      return {
        success: false,
        errors: [
          {
            code: 'CLIENT_STATS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo estadísticas de clientes'
          }
        ]
      };
    }
  }

  // ==================== UTILITIES ====================

  // Validar email de cliente
  async validateClientEmail(email: string, excludeClientId?: number): Promise<ApiResponse<{ isValid: boolean; exists: boolean }>> {
    try {
      console.log('🚀 Validating client email:', { email, excludeClientId });
      const response = await apiClient.post<{ isValid: boolean; exists: boolean }>(
        API_ENDPOINTS.VALIDATE.EMAIL,
        { email, excludeClientId },
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Email validation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Email validation error:', error);
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

  // Obtener clientes VIP
  async getVIPClients(brandId: number): Promise<ApiResponse<Client[]>> {
    try {
      console.log('🚀 Getting VIP clients:', brandId);
      const response = await apiClient.get<Client[]>(
        `${API_ENDPOINTS.CLIENTS.GET_ALL(brandId)}?clientType=${ClientType.VIP}&sortBy=totalSpent&order=desc`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ VIP clients response:', response);
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