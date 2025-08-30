// hooks/use-table.ts
import { useState, useMemo, useCallback } from 'react'

export interface TableColumn<T> {
  key: keyof T | string
  label: string
  render?: (value: any, item: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

export interface SortConfig {
  key: string | null
  direction: 'asc' | 'desc'
}

export interface PaginationConfig {
  currentPage: number
  itemsPerPage: number
  totalItems: number
}

interface UseTableProps<T> {
  data: T[]
  initialSort?: SortConfig
  itemsPerPage?: number
}

export function useTable<T extends { id: string | number }>({
  data,
  initialSort = { key: null, direction: 'asc' },
  itemsPerPage = 20
}: UseTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort)
  const [currentPage, setCurrentPage] = useState(1)

  // Función para obtener valores anidados
  const getNestedValue = useCallback((obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }, [])

  // Datos ordenados
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const aValue = typeof sortConfig.key === 'string' 
        ? getNestedValue(a, sortConfig.key)
        : (a as any)[sortConfig.key!]
      const bValue = typeof sortConfig.key === 'string'
        ? getNestedValue(b, sortConfig.key)
        : (b as any)[sortConfig.key!]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime()
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return sortConfig.direction === 'desc' ? -comparison : comparison
    })
  }, [data, sortConfig, getNestedValue])

  // Datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, currentPage, itemsPerPage])

  // Información de paginación
  const paginationInfo = useMemo((): PaginationConfig => ({
    currentPage,
    itemsPerPage,
    totalItems: sortedData.length
  }), [currentPage, itemsPerPage, sortedData.length])

  // Funciones de control
  const handleSort = useCallback((key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1) // Reset to first page when sorting
  }, [])

  const handlePageChange = useCallback((page: number) => {
    const totalPages = Math.ceil(sortedData.length / itemsPerPage)
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [sortedData.length, itemsPerPage])

  const resetPagination = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const resetSort = useCallback(() => {
    setSortConfig({ key: null, direction: 'asc' })
    setCurrentPage(1)
  }, [])

  return {
    // Data
    paginatedData,
    sortedData,
    totalPages: Math.ceil(sortedData.length / itemsPerPage),
    
    // State
    sortConfig,
    paginationInfo,
    
    // Actions
    handleSort,
    handlePageChange,
    resetPagination,
    resetSort,
    
    // Utilities
    getNestedValue
  }
}

// Hook para acciones de tabla
export interface TableAction<T> {
  type: 'view' | 'edit' | 'delete' | 'custom'
  label?: string
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?: 'outline' | 'destructive' | 'default'
  show?: (item: T) => boolean
}

interface UseTableActionsProps<T> {
  onView?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  customActions?: TableAction<T>[]
}

export function useTableActions<T>({
  onView,
  onEdit,
  onDelete,
  customActions = []
}: UseTableActionsProps<T>) {
  const defaultActions: TableAction<T>[] = useMemo(() => {
    const actions: TableAction<T>[] = []
    
    if (onView) {
      actions.push({
        type: 'view',
        label: 'Ver',
        onClick: onView,
        variant: 'outline'
      })
    }
    
    if (onEdit) {
      actions.push({
        type: 'edit',
        label: 'Editar',
        onClick: onEdit,
        variant: 'outline'
      })
    }
    
    if (onDelete) {
      actions.push({
        type: 'delete',
        label: 'Eliminar',
        onClick: onDelete,
        variant: 'destructive'
      })
    }
    
    return actions
  }, [onView, onEdit, onDelete])

  const allActions = useMemo(() => [
    ...defaultActions,
    ...customActions
  ], [defaultActions, customActions])

  return {
    actions: allActions
  }
}