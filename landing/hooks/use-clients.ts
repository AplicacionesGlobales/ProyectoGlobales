import { useState, useEffect, useMemo } from "react"
import { clientsService, Client, CreateClientData, ClientNote, ClientActivity } from "@/services/client.service"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  createAccess: boolean
  tempPassword: string
}

export interface UseClientsReturn {
  // Estado de datos
  clients: Client[]
  filteredClients: Client[]
  selectedClient: Client | null
  clientNotes: ClientNote[]
  clientActivity: ClientActivity[]
  
  // Estados de UI
  loading: boolean
  modalLoading: boolean
  error: string | null
  success: string | null
  
  // Estados de modales
  showCreateModal: boolean
  showDetailModal: boolean
  
  // Estado de búsqueda
  searchTerm: string
  
  // Acciones principales
  loadClients: () => Promise<void>
  handleCreateClient: (formData: FormData) => Promise<void>
  handleViewClient: (client: Client) => Promise<void>
  
  // Controles de UI
  setSearchTerm: (term: string) => void
  setShowCreateModal: (show: boolean) => void
  setShowDetailModal: (show: boolean) => void
  clearMessages: () => void
  
  // Brand ID
  brandId: number | null
}

export const useClients = (): UseClientsReturn => {
  // Estados de datos
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([])
  const [clientActivity, setClientActivity] = useState<ClientActivity[]>([])
  const [brandId, setBrandId] = useState<number | null>(null)
  
  // Estados de UI
  const [loading, setLoading] = useState(true)
  const [modalLoading, setModalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Estado de búsqueda
  const [searchTerm, setSearchTerm] = useState('')

  // Inicialización
  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    if (brandId) {
      loadClients()
    }
  }, [brandId])

  // Clientes filtrados
  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [clients, searchTerm])

  // Funciones internas
  const initializeData = () => {
    const brandData = localStorage.getItem('brand_data')
    if (brandData) {
      const brand = JSON.parse(brandData)
      setBrandId(brand.id)
    }
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  // Funciones principales
  const loadClients = async () => {
    if (!brandId) return
    
    try {
      setLoading(true)
      const response = await clientsService.getClients(brandId, { 
        page: 1, 
        limit: 50 
      })
      
      if (response.success && response.data) {
        setClients(response.data.clients)
      } else {
        setError('Error cargando clientes')
      }
    } catch (error) {
      console.error('Error loading clients:', error)
      setError('Error cargando clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (formData: FormData) => {
    if (!brandId) return
    
    try {
      setModalLoading(true)
      clearMessages()
      
      const clientData: CreateClientData = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        createAccess: formData.createAccess,
        tempPassword: formData.createAccess ? formData.tempPassword.trim() : undefined
      }
      
      const response = await clientsService.createClient(brandId, clientData)
      
      if (response.success) {
        setSuccess('Cliente creado exitosamente')
        setShowCreateModal(false)
        await loadClients()
      } else {
        const errorMsg = response.errors?.[0]?.description || 'Error creando cliente'
        setError(errorMsg)
        throw new Error(errorMsg)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error de conexión'
      setError(errorMsg)
      throw error
    } finally {
      setModalLoading(false)
    }
  }

  const handleViewClient = async (client: Client) => {
    if (!brandId) return
    
    try {
      setLoading(true)
      
      // Cargar detalles del cliente
      const [clientResponse, notesResponse, activityResponse] = await Promise.all([
        clientsService.getClient(brandId, client.id),
        clientsService.getClientNotes(brandId, client.id),
        clientsService.getClientActivity(brandId, client.id)
      ])
      
      if (clientResponse.success && clientResponse.data) {
        setSelectedClient(clientResponse.data)
      }
      
      if (notesResponse.success && notesResponse.data) {
        setClientNotes(notesResponse.data.notes)
      } else {
        setClientNotes([])
      }
      
      if (activityResponse.success && activityResponse.data) {
        setClientActivity(activityResponse.data.activities)
      } else {
        setClientActivity([])
      }
      
      setShowDetailModal(true)
    } catch (error) {
      setError('Error cargando detalles del cliente')
    } finally {
      setLoading(false)
    }
  }

  return {
    // Estado de datos
    clients,
    filteredClients,
    selectedClient,
    clientNotes,
    clientActivity,
    
    // Estados de UI
    loading,
    modalLoading,
    error,
    success,
    
    // Estados de modales
    showCreateModal,
    showDetailModal,
    
    // Estado de búsqueda
    searchTerm,
    
    // Acciones principales
    loadClients,
    handleCreateClient,
    handleViewClient,
    
    // Controles de UI
    setSearchTerm,
    setShowCreateModal,
    setShowDetailModal,
    clearMessages,
    
    // Brand ID
    brandId
  }
}