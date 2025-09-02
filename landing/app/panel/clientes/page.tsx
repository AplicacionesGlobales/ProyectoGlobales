"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, Phone, Mail, Eye, AlertCircle, CheckCircle } from "lucide-react"
import { CreateClientModal, ClientDetailModal } from "@/components/modals/client"

// Componentes genéricos
import { PageHeader } from "@/components/reusable-components/PageHeader"
import { SearchBar } from "@/components/reusable-components/SearchBar"
import { DataTable, ColumnConfig, RowAction } from "@/components/reusable-components/DateTable"
import { SmartPagination } from "@/components/reusable-components/SmartPagination"

// Hooks y servicios
import { usePagination } from "@/hooks/usePagination"
import { ClientPaginationService, clientsService } from "@/services/client-pagination.adapter"
import { Client, CreateClientData, ClientNote, ClientActivity } from "@/services/client.service"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  createAccess: boolean
  tempPassword: string
}

export default function ClientesPage() {
  // Estados locales para modales y búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [brandId, setBrandId] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([])
  const [clientActivity, setClientActivity] = useState<ClientActivity[]>([])
  const [modalLoading, setModalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Hook de paginación
  const {
    data: clients,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    loading,
    goToPage,
    changeItemsPerPage,
    refresh,
    setError: setPaginationError
  } = usePagination<Client>({
    initialItemsPerPage: 25,
    onFetch: (page, limit) => ClientPaginationService.getClientsPaginated(brandId!, page, limit, searchTerm),
    dependencies: [brandId, searchTerm]
  })

  // Inicializar brandId
  useEffect(() => {
    const brandData = localStorage.getItem('brand_data')
    if (brandData) {
      const brand = JSON.parse(brandData)
      setBrandId(brand.id)
    }
  }, [])

  // Funciones de utilidad
  const clearMessages = () => {
    setError(null)
    setSuccess(null)
    setPaginationError(null)
  }

  // Manejar creación de cliente
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
        refresh() // Refrescar la lista paginada
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

  // Manejar visualización de cliente
  const handleViewClient = async (client: Client) => {
    if (!brandId) return
    
    try {
      setModalLoading(true)
      
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
      setModalLoading(false)
    }
  }

  // Configuración de columnas para la tabla
  const columns: ColumnConfig<Client>[] = [
    {
      key: 'name',
      title: 'Cliente',
      render: (client) => (
        <div>
          <h3 className="font-medium">{client.firstName} {client.lastName}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Mail className="h-3 w-3" />
            {client.email}
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      title: 'Teléfono',
      render: (client) => (
        <div className="text-sm">
          {client.phone ? (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {client.phone}
            </span>
          ) : (
            <span className="text-muted-foreground">Sin teléfono</span>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      title: 'Estadísticas',
      render: (client) => (
        <div className="text-left text-sm">
          <p>Citas: {client.totalAppointments}</p>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Estado',
      render: (client) => (
        <Badge variant={client.isActive ? "default" : "secondary"}>
          {client.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    }
  ]

  // Configuración de acciones por fila
  const rowActions: RowAction<Client>[] = [
    {
      key: 'view',
      label: 'Ver detalles',
      icon: Eye,
      onClick: handleViewClient,
      variant: 'outline'
    }
  ]

  // Configuración del avatar
  const avatarConfig = {
    show: true,
    getInitials: (client: Client) => `${client.firstName[0]}${client.lastName[0]}`,
    backgroundColor: () => 'bg-blue-500'
  }

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <PageHeader
        title="Clientes"
        subtitle="Gestiona tu base de clientes"
        primaryAction={{
          text: "Nuevo Cliente",
          icon: Plus,
          onClick: () => {
            clearMessages()
            setShowCreateModal(true)
          }
        }}
      />

      {/* Mensajes de error y éxito */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Barra de búsqueda */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar clientes..."
      />

      {/* Tabla de datos */}
      <DataTable
        data={clients}
        columns={columns}
        keyExtractor={(client) => client.id.toString()}
        title="Lista de Clientes"
        titleIcon={Users}
        loading={loading}
        loadingText="Cargando clientes..."
        emptyIcon={Users}
        emptyTitle="No hay clientes registrados"
        emptyDescription="Comienza agregando tu primer cliente"
        emptyAction={{
          text: "Crear Cliente",
          onClick: () => {
            clearMessages()
            setShowCreateModal(true)
          },
          icon: Plus
        }}
        avatar={avatarConfig}
        actions={rowActions}
        hover={true}
      />

      {/* Paginación */}
      <SmartPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={goToPage}
        onItemsPerPageChange={changeItemsPerPage}
        loading={loading}
        showItemsPerPage={true}
        showResultsInfo={true}
      />

      {/* Modales */}
      <CreateClientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateClient}
        loading={modalLoading}
        error={error}
        success={success}
      />

      <ClientDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        client={selectedClient}
        notes={clientNotes}
        activities={clientActivity}
        loading={loading}
      />
    </div>
  )
}