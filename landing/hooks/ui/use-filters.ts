// hooks/use-filters.ts
import { useState, useMemo, useCallback, useEffect } from 'react'

export interface TagFilter {
  id: string
  label: string
  color?: string
  count?: number
}

export interface DateFilter {
  field: string
  label: string
  from?: string
  to?: string
}

export interface CustomFilter {
  field: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'boolean'
  options?: { value: string; label: string; count?: number }[]
  value?: any
}

export interface ActiveFilter {
  type: 'tag' | 'date' | 'custom'
  field: string
  value: any
  label: string
}

interface UseFiltersProps {
  data: any[]
  tagFilters?: TagFilter[]
  dateFilters?: DateFilter[]
  customFilters?: CustomFilter[]
  initialFilters?: ActiveFilter[]
  onFiltersChange?: (filters: ActiveFilter[], filteredData: any[]) => void
}

export function useFilters<T>({
  data,
  tagFilters = [],
  dateFilters = [],
  customFilters = [],
  initialFilters = [],
  onFiltersChange
}: UseFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(initialFilters)
  const [dateRanges, setDateRanges] = useState<Record<string, { from: string; to: string }>>({})

  // Get nested value from object
  const getNestedValue = useCallback((obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }, [])

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (activeFilters.length === 0) return data

    return data.filter(item => {
      return activeFilters.every(filter => {
        const fieldValue = getNestedValue(item, filter.field)

        switch (filter.type) {
          case 'tag':
            // Tag filters usually match exact values or check if item has the tag
            return fieldValue === filter.value || 
                   (Array.isArray(fieldValue) && fieldValue.includes(filter.value))

          case 'date':
            if (!fieldValue) return false
            const itemDate = new Date(fieldValue)
            const { from, to } = filter.value
            
            if (from && to) {
              return itemDate >= new Date(from) && itemDate <= new Date(to)
            } else if (from) {
              return itemDate >= new Date(from)
            } else if (to) {
              return itemDate <= new Date(to)
            }
            return true

          case 'custom':
            const customFilterConfig = customFilters.find(cf => cf.field === filter.field)
            if (!customFilterConfig) return true

            switch (customFilterConfig.type) {
              case 'select':
                return fieldValue === filter.value

              case 'multiselect':
                if (!Array.isArray(filter.value)) return true
                if (Array.isArray(fieldValue)) {
                  return filter.value.some((v: string) => fieldValue.includes(v))
                }
                return filter.value.includes(fieldValue)

              case 'range':
                const numValue = Number(fieldValue)
                const { min, max } = filter.value
                if (min && max) {
                  return numValue >= Number(min) && numValue <= Number(max)
                } else if (min) {
                  return numValue >= Number(min)
                } else if (max) {
                  return numValue <= Number(max)
                }
                return true

              case 'boolean':
                return String(fieldValue) === filter.value

              default:
                return true
            }

          default:
            return true
        }
      })
    })
  }, [data, activeFilters, customFilters, getNestedValue])

  // Call onFiltersChange when filters or filtered data changes
  useEffect(() => {
    onFiltersChange?.(activeFilters, filteredData)
  }, [activeFilters, filteredData, onFiltersChange])

  // Tag filter actions
  const toggleTagFilter = useCallback((tag: TagFilter) => {
    setActiveFilters(prev => {
      const existingIndex = prev.findIndex(
        f => f.type === 'tag' && f.field === tag.id
      )

      if (existingIndex >= 0) {
        return prev.filter((_, index) => index !== existingIndex)
      } else {
        const newFilter: ActiveFilter = {
          type: 'tag',
          field: tag.id,
          value: tag.id,
          label: tag.label
        }
        return [...prev, newFilter]
      }
    })
  }, [])

  const isTagActive = useCallback((tagId: string): boolean => {
    return activeFilters.some(f => f.type === 'tag' && f.field === tagId)
  }, [activeFilters])

  // Date filter actions
  const updateDateFilter = useCallback((dateFilter: DateFilter, field: 'from' | 'to', value: string) => {
    const currentRange = dateRanges[dateFilter.field] || { from: '', to: '' }
    const newRange = { ...currentRange, [field]: value }
    
    setDateRanges(prev => ({
      ...prev,
      [dateFilter.field]: newRange
    }))

    setActiveFilters(prev => {
      // Remove existing date filter for this field
      const withoutThisDateFilter = prev.filter(
        f => !(f.type === 'date' && f.field === dateFilter.field)
      )

      // Add new date filter if both dates are set or at least one date is set
      if (newRange.from || newRange.to) {
        const newFilter: ActiveFilter = {
          type: 'date',
          field: dateFilter.field,
          value: newRange,
          label: `${dateFilter.label}: ${newRange.from || '...'} - ${newRange.to || '...'}`
        }
        return [...withoutThisDateFilter, newFilter]
      }

      return withoutThisDateFilter
    })
  }, [dateRanges])

  const getDateRange = useCallback((field: string) => {
    return dateRanges[field] || { from: '', to: '' }
  }, [dateRanges])

  // Custom filter actions
  const updateCustomFilter = useCallback((customFilter: CustomFilter, value: any) => {
    setActiveFilters(prev => {
      // Remove existing custom filter for this field
      const withoutThisCustomFilter = prev.filter(
        f => !(f.type === 'custom' && f.field === customFilter.field)
      )

      // Add new custom filter if value is not empty
      if (value !== null && value !== undefined && value !== '' && 
          (!Array.isArray(value) || value.length > 0)) {
        
        let displayValue = value
        if (customFilter.type === 'multiselect' && Array.isArray(value)) {
          displayValue = value.map(v => 
            customFilter.options?.find(opt => opt.value === v)?.label || v
          ).join(', ')
        } else if (customFilter.type === 'select') {
          displayValue = customFilter.options?.find(opt => opt.value === value)?.label || value
        } else if (customFilter.type === 'range') {
          const { min, max } = value
          displayValue = `${min || '...'} - ${max || '...'}`
        } else if (customFilter.type === 'boolean') {
          displayValue = value === 'true' ? 'Sí' : 'No'
        }

        const newFilter: ActiveFilter = {
          type: 'custom',
          field: customFilter.field,
          value: value,
          label: `${customFilter.label}: ${displayValue}`
        }
        return [...withoutThisCustomFilter, newFilter]
      }

      return withoutThisCustomFilter
    })
  }, [])

  const getCustomFilterValue = useCallback((field: string): any => {
    const filter = activeFilters.find(f => f.type === 'custom' && f.field === field)
    return filter?.value
  }, [activeFilters])

  // General filter actions
  const removeFilter = useCallback((index: number) => {
    setActiveFilters(prev => {
      const newFilters = prev.filter((_, i) => i !== index)
      
      // Also clean up date ranges if removing a date filter
      const removedFilter = prev[index]
      if (removedFilter?.type === 'date') {
        setDateRanges(prevRanges => {
          const newRanges = { ...prevRanges }
          delete newRanges[removedFilter.field]
          return newRanges
        })
      }
      
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setActiveFilters([])
    setDateRanges({})
  }, [])

  const clearFiltersByType = useCallback((type: ActiveFilter['type']) => {
    setActiveFilters(prev => {
      const newFilters = prev.filter(f => f.type !== type)
      
      // Clean up date ranges if clearing date filters
      if (type === 'date') {
        setDateRanges({})
      }
      
      return newFilters
    })
  }, [])

  // Get filters by type
  const getFiltersByType = useCallback((type: ActiveFilter['type']) => {
    return activeFilters.filter(f => f.type === type)
  }, [activeFilters])

  // Statistics
  const filterStats = useMemo(() => ({
    totalFilters: activeFilters.length,
    tagFilters: activeFilters.filter(f => f.type === 'tag').length,
    dateFilters: activeFilters.filter(f => f.type === 'date').length,
    customFilters: activeFilters.filter(f => f.type === 'custom').length,
    originalDataCount: data.length,
    filteredDataCount: filteredData.length,
    filteredPercentage: data.length > 0 ? Math.round((filteredData.length / data.length) * 100) : 100
  }), [activeFilters, data.length, filteredData.length])

  return {
    // Data
    filteredData,
    activeFilters,
    
    // Tag filters
    toggleTagFilter,
    isTagActive,
    
    // Date filters
    updateDateFilter,
    getDateRange,
    
    // Custom filters
    updateCustomFilter,
    getCustomFilterValue,
    
    // General actions
    removeFilter,
    clearAllFilters,
    clearFiltersByType,
    getFiltersByType,
    
    // Statistics
    filterStats,
    
    // Utilities
    getNestedValue,
    hasActiveFilters: activeFilters.length > 0
  }
}

// Hook específico para filtros de fecha
interface UseDateFiltersProps {
  dateFilters: DateFilter[]
  onFiltersChange?: (ranges: Record<string, { from: string; to: string }>) => void
}

export function useDateFilters({ dateFilters, onFiltersChange }: UseDateFiltersProps) {
  const [dateRanges, setDateRanges] = useState<Record<string, { from: string; to: string }>>({})

  const updateDateRange = useCallback((field: string, type: 'from' | 'to', value: string) => {
    setDateRanges(prev => {
      const newRanges = {
        ...prev,
        [field]: {
          ...prev[field],
          [type]: value
        }
      }
      onFiltersChange?.(newRanges)
      return newRanges
    })
  }, [onFiltersChange])

  const clearDateRange = useCallback((field: string) => {
    setDateRanges(prev => {
      const newRanges = { ...prev }
      delete newRanges[field]
      onFiltersChange?.(newRanges)
      return newRanges
    })
  }, [onFiltersChange])

  const clearAllDateRanges = useCallback(() => {
    setDateRanges({})
    onFiltersChange?.({})
  }, [onFiltersChange])

  const getDateRange = useCallback((field: string) => {
    return dateRanges[field] || { from: '', to: '' }
  }, [dateRanges])

  const hasActiveDateFilters = useMemo(() => {
    return Object.values(dateRanges).some(range => range.from || range.to)
  }, [dateRanges])

  const activeDateFilters = useMemo(() => {
    return Object.entries(dateRanges).filter(([_, range]) => range.from || range.to)
  }, [dateRanges])

  return {
    dateRanges,
    updateDateRange,
    clearDateRange,
    clearAllDateRanges,
    getDateRange,
    hasActiveDateFilters,
    activeDateFilters
  }
}

// Hook para filtros de tags
interface UseTagFiltersProps {
  tagFilters: TagFilter[]
  onFiltersChange?: (activeTags: string[]) => void
}

export function useTagFilters({ tagFilters, onFiltersChange }: UseTagFiltersProps) {
  const [activeTags, setActiveTags] = useState<string[]>([])

  const toggleTag = useCallback((tagId: string) => {
    setActiveTags(prev => {
      const newTags = prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
      
      onFiltersChange?.(newTags)
      return newTags
    })
  }, [onFiltersChange])

  const addTag = useCallback((tagId: string) => {
    setActiveTags(prev => {
      if (prev.includes(tagId)) return prev
      const newTags = [...prev, tagId]
      onFiltersChange?.(newTags)
      return newTags
    })
  }, [onFiltersChange])

  const removeTag = useCallback((tagId: string) => {
    setActiveTags(prev => {
      const newTags = prev.filter(id => id !== tagId)
      onFiltersChange?.(newTags)
      return newTags
    })
  }, [onFiltersChange])

  const clearAllTags = useCallback(() => {
    setActiveTags([])
    onFiltersChange?.([])
  }, [onFiltersChange])

  const isTagActive = useCallback((tagId: string) => {
    return activeTags.includes(tagId)
  }, [activeTags])

  const activeTagsData = useMemo(() => {
    return tagFilters.filter(tag => activeTags.includes(tag.id))
  }, [tagFilters, activeTags])

  return {
    activeTags,
    activeTagsData,
    toggleTag,
    addTag,
    removeTag,
    clearAllTags,
    isTagActive,
    hasActiveTags: activeTags.length > 0
  }
}