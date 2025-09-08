import { useState, useEffect, useCallback } from "react"
import { appointmentsService, Appointment, AppointmentStatus } from "@/services/appointment.service"
import { clientsService, Client } from "@/services/client.service"
import { serviceTypesService, ServiceType } from "@/services/service_types.service"

interface CreateAppointmentFormData {
  startTime: string
  notes: string
  clientId: number | null
  serviceTypeId: number | null
}

interface UseAppointmentsReturn {
  // State
  appointments: Appointment[]
  monthAppointments: Appointment[]
  clients: Client[]
  serviceTypes: ServiceType[]
  selectedDate: Date
  currentMonth: Date
  loading: boolean
  loadingMonth: boolean
  createLoading: boolean
  createError: string | null
  createSuccess: string | null
  brandId: number | null
  // Actions
  setSelectedDate: (date: Date) => void
  setCurrentMonth: (date: Date) => void
  handleDateSelect: (date: Date) => void
  handleMonthNavigate: (direction: "prev" | "next") => void
  handleStatusChange: (appointmentId: number, newStatus: string) => Promise<void>
  handleCreateAppointment: (data: CreateAppointmentFormData) => Promise<Appointment | undefined>
  clearMessages: () => void
  refreshAppointments: () => Promise<void>
  refreshMonthAppointments: () => Promise<void>
}

interface UseAppointmentsOptions {
  autoFetch?: boolean
  initialDate?: Date
}

