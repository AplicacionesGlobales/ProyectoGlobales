import { useState, useEffect, useCallback } from "react"
import { serviceTypesService, ServiceType } from "@/services/service_types.service"

interface UseServiceTypesReturn {
  // State
  serviceTypes: ServiceType[]
  filteredServiceTypes: ServiceType[]
  brandId: number | null
  loading: boolean
  error: string | null
  searchTerm: string
  
  // Actions
  setSearchTerm: (term: string) => void
  refreshServiceTypes: () => Promise<void>
  
  // Utility functions
  formatDuration: (duration: number) => string
  formatPrice: (price: number | null) => string
}

interface UseServiceTypesOptions {
  autoFetch?: boolean
  enableSearch?: boolean
}

export const useServiceTypes = ({
  autoFetch = true,
  enableSearch = true
}: UseServiceTypesOptions = {}): UseServiceTypesReturn => {
  
  // State
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [filteredServiceTypes, setFilteredServiceTypes] = useState<ServiceType[]>([])
  const [brandId, setBrandId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Inicialización del brandId
  useEffect(() => {
    const brandData = localStorage.getItem('brand_data')
    if (brandData) {
      const brand = JSON.parse(brandData)
      setBrandId(brand.id)
    }
  }, [])

  // Inicializar datos cuando brandId esté disponible
  useEffect(() => {
    if (brandId && autoFetch) {
      fetchServiceTypes()
    }
  }, [brandId, autoFetch])

  // Filtrar tipos de servicios cuando cambie el término de búsqueda
  useEffect(() => {
    if (!enableSearch) {
      setFilteredServiceTypes(serviceTypes)
      return
    }

    if (!searchTerm.trim()) {
      setFilteredServiceTypes(serviceTypes)
    } else {
      const filtered = serviceTypes.filter(serviceType =>
        serviceType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (serviceType.description && serviceType.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredServiceTypes(filtered)
    }
  }, [serviceTypes, searchTerm, enableSearch])

  // Fetch function
  const fetchServiceTypes = useCallback(async () => {
    if (!brandId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await serviceTypesService.getServiceTypesByBrand(brandId)
      
      if (response.data) {
        setServiceTypes(response.data)
        setFilteredServiceTypes(response.data)
      } else {
        setServiceTypes([])
        setFilteredServiceTypes([])
      }
    } catch (error) {
      console.error('Error fetching service types:', error)
      setError('Error al cargar los tipos de servicios')
      setServiceTypes([])
      setFilteredServiceTypes([])
    } finally {
      setLoading(false)
    }
  }, [brandId])

  const refreshServiceTypes = useCallback(async () => {
    await fetchServiceTypes()
  }, [fetchServiceTypes])

  // Formatting functions
  const formatDuration = useCallback((duration: number): string => {
    if (duration < 60) {
      return `${duration} min`
    }
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    if (minutes === 0) {
      return `${hours} h`
    }
    return `${hours}h ${minutes}min`
  }, [])

  const formatPrice = useCallback((price: number | null): string => {
    if (price === null || price === undefined) {
      return "Sin precio"
    }
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(price)
  }, [])

  return {
    // State
    serviceTypes,
    filteredServiceTypes,
    brandId,
    loading,
    error,
    searchTerm,
    
    // Actions
    setSearchTerm,
    refreshServiceTypes,
    
    // Utility functions
    formatDuration,
    formatPrice
  }
}