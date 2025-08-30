// hooks/use-search.ts
import { useState, useEffect, useMemo, useCallback } from 'react'

export interface SearchField {
  key: string
  label: string
  type?: 'text' | 'number' | 'email'
  placeholder?: string
}

export interface SearchFilter {
  field: string
  value: string
  label?: string
}

interface UseSearchProps {
  data: any[]
  searchFields: SearchField[]
  debounceMs?: number
  initialFilters?: SearchFilter[]
  onSearch?: (term: string, filters: SearchFilter[]) => void
}

export function useSearch<T>({
  data,
  searchFields,
  debounceMs = 300,
  initialFilters = [],
  onSearch
}: UseSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<SearchFilter[]>(initialFilters)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])

  // Call onSearch when debounced term or filters change
  useEffect(() => {
    onSearch?.(debouncedSearchTerm, filters)
  }, [debouncedSearchTerm, filters, onSearch])

  // Get nested value from object
  const getNestedValue = useCallback((obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }, [])

  // Filter data locally
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search term
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase()
      result = result.filter(item => {
        return searchFields.some(field => {
          const value = getNestedValue(item, field.key)
          return value && String(value).toLowerCase().includes(term)
        })
      })
    }

    // Apply additional filters
    if (filters.length > 0) {
      result = result.filter(item => {
        return filters.every(filter => {
          const value = getNestedValue(item, filter.field)
          if (filter.value === '') return true // Empty filter means no filtering
          
          if (typeof value === 'string') {
            return value.toLowerCase().includes(filter.value.toLowerCase())
          }
          
          return String(value) === filter.value
        })
      })
    }

    return result
  }, [data, debouncedSearchTerm, filters, searchFields, getNestedValue])

  // Search actions
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleFiltersChange = useCallback((newFilters: SearchFilter[]) => {
    setFilters(newFilters)
  }, [])

  const handleAddFilter = useCallback((field: string, value: string, label?: string) => {
    const existingIndex = filters.findIndex(f => f.field === field)
    const newFilter: SearchFilter = { field, value, label }
    
    if (existingIndex >= 0) {
      // Replace existing filter
      const newFilters = [...filters]
      newFilters[existingIndex] = newFilter
      setFilters(newFilters)
    } else {
      // Add new filter
      setFilters(prev => [...prev, newFilter])
    }
  }, [filters])

  const handleRemoveFilter = useCallback((field: string) => {
    setFilters(prev => prev.filter(f => f.field !== field))
  }, [])

  const handleClearAll = useCallback(() => {
    setSearchTerm('')
    setFilters([])
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters([])
  }, [])

  return {
    // State
    searchTerm,
    debouncedSearchTerm,
    filters,
    filteredData,
    
    // Actions
    handleSearchChange,
    handleFiltersChange,
    handleAddFilter,
    handleRemoveFilter,
    handleClearAll,
    handleClearSearch,
    handleClearFilters,
    
    // Utilities
    getNestedValue,
    hasActiveSearch: Boolean(debouncedSearchTerm || filters.length > 0)
  }
}

// Hook para búsqueda avanzada con múltiples campos
interface UseAdvancedSearchProps {
  searchFields: SearchField[]
  initialField?: string
}

export function useAdvancedSearch({
  searchFields,
  initialField
}: UseAdvancedSearchProps) {
  const [selectedField, setSelectedField] = useState(
    initialField || searchFields[0]?.key || ''
  )
  const [fieldSearchTerms, setFieldSearchTerms] = useState<Record<string, string>>({})

  const currentField = useMemo(() => {
    return searchFields.find(field => field.key === selectedField)
  }, [searchFields, selectedField])

  const handleFieldChange = useCallback((fieldKey: string) => {
    setSelectedField(fieldKey)
  }, [])

  const handleFieldSearchChange = useCallback((fieldKey: string, value: string) => {
    setFieldSearchTerms(prev => ({
      ...prev,
      [fieldKey]: value
    }))
  }, [])

  const handleClearField = useCallback((fieldKey: string) => {
    setFieldSearchTerms(prev => {
      const newTerms = { ...prev }
      delete newTerms[fieldKey]
      return newTerms
    })
  }, [])

  const handleClearAllFields = useCallback(() => {
    setFieldSearchTerms({})
  }, [])

  const getFieldSearchTerm = useCallback((fieldKey: string): string => {
    return fieldSearchTerms[fieldKey] || ''
  }, [fieldSearchTerms])

  const activeFields = useMemo(() => {
    return Object.entries(fieldSearchTerms).filter(([_, value]) => value.trim() !== '')
  }, [fieldSearchTerms])

  return {
    // State
    selectedField,
    currentField,
    fieldSearchTerms,
    activeFields,
    
    // Actions
    handleFieldChange,
    handleFieldSearchChange,
    handleClearField,
    handleClearAllFields,
    getFieldSearchTerm,
    
    // Utilities
    hasActiveFieldSearch: activeFields.length > 0
  }
}