export const useAppointments = ({
  autoFetch = true,
  initialDate = new Date()
}: UseAppointmentsOptions = {}): UseAppointmentsReturn => {
  // State
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [currentMonth, setCurrentMonth] = useState(initialDate)
  const [loading, setLoading] = useState(true)
  const [loadingMonth, setLoadingMonth] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [brandId, setBrandId] = useState<number | null>(null)
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])

  // Inicialización del brandId
  useEffect(() => {
    initializeData()
  }, [])

  // Inicializar datos cuando brandId esté disponible
  useEffect(() => {
    if (brandId && autoFetch) {
      fetchDayAppointments()
      fetchMonthAppointments()
      fetchClients()
      fetchServiceTypes()
    }
  }, [brandId, autoFetch])
  // Fetch service types
  const fetchServiceTypes = useCallback(async () => {
    if (!brandId) return;
    try {
      const response = await serviceTypesService.getServiceTypesByBrand(brandId);
      console.log('Service Types Response:', response);
      if (response.data) {
        setServiceTypes(response.data);
      } else {
        setServiceTypes([]);
      }
    } catch (error) {
      setServiceTypes([]);
    }
  }, [brandId]);

  // Funciones internas
  const initializeData = () => {
    const brandData = localStorage.getItem('brand_data')
    if (brandData) {
      const brand = JSON.parse(brandData)
      setBrandId(brand.id)
    }
  }

  // Utility functions
  const formatDateForAPI = useCallback((date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  const getMonthDateRange = useCallback((date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return {
      startDate: formatDateForAPI(firstDay),
      endDate: formatDateForAPI(lastDay)
    }
  }, [formatDateForAPI])

  // Fetch functions
  const fetchClients = useCallback(async () => {
    if (!brandId) return
    
    try {
      const response = await clientsService.getClients(brandId, { 
        page: 1, 
        limit: 100 
      })
      
      if (response.success && response.data) {
        let clientsList: Client[] = []
        
        // Handle both array response and paginated response
        if (Array.isArray(response.data)) {
          clientsList = response.data
        } else if (typeof response.data === 'object' && 'clients' in response.data) {
          clientsList = (response.data as any).clients || []
        }
        
        setClients(clientsList)
      } else {
        console.error('Error fetching clients:', response.errors)
        setClients([])
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
      setClients([])
    }
  }, [brandId])

  const fetchDayAppointments = useCallback(async () => {
    if (!brandId) return
    
    try {
      setLoading(true)
      const dateStr = formatDateForAPI(selectedDate)

      const response = await appointmentsService.getAppointments(
        brandId,
        1,
        100,
        {
          startDate: dateStr,
          endDate: dateStr
        }
      )

      if (response.success && response.data) {
        let appointmentsList: Appointment[] = []
        
        if (Array.isArray(response.data)) {
          appointmentsList = response.data
        } else if (typeof response.data === 'object' && 'appointments' in response.data) {
          appointmentsList = (response.data as any).appointments || []
        }
        
        setAppointments(appointmentsList)
      } else {
        console.error('Error fetching day appointments:', response.errors)
        setAppointments([])
      }
    } catch (error) {
      console.error("Error fetching day appointments:", error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [brandId, selectedDate, formatDateForAPI])

  const fetchMonthAppointments = useCallback(async () => {
    if (!brandId) return
    
    try {
      setLoadingMonth(true)
      const { startDate, endDate } = getMonthDateRange(currentMonth)

      const response = await appointmentsService.getAppointments(
        brandId,
        1,
        200,
        {
          startDate,
          endDate
        }
      )

      if (response.success && response.data) {
        let appointmentsList: Appointment[] = []
        
        if (Array.isArray(response.data)) {
          appointmentsList = response.data
        } else if (typeof response.data === 'object' && 'appointments' in response.data) {
          appointmentsList = (response.data as any).appointments || []
        }
        
        setMonthAppointments(appointmentsList)
      } else {
        console.error('Error fetching month appointments:', response.errors)
        setMonthAppointments([])
      }
    } catch (error) {
      console.error("Error fetching month appointments:", error)
      setMonthAppointments([])
    } finally {
      setLoadingMonth(false)
    }
  }, [brandId, currentMonth, getMonthDateRange])

  // Action handlers
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const handleMonthNavigate = useCallback((direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentMonth(newMonth)
  }, [currentMonth])

  const handleStatusChange = useCallback(async (appointmentId: number, newStatus: string) => {
    if (!brandId) return
    
    try {
      const response = await appointmentsService.updateAppointment(brandId, appointmentId, {
        status: newStatus as AppointmentStatus
      })

      if (response.success) {
        // Update local state
        setAppointments((prev) =>
          prev.map((apt) => 
            apt.id === appointmentId 
              ? { ...apt, status: newStatus as AppointmentStatus } 
              : apt
          )
        )
        
        // Also update month appointments
        setMonthAppointments((prev) =>
          prev.map((apt) => 
            apt.id === appointmentId 
              ? { ...apt, status: newStatus as AppointmentStatus } 
              : apt
          )
        )
      } else {
        console.error('Error updating appointment status:', response.errors)
        throw new Error(response.errors?.join(', ') || 'Error updating appointment status')
      }
    } catch (error) {
      console.error('Error updating appointment status:', error)
      throw error
    }
  }, [brandId])

  const handleCreateAppointment = useCallback(async (data: CreateAppointmentFormData) => {
    if (!brandId) return
    try {
      setCreateLoading(true)
      setCreateError(null)

      // Validate clientId
      if (!data.clientId) {
        throw new Error('Cliente es requerido')
      }
      // Validate serviceTypeId
      if (!data.serviceTypeId) {
        throw new Error('Tipo de servicio es requerido')
      }

      const appointmentData = {
        startTime: data.startTime,
        notes: data.notes,
        clientId: data.clientId,
        serviceTypeId: data.serviceTypeId
      }

      // Use createAppointmentByRoot since we're creating as admin
      const response = await appointmentsService.createAppointmentByRoot(brandId, appointmentData)

      if (response.success) {
        setCreateSuccess('Cita creada exitosamente')
        // Refresh appointments
        await Promise.all([
          fetchDayAppointments(),
          fetchMonthAppointments()
        ])
        return response.data
      } else {
        // Mejor manejo de errores: mostrar el mensaje del backend si existe
        let errorMessage = 'Error al crear la cita';
        if (response.errors && response.errors.length > 0) {
          // Si el error es un objeto, intenta mostrar la propiedad 'description' o serializar el objeto
          const err = response.errors[0];
          if (typeof err === 'string') {
            errorMessage = err;
          } else if (typeof err === 'object') {
            errorMessage = err.description || JSON.stringify(err);
          }
        }
        console.log('Create appointment error:', errorMessage);
        setCreateError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la cita'
      setCreateError(errorMessage)
      throw error
    } finally {
      setCreateLoading(false)
    }
  }, [brandId, fetchDayAppointments, fetchMonthAppointments])

  const clearMessages = useCallback(() => {
    setCreateError(null)
    setCreateSuccess(null)
  }, [])

  const refreshAppointments = useCallback(async () => {
    await fetchDayAppointments()
  }, [fetchDayAppointments])

  const refreshMonthAppointments = useCallback(async () => {
    await fetchMonthAppointments()
  }, [fetchMonthAppointments])

  // Effects para recargar cuando cambien las fechas
  useEffect(() => {
    if (brandId && autoFetch) {
      fetchDayAppointments()
    }
  }, [selectedDate, brandId, autoFetch, fetchDayAppointments])

  useEffect(() => {
    if (brandId && autoFetch) {
      fetchMonthAppointments()
    }
  }, [currentMonth, brandId, autoFetch, fetchMonthAppointments])

  return {
    // State
    appointments,
    monthAppointments,
    clients,
    serviceTypes,
    selectedDate,
    currentMonth,
    loading,
    loadingMonth,
    createLoading,
    createError,
    createSuccess,
    brandId,
    // Actions
    setSelectedDate,
    setCurrentMonth,
    handleDateSelect,
    handleMonthNavigate,
    handleStatusChange,
    handleCreateAppointment,
    clearMessages,
    refreshAppointments,
    refreshMonthAppointments
  }
}