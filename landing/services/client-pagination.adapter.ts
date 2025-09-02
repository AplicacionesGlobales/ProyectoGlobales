// landing/services/client-pagination.adapter.ts
import { PaginatedResponse } from '@/types/pagination.types'
import { Client, ClientsListResponse, clientsService } from './client.service'

export class ClientPaginationService {
  /**
   * Adaptador para convertir la respuesta del servicio a PaginatedResponse
   */
  static async getClientsPaginated(
    brandId: number,
    page: number = 1,
    limit: number = 25,
    searchTerm?: string
  ): Promise<PaginatedResponse<Client>> {
    try {
      const filters = {
        page,
        limit,
        ...(searchTerm && { search: searchTerm })
      }
      
      const response = await clientsService.getClients(brandId, filters)
      
      if (response.success && response.data) {
        const { clients, pagination } = response.data
        
        return {
          success: true,
          data: {
            items: clients,
            pagination: {
              currentPage: pagination.page,
              totalPages: pagination.totalPages,
              totalItems: pagination.total,
              itemsPerPage: pagination.limit,
              hasNextPage: pagination.page < pagination.totalPages,
              hasPrevPage: pagination.page > 1
            }
          }
        }
      } else {
        return {
          success: false,
          data: {
            items: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: limit,
              hasNextPage: false,
              hasPrevPage: false
            }
          },
          errors: response.errors?.map(err => ({
            code: String(err.code),
            message: err.message || err.description || 'Error desconocido'
          }))
        }
      }
    } catch (error: any) {
      console.error('Client pagination adapter error:', error)
      return {
        success: false,
        data: {
          items: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false
          }
        },
        errors: [{
          code: 'ADAPTER_ERROR',
          message: error.message || 'Error al cargar clientes'
        }]
      }
    }
  }
}

export { clientsService }
