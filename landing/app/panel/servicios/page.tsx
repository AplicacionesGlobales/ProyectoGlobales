"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, AlertCircle, Clock, DollarSign } from "lucide-react"

// Componentes genéricos
import { PageHeader } from "@/components/reusable-components/PageHeader"
import { SearchBar } from "@/components/reusable-components/SearchBar"
import { DataTable, ColumnConfig } from "@/components/reusable-components/DateTable"
import { ServiceTypeDetailModal } from "@/components/modals/services_type/service-type-detail-modal"

// Hooks
import { useServiceTypes } from "@/hooks/use-service-types"
import { ServiceType } from "@/services/service_types.service"

export default function ServiceTypesPage() {
  // Hook para manejar los tipos de servicios
  const {
    filteredServiceTypes,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    formatDuration,
    formatPrice
  } = useServiceTypes()

  // Estado para la modal de detalles
  const [selectedServiceType, setSelectedServiceType] = React.useState<ServiceType | null>(null)

  // Función para abrir la modal con el tipo de servicio seleccionado
  const handleViewServiceType = (serviceType: ServiceType) => {
    setSelectedServiceType(serviceType)
  }

  // Función para cerrar la modal
  const clearSelection = () => {
    setSelectedServiceType(null)
  }

  // Configuración de columnas para la tabla
  const columns: ColumnConfig<ServiceType>[] = [
    {
      key: 'name',
      title: 'Servicio',
      render: (serviceType) => (
        <div className="flex items-center gap-3">
          {/* Barra lateral de color creativa */}
          <div className="flex flex-col items-center gap-0.5">
            <div 
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: serviceType.color || '#3B82F6' }}
            />
            <div 
              className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: serviceType.color || '#3B82F6' }}
            />
          </div>
          <div>
            <h3 className="font-medium">{serviceType.name}</h3>
            {serviceType.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {serviceType.description}
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'duration',
      title: 'Duración',
      render: (serviceType) => (
        <div className="flex items-center gap-2">
          <div 
            className="p-1.5 rounded-md"
            style={{ backgroundColor: `${serviceType.color || '#3B82F6'}20` }}
          >
            <Clock 
              className="w-3 h-3" 
              style={{ color: serviceType.color || '#3B82F6' }}
            />
          </div>
          <span className="text-sm font-medium">{formatDuration(serviceType.duration)}</span>
        </div>
      )
    },
    {
      key: 'price',
      title: 'Precio',
      render: (serviceType) => (
        <div className="flex items-center gap-2">
          <div 
            className="p-1.5 rounded-md"
            style={{ backgroundColor: `${serviceType.color || '#3B82F6'}20` }}
          >
            <DollarSign 
              className="w-3 h-3" 
              style={{ color: serviceType.color || '#3B82F6' }}
            />
          </div>
          <span className="text-sm font-medium">{formatPrice(serviceType.price)}</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Estado',
      render: (serviceType) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: serviceType.isActive 
                ? (serviceType.color || '#3B82F6')
                : '#6B7280'
            }}
          />
          <Badge 
            variant={serviceType.isActive ? "default" : "secondary"}
            style={{
              backgroundColor: serviceType.isActive 
                ? `${serviceType.color || '#3B82F6'}15` 
                : undefined,
              color: serviceType.isActive 
                ? (serviceType.color || '#3B82F6') 
                : undefined,
              borderColor: serviceType.isActive 
                ? `${serviceType.color || '#3B82F6'}30` 
                : undefined
            }}
          >
            {serviceType.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      )
    }
  ]

  // Acciones para cada fila de la tabla
  const rowActions = [
    {
      key: "view",
      label: "Ver detalles",
      onClick: handleViewServiceType,
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <PageHeader
        title="Tipos de Servicios"
        subtitle="Visualiza los servicios que ofreces"
      />

      {/* Mensajes de error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Barra de búsqueda */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar tipos de servicios..."
      />

      {/* Tabla de datos */}
      <DataTable
        data={filteredServiceTypes}
        columns={columns}
        keyExtractor={(serviceType) => serviceType.id.toString()}
        title="Lista de Servicios"
        titleIcon={Settings}
        loading={loading}
        loadingText="Cargando tipos de servicios..."
        emptyIcon={Settings}
        emptyTitle="No hay tipos de servicios registrados"
        emptyDescription="No se encontraron tipos de servicios para mostrar"
        actions={rowActions}
        hover={true}
      />

      {/* Modal de detalles */}
      <ServiceTypeDetailModal
        isOpen={!!selectedServiceType}
        onClose={clearSelection}
        serviceType={selectedServiceType}
        loading={loading}
        formatDuration={formatDuration}
        formatPrice={formatPrice}
      />
    </div>
  )
}