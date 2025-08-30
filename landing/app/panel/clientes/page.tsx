"use client"

import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, Phone, Mail, Eye, AlertCircle, CheckCircle } from "lucide-react"
import { CreateClientModal, ClientDetailModal } from "@/components/modals/client"

// Componentes genéricos
import { PageHeader } from "@/components/reusable-components/PageHeader"
import { SearchBar } from "@/components/reusable-components/SearchBar"
import { DataTable, ColumnConfig, RowAction } from "@/components/reusable-components/DateTable"

// Hook personalizado
import { useClients } from "@/hooks/use-clients"
import { Client } from "@/services/client.service"

export default function ClientesPage() {
  const {
    // Estado de datos
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
    handleCreateClient,
    handleViewClient,
    
    // Controles de UI
    setSearchTerm,
    setShowCreateModal,
    setShowDetailModal,
    clearMessages
  } = useClients()

  // Configuración de columnas para la tabla
  const columns: ColumnConfig<Client>[] = [
    {
      key: 'name',
      title: 'Cliente',
      render: (client) => (
        <div>
          <h3 className="font-medium">{client.firstName} {client.lastName}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {client.email}
            </span>
            {client.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {client.phone}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'stats',
      title: 'Estadísticas',
      render: (client) => (
        <div className="text-right text-sm">
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
        data={filteredClients}
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