"use client"

import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, AlertCircle, Clock, DollarSign } from "lucide-react"
import { PageHeader } from "@/components/reusable-components/PageHeader"
import { SearchBar } from "@/components/reusable-components/SearchBar"
import { DataTable, ColumnConfig } from "@/components/reusable-components/DateTable"

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

  // Configuración de columnas para la tabla
  const columns: ColumnConfig<ServiceType>[] = [
    {
      key: 'name',
      title: 'Servicio',
      render: (serviceType) => (
        <div>
          <h3 className="font-medium">{serviceType.name}</h3>
          {serviceType.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {serviceType.description}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'duration',
      title: 'Duración',
      render: (serviceType) => (
        <div className="flex items-center gap-1 text-sm">
          <Clock className="w-3 h-3" />
          {formatDuration(serviceType.duration)}
        </div>
      )
    },
    {
      key: 'price',
      title: 'Precio',
      render: (serviceType) => (
        <div className="flex items-center gap-1 text-sm">
          <DollarSign className="w-3 h-3" />
          {formatPrice(serviceType.price)}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Estado',
      render: (serviceType) => (
        <Badge variant={serviceType.isActive ? "default" : "secondary"}>
          {serviceType.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    }
  ]

  // Configuración del avatar
  const avatarConfig = {
    show: true,
    getInitials: (serviceType: ServiceType) => serviceType.name.substring(0, 2).toUpperCase(),
    backgroundColor: (serviceType: ServiceType) => serviceType.color || 'bg-blue-500'
  }

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
        avatar={avatarConfig}
        hover={true}
      />
    </div>
  )
}