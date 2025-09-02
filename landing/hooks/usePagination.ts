// landing/hooks/usePagination.ts
import { useState, useEffect, useCallback } from 'react'
import { UsePaginationProps, UsePaginationReturn } from '@/types/pagination.types'

export function usePagination<T>({
  initialPage = 1,
  initialItemsPerPage = 25,
  onFetch,
  dependencies = []
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  
  // Estados
  const [data, setData] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar datos
  const fetchData = useCallback(async (page: number, limit: number) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📊 Fetching pagination data:', { page, limit })
      
      const response = await onFetch(page, limit)
      
      if (response.success && response.data) {
        setData(response.data.items || [])
        
        if (response.data.pagination) {
          const { currentPage: respPage, totalPages: respTotal, totalItems: respItems, itemsPerPage: respLimit } = response.data.pagination
          
          // Solo actualizar si los valores han cambiado para evitar loops
          if (respPage !== currentPage) setCurrentPage(respPage)
          if (respTotal !== totalPages) setTotalPages(respTotal)
          if (respItems !== totalItems) setTotalItems(respItems)
          if (respLimit !== itemsPerPage) setItemsPerPage(respLimit)
        }
      } else {
        const errorMessage = response.errors?.[0]?.message || 'Error al cargar datos'
        console.error('❌ Pagination error:', errorMessage)
        setError(errorMessage)
        setData([])
      }
    } catch (err: any) {
      console.error('❌ Pagination fetch error:', err)
      setError(err.message || 'Error de conexión')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [onFetch]) // Removed state dependencies to prevent loops

  // Cargar datos iniciales y cuando cambien dependencias
  useEffect(() => {
    if (dependencies.some(dep => dep === null || dep === undefined)) {
      return // No cargar si alguna dependencia es null/undefined
    }
    fetchData(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage, ...dependencies]) // Removed fetchData from dependencies

  // Funciones de navegación
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
      fetchData(page, itemsPerPage)
    }
  }, [totalPages, currentPage, itemsPerPage, fetchData])

  const changeItemsPerPage = useCallback((newLimit: number) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1) // Resetear a página 1
    fetchData(1, newLimit)
  }, [fetchData])

  const refresh = useCallback(() => {
    fetchData(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage, fetchData])

  return {
    // Estado
    data,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    loading,
    error,
    
    // Acciones
    goToPage,
    changeItemsPerPage,
    refresh,
    setError
  }
}
