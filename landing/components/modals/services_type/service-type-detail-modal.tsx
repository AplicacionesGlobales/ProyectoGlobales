import React from "react"
import { Badge } from "@/components/ui/badge"
import { BaseModal } from "@/components/reusable-components/BaseModal"
import { Settings, Clock, DollarSign } from "lucide-react"
import { ServiceType } from "@/services/service_types.service"

interface ServiceTypeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  serviceType: ServiceType | null
  loading?: boolean
  formatDuration: (duration: number) => string
  formatPrice: (price: number | null) => string
}

export const ServiceTypeDetailModal: React.FC<ServiceTypeDetailModalProps> = ({
  isOpen,
  onClose,
  serviceType,
  loading = false,
  formatDuration,
  formatPrice
}) => {
  if (!serviceType) return null

  const serviceColor = serviceType.color || '#3B82F6'

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={serviceType.name}
      description="Detalles completos del tipo de servicio"
      size="lg"
      showFooter={true}
      secondaryButton={{
        text: "Cerrar",
        onClick: onClose,
        variant: "outline"
      }}
      titleIcon={<Settings className="h-5 w-5" style={{ color: serviceColor }} />}
    >
      <div className="space-y-6">
        {/* Header con gradiente de color */}
        <div 
          className="rounded-xl p-6 text-white relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${serviceColor} 0%, ${serviceColor}CC 50%, ${serviceColor}99 100%)` 
          }}
        >
          {/* Elementos decorativos */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 -translate-y-6 translate-x-6"
            style={{ backgroundColor: 'white' }}
          />
          <div 
            className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-10 translate-y-3 -translate-x-3"
            style={{ backgroundColor: 'white' }}
          />
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">{serviceType.name}</h3>
            <div className="flex items-center gap-3">
              <Badge 
                variant={serviceType.isActive ? "secondary" : "outline"}
                className="bg-white/20 text-white border-white/30"
              >
                {serviceType.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Descripción con borde de color */}
        <div className="space-y-3">
          <h4 
            className="font-semibold text-sm uppercase tracking-wide flex items-center gap-2"
            style={{ color: serviceColor }}
          >
            Descripción
          </h4>
          <div 
            className="rounded-lg p-4 border-l-4 bg-gray-50"
            style={{ borderLeftColor: serviceColor }}
          >
            <p className="text-sm text-gray-700">
              {serviceType.description || 'Sin descripción disponible'}
            </p>
          </div>
        </div>

        {/* Información del servicio con elementos creativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duración */}
          <div className="space-y-3">
            <h4 
              className="font-semibold text-sm uppercase tracking-wide flex items-center gap-2"
              style={{ color: serviceColor }}
            >
              <div 
                className="p-1.5 rounded-full"
                style={{ backgroundColor: `${serviceColor}20` }}
              >
                <Clock 
                  className="w-4 h-4" 
                  style={{ color: serviceColor }}
                />
              </div>
              Duración
            </h4>
            <div className="relative">
              <div 
                className="absolute left-0 top-0 w-1 h-full rounded-full"
                style={{ backgroundColor: serviceColor }}
              />
              <div className="pl-4 py-3">
                <p className="text-lg font-bold text-gray-800">
                  {formatDuration(serviceType.duration)}
                </p>
              </div>
            </div>
          </div>

          {/* Precio */}
          <div className="space-y-3">
            <h4 
              className="font-semibold text-sm uppercase tracking-wide flex items-center gap-2"
              style={{ color: serviceColor }}
            >
              <div 
                className="p-1.5 rounded-full"
                style={{ backgroundColor: `${serviceColor}20` }}
              >
                <DollarSign 
                  className="w-4 h-4" 
                  style={{ color: serviceColor }}
                />
              </div>
              Precio
            </h4>
            <div className="relative">
              <div 
                className="absolute left-0 top-0 w-1 h-full rounded-full"
                style={{ backgroundColor: serviceColor }}
              />
              <div className="pl-4 py-3">
                <p className="text-lg font-bold text-gray-800">
                  {formatPrice(serviceType.price)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Muestra de color */}
        <div className="space-y-3">
          <h4 
            className="font-semibold text-sm uppercase tracking-wide"
            style={{ color: serviceColor }}
          >
            Color del Servicio
          </h4>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg shadow-sm border-2 border-white"
                style={{ backgroundColor: serviceColor }}
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{serviceColor.toUpperCase()}</p>
                <p className="text-xs text-gray-500">Código hexadecimal</p>
              </div>
            </div>
            {/* Variaciones de color */}
            <div className="flex gap-1 ml-auto">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: `${serviceColor}80` }}
              />
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: `${serviceColor}60` }}
              />
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: `${serviceColor}40` }}
              />
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: `${serviceColor}20` }}
              />
            </div>
          </div>
        </div>

        {/* Ícono (si existe) */}
        {serviceType.icon && (
          <div className="space-y-3">
            <h4 
              className="font-semibold text-sm uppercase tracking-wide"
              style={{ color: serviceColor }}
            >
              Ícono
            </h4>
            <div 
              className="rounded-lg p-4 border-l-4 bg-gray-50"
              style={{ borderLeftColor: serviceColor }}
            >
              <p className="text-sm font-medium text-gray-700">{serviceType.icon}</p>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  )
}