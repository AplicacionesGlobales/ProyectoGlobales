// hooks/use-clients.ts
import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  clientsService, 
  Client, 
  CreateClientData, 
  UpdateClientData, 
  ClientType,
  CLIENT_TYPE_LABELS,
  CLIENT_TYPE_COLORS,
  ClientStats
} from '@/services/client.service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { SearchField, SearchFilter } from '@/components/reusable components/search-bar'
import { TagFilter, CustomFilter, ActiveFilter } from '@/components/reusable components/filter-panel'
import { TableColumn, TableAction } from '@/components/reusable components/generic-table'

interface BrandData {
  id: number
  name: string
}

interface ClientFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  notes: string
}

const defaultFormData: ClientFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  notes: ''
}

export function useClients() {
  // Estado principal
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('')
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([])
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState<ClientFormData>(defaultFormData)
  
  // Estados para el modal de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  // Cargar clientes cuando cambian los filtros
  useEffect(() => {
    if (brandData) {
      loadClients()
    }
  }, [currentPage, searchTerm, searchFilters, activeFilters, brandData])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener datos del brand
      const brandDataStr = localStorage.getItem('brand_data')
      if (!brandDataStr) {
        setError('No se encontraron datos del brand')
        return
      }

      const brand = JSON.parse(brandDataStr)
      setBrandData(brand)

      // Cargar estadísticas
      const statsResponse = await clientsService.getClientStats(brand.id)
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      }

    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Error cargando datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  const loadClients = async () => {
    if (!brandData) return

    try {
      setLoading(true)
      setError(null)

      // Construir filtros del servidor
      const serverFilters: any = {
        search: searchTerm || undefined,
        isActive: true
      }

      // Agregar filtros activos
      activeFilters.forEach(filter => {
        if (filter.type === 'custom') {
          if (filter.field === 'clientType') {
            serverFilters.clientType = filter.value
          }
        }
      })

      const response = await clientsService.getClients(
        brandData.id, 
        currentPage, 
        itemsPerPage, 
        serverFilters
      )

      if (response.success && response.data) {
        setClients(response.data)
        setTotalPages(Math.ceil(response.data.length / itemsPerPage))
      } else {
        setError(response.errors?.[0]?.description || 'Error cargando clientes')
      }

    } catch (error) {
      console.error('Error loading clients:', error)
      setError('Error cargando clientes')
    } finally {
      setLoading(false)
    }
  }

  // Funciones de manejo de formularios
  function handleFormChange(field: keyof ClientFormData, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function handleOpenDialog(client?: Client) {
    if (client) {
      setEditingClient(client)
      setFormData({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone || '',
        dateOfBirth: client.dateOfBirth || '',
        address: client.address || '',
        notes: client.notes || ''
      })
    } else {
      setEditingClient(null)
      setFormData(defaultFormData)
    }
    setIsDialogOpen(true)
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
    setEditingClient(null)
    setFormData(defaultFormData)
    setError(null)
  }

  function handleViewClient(client: Client) {
    setViewingClient(client)
    setIsViewDialogOpen(true)
  }

  function handleOpenDeleteDialog(client: Client) {
    setDeletingClient(client)
    setIsDeleteDialogOpen(true)
  }

  function handleCloseDeleteDialog() {
    setIsDeleteDialogOpen(false)
    setDeletingClient(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingClient || !brandData) return

    try {
      setDeleting(true)
      setError(null)

      const response = await clientsService.deleteClient(brandData.id, deletingClient.id)
      
      if (response.success) {
        setSuccess('Cliente eliminado exitosamente')
        handleCloseDeleteDialog()
        loadClients()
        loadInitialData() // Actualizar estadísticas
      } else {
        setError(response.errors?.[0]?.description || 'Error eliminando cliente')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      setError('Error eliminando cliente')
    } finally {
      setDeleting(false)
    }
  }

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) {
      return 'El nombre es obligatorio'
    }
    if (!formData.lastName.trim()) {
      return 'El apellido es obligatorio'
    }
    if (!formData.email.trim()) {
      return 'El email es obligatorio'
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'El formato del email no es válido'
    }

    return null
  }

  const handleSave = async () => {
    if (!brandData) return

    try {
      setSaving(true)
      setError(null)

      const validationError = validateForm()
      if (validationError) {
        setError(validationError)
        return
      }

      const clientData: CreateClientData | UpdateClientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined
      }

      let response
      if (editingClient) {
        response = await clientsService.updateClient(brandData.id, editingClient.id, clientData)
      } else {
        response = await clientsService.createClient(brandData.id, clientData as CreateClientData)
      }

      if (response.success) {
        setSuccess(editingClient ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente')
        handleCloseDialog()
        loadClients()
        
        // Actualizar estadísticas
        if (!editingClient) {
          loadInitialData()
        }
      } else {
        setError(response.errors?.[0]?.description || 'Error guardando cliente')
      }

    } catch (error: any) {
      console.error('Error saving client:', error)
      setError('Error guardando cliente')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (client: Client) => {
    handleOpenDeleteDialog(client)
  }

  // Handlers para búsqueda y filtros
  const handleSearch = useCallback((term: string, filters: SearchFilter[]) => {
    setSearchTerm(term)
    setSearchFilters(filters)
    setCurrentPage(1)
  }, [])

  const handleFiltersChange = useCallback((filters: ActiveFilter[]) => {
    setActiveFilters(filters)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleRefresh = useCallback(() => {
    loadClients()
  }, [loadClients])

  // Utilidades de formato
  function formatLastVisit(dateString?: string): string {
    if (!dateString) return 'Nunca'
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Hoy'
      if (diffDays === 1) return 'Ayer'
      if (diffDays < 7) return `Hace ${diffDays} días`
      if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
      return format(date, 'dd/MM/yyyy', { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  function formatDate(dateString: string): string {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es })
    } catch {
      return dateString
    }
  }

  function getTypeColor(type: ClientType): string {
    return CLIENT_TYPE_COLORS[type]
  }

  function getTypeLabel(type: ClientType): string {
    return CLIENT_TYPE_LABELS[type]
  }

  // Configuración de búsqueda
  const searchFields: SearchField[] = [
    { key: 'fullName', label: 'Nombre Completo', type: 'text', placeholder: 'Buscar por nombre...' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'Buscar por email...' },
    { key: 'phone', label: 'Teléfono', type: 'text', placeholder: 'Buscar por teléfono...' }
  ]

  // Configuración de filtros
  const tagFilters: TagFilter[] = [
    { id: 'active', label: 'Activos', color: 'green', count: stats?.activeClients },
    { id: 'inactive', label: 'Inactivos', color: 'red' }
  ]

  const customFilters: CustomFilter[] = [
    {
      field: 'clientType',
      label: 'Tipo de Cliente',
      type: 'select',
      options: [
        { value: ClientType.CLIENT, label: CLIENT_TYPE_LABELS[ClientType.CLIENT] },
        { value: ClientType.ROOT, label: CLIENT_TYPE_LABELS[ClientType.ROOT] }
      ]
    },
    {
      field: 'totalAppointments',
      label: 'Total de Citas',
      type: 'range'
    },
    {
      field: 'hasPhone',
      label: 'Tiene Teléfono',
      type: 'boolean'
    }
  ]

  // Configuración de columnas de la tabla
  const tableColumns: TableColumn<Client>[] = [
    {
      key: 'fullName',
      label: 'Cliente',
      render: (_, client) => {
        return `${client.firstName} ${client.lastName}\n${client.email}`
      },
      sortable: true
    },
    {
      key: 'phone',
      label: 'Teléfono',
      render: (value) => value || 'Sin teléfono',
      sortable: false
    },
    {
      key: 'totalVisits',
      label: 'Visitas',
      render: (value) => `${value || 0} visitas`,
      sortable: true
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (value) => value ? 'Activo' : 'Inactivo',
      sortable: true
    },
    {
      key: 'lastVisit',
      label: 'Última Visita',
      render: (value) => formatLastVisit(value),
      sortable: true
    }
  ]

  // Configuración de acciones de la tabla
  const tableActions: TableAction<Client>[] = [
    {
      type: 'view',
      onClick: handleViewClient,
      variant: 'outline'
    }
  ]

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return {
    // Estado
    loading,
    saving,
    error,
    success,
    clients,
    stats,
    brandData,
    
    // Estado de UI
    isDialogOpen,
    isViewDialogOpen,
    editingClient,
    viewingClient,
    formData,
    
    // Estados adicionales para delete modal
    isDeleteDialogOpen,
    deletingClient,
    deleting,
    
    // Configuraciones
    searchFields,
    tagFilters,
    customFilters,
    tableColumns,
    tableActions,
    
    // Paginación
    currentPage,
    totalPages,
    itemsPerPage,
    
    // Handlers
    handleFormChange,
    handleOpenDialog,
    handleCloseDialog,
    handleViewClient,
    handleSave,
    handleDelete,
    handleSearch,
    handleFiltersChange,
    handlePageChange,
    handleRefresh,
    
    // Handlers adicionales para delete
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    
    // Utilidades
    formatDate,
    formatLastVisit,
    getTypeColor,
    getTypeLabel,
    
    // Setters para estados de UI
    setIsDialogOpen,
    setIsViewDialogOpen,
    setIsDeleteDialogOpen,
    setError,
    setSuccess
  }
}