// landing/types/pagination.types.ts

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    pagination: PaginationInfo
  }
  errors?: Array<{
    code: string
    message: string
  }>
}

export interface UsePaginationProps<T> {
  initialPage?: number
  initialItemsPerPage?: number
  onFetch: (page: number, limit: number) => Promise<PaginatedResponse<T>>
  dependencies?: any[] // Para refetch automático cuando cambien dependencias
}

export interface UsePaginationReturn<T> {
  // Estado
  data: T[]
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  loading: boolean
  error: string | null
  
  // Acciones
  goToPage: (page: number) => void
  changeItemsPerPage: (newLimit: number) => void
  refresh: () => void
  setError: (error: string | null) => void
}

export interface SmartPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  loading?: boolean
  showItemsPerPage?: boolean
  showResultsInfo?: boolean
  className?: string
}
