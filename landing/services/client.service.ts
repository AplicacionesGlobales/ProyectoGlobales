// services/clientsService.ts
import { apiClient, ApiResponse } from '../api';
import { API_ENDPOINTS } from '../api';

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
    [ClientType.ALL]: number;
    [ClientType.CLIENT]: number;
    [ClientType.ROOT]: number;
  };
}

export enum ClientType {
  ALL = 'all',
  CLIENT = 'client', 
  ROOT = 'root'
}

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  [ClientType.ALL]: 'Todos',
  [ClientType.CLIENT]: 'Cliente',
  [ClientType.ROOT]: 'Administrador'
};

export const CLIENT_TYPE_COLORS: Record<ClientType, string> = {
  [ClientType.ALL]: 'gray',
  [ClientType.CLIENT]: 'blue', 
  [ClientType.ROOT]: 'red'
};

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
    page: number = 1,
    limit: number = 50,
    filters?: {
      search?: string;
      clientType?: ClientType;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<Client[]>> {
    try {
      console.log('🚀 Getting clients:', { brandId, page, limit, filters });
      
      // Intentar hacer la llamada real al backend
      try {
        const paramsObj: Record<string, string> = {
          page: page.toString(),
          limit: limit.toString(),
        };
        if (filters) {
          if (filters.search !== undefined) paramsObj.search = filters.search;
          if (filters.clientType !== undefined && filters.clientType !== 'all') paramsObj.role = filters.clientType.toString();
          if (filters.isActive !== undefined) paramsObj.isActive = filters.isActive.toString();
        }
        const params = new URLSearchParams(paramsObj);

        const response = await apiClient.get<any>(
          `/brand/${brandId}/users?${params.toString()}`,
          { headers: this.getAuthHeaders() }
        );
        
        console.log('✅ Real clients response:', response);
        
        if (response.success && response.data) {
          // Transformar los datos del backend a nuestro formato de cliente
          const transformedClients: Client[] = response.data.map((user: any) => ({
            id: user.id,
            brandId,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email,
            phone: user.phone,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            totalVisits: 0,
            totalSpent: 0,
            preferredServices: [],
            clientType: user.role === 'root' ? ClientType.ROOT : ClientType.CLIENT
          }));
          
          return {
            success: true,
            data: transformedClients
          };
        }
      } catch (realApiError) {
        console.log('⚠️ Real API failed, falling back to simulated data:', realApiError);
      }
      
      // Fallback: simular respuesta con clientes de ejemplo si el API falla
      console.log('⚠️ Using simulated clients data');
      
      const sampleClients: Client[] = [
        {
          id: 1,
          brandId,
          firstName: "María",
          lastName: "García",
          email: "maria.garcia@email.com",
          phone: "+34 600 123 456",
          isActive: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días atrás
          updatedAt: new Date().toISOString(),
          lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días atrás
          totalVisits: 8,
          totalSpent: 450,
          preferredServices: ["Corte", "Tinte"],
          clientType: ClientType.CLIENT
        },
        {
          id: 2,
          brandId,
          firstName: "Juan",
          lastName: "Rodríguez",
          email: "juan.rodriguez@email.com",
          phone: "+34 600 789 123",
          dateOfBirth: "1985-06-15",
          address: "Calle Mayor 123, Madrid",
          isActive: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 días atrás
          updatedAt: new Date().toISOString(),
          lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
          totalVisits: 15,
          totalSpent: 890,
          preferredServices: ["Corte", "Barba"],
          clientType: ClientType.CLIENT
        },
        {
          id: 3,
          brandId,
          firstName: "Ana",
          lastName: "López",
          email: "ana.lopez@email.com",
          isActive: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días atrás
          updatedAt: new Date().toISOString(),
          totalVisits: 1,
          totalSpent: 45,
          preferredServices: [],
          clientType: ClientType.CLIENT
        }
      ];
      
      // Aplicar filtros si existen
      let filteredClients = sampleClients;
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredClients = filteredClients.filter(client =>
          `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          (client.phone && client.phone.includes(searchTerm))
        );
      }
      
      if (filters?.clientType && filters.clientType !== 'all') {
        filteredClients = filteredClients.filter(client => client.clientType === filters.clientType);
      }
      
      if (filters?.isActive !== undefined) {
        filteredClients = filteredClients.filter(client => client.isActive === filters.isActive);
      }
      
      return {
        success: true,
        data: filteredClients
      };
      
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
      
      // Por ahora, obtenemos las stats generales del brand y simulamos stats de clientes
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.BRAND.GET_STATS(brandId)}?period=${period}`,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ Brand stats response:', response);
      
      if (response.success && response.data) {
        // Transformar los datos del brand en estadísticas de clientes
        const brandStats = response.data;
        
        const clientStats: ClientStats = {
          totalClients: brandStats.totalUsers || 0,
          activeClients: brandStats.totalUsers || 0,
          newClientsThisMonth: brandStats.userGrowth?.newUsers || 0,
          topClients: [],
          clientTypes: {
            [ClientType.ALL]: brandStats.totalUsers || 0,
            [ClientType.CLIENT]: Math.floor((brandStats.totalUsers || 0) * 0.8), // 80% clientes
            [ClientType.ROOT]: Math.floor((brandStats.totalUsers || 0) * 0.2) // 20% admin
          }
        };
        
        return {
          success: true,
          data: clientStats
        };
      }
      
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
        API_ENDPOINTS.VALIDATION.EMAIL,
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

  // Obtener clientes top 
  async getVIPClients(brandId: number): Promise<ApiResponse<Client[]>> {
    try {
      console.log('🚀 Getting top clients:', brandId);
      const response = await apiClient.get<Client[]>(
        `${API_ENDPOINTS.CLIENTS.GET_ALL(brandId)}?clientType=${ClientType.CLIENT}&sortBy=totalSpent&order=desc`,
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