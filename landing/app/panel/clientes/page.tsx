"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, AlertCircle, CheckCircle } from "lucide-react"

// Importar los componentes generales
import { GenericTable } from "@/components/reusable components/generic-table"
import { SearchBar } from "@/components/reusable components/search-bar"
import { FilterPanel } from "@/components/reusable components/filter-panel"

// Importar las modales específicas (ahora separadas)
import { ClientFormModal, ClientViewModal, ClientDeleteModal } from "@/components/modals/client"

// Importar el hook personalizado
import { useClients } from "@/hooks/use-clients"

export default function ClientesPage() {
  const {
    // Estado
    loading,
    saving,
    error,
    success,
    clients,
    stats,
    
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
    
    // Configuraciones para componentes
    searchFields,
    tagFilters,
    customFilters,
    tableColumns,
    tableActions,
    
    // Paginación
    currentPage,
    totalPages,
    itemsPerPage,
    
    // Handlers principales
    handleFormChange,
    handleOpenDialog,
    handleCloseDialog,
    handleSave,
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
    
    // Setters
    setIsDialogOpen,
    setIsViewDialogOpen,
    setIsDeleteDialogOpen
  } = useClients()

  if (loading && !clients.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona tu base de datos de clientes y su historial.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

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
        searchFields={searchFields}
        placeholder="Buscar clientes por nombre, email o teléfono..."
        onSearch={handleSearch}
        showAdvancedSearch={true}
        debounceMs={300}
      />

      {/* Panel de filtros */}
      <FilterPanel
        tagFilters={tagFilters}
        customFilters={customFilters}
        onFiltersChange={handleFiltersChange}
        title="Filtrar Clientes"
        description="Aplica filtros para encontrar clientes específicos"
        collapsible={true}
        defaultCollapsed={false}
      />

      {/* Tabla de clientes */}
      <GenericTable
        data={clients}
        columns={tableColumns}
        actions={tableActions}
        loading={loading}
        title="Lista de Clientes"
        description={
          `${clients.length} cliente${clients.length !== 1 ? 's' : ''} registrado${clients.length !== 1 ? 's' : ''}`
        }
        emptyMessage="No hay clientes registrados"
        emptyAction={{
          label: "Agregar Primer Cliente",
          onClick: () => handleOpenDialog()
        }}
        pagination={{
          currentPage,
          totalPages,
          itemsPerPage,
          totalItems: clients.length,
          onPageChange: handlePageChange
        }}
        onRefresh={handleRefresh}
        className="mb-6"
      />

      {/* Modal para crear/editar cliente */}
      <ClientFormModal
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        client={editingClient}
        formData={formData}
        onFormChange={handleFormChange}
        onSave={handleSave}
        onCancel={handleCloseDialog}
        saving={saving}
        error={error}
      />

      {/* Modal para ver detalles del cliente */}
      <ClientViewModal
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        client={viewingClient}
        onEdit={(client) => {
          setIsViewDialogOpen(false)
          handleOpenDialog(client)
        }}
        onDelete={handleOpenDeleteDialog}
        onScheduleAppointment={(client) => {
          // TODO: Implementar función para agendar cita
          console.log('Agendar cita para:', client)
        }}
        formatDate={formatDate}
        formatLastVisit={formatLastVisit}
        getTypeColor={getTypeColor}
        getTypeLabel={getTypeLabel}
      />

      {/* Modal de confirmación para eliminar cliente */}
      <ClientDeleteModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        client={deletingClient}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        deleting={deleting}
      />
    </div>
  )
}