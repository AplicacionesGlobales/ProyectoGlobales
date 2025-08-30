// components/modals/client/client-view-modal.tsx
import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Calendar, Edit, Trash2 } from "lucide-react"
import { GenericModal, ModalAction } from "@/components/reusable components/generic-modal"
import { Client, ClientType } from "@/services/client.service"

interface ClientViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
  onEdit: (client: Client) => void
  onDelete?: (client: Client) => void
  onScheduleAppointment?: (client: Client) => void
  formatDate?: (date: string) => string
  formatLastVisit?: (date?: string) => string
  getTypeColor?: (type: ClientType) => string
  getTypeLabel?: (type: ClientType) => string
}

export function ClientViewModal({
  open,
  onOpenChange,
  client,
  onEdit,
  onDelete,
  onScheduleAppointment,
  formatDate = (date) => date,
  formatLastVisit = (date) => date || 'Nunca',
  getTypeColor = () => 'default',
  getTypeLabel = (type) => type
}: ClientViewModalProps) {
  if (!client) return null

  const actions: ModalAction[] = [
    {
      label: "Cerrar",
      onClick: () => onOpenChange(false),
      variant: "outline",
      show: true
    },
    {
      label: "Editar",
      onClick: () => onEdit(client),
      variant: "default",
      icon: <Edit className="h-4 w-4" />,
      show: true
    },
    ...(onScheduleAppointment ? [{
      label: "Agendar Cita",
      onClick: () => onScheduleAppointment(client),
      variant: "outline" as const,
      icon: <Calendar className="h-4 w-4" />,
      show: true
    }] : []),
    ...(onDelete ? [{
      label: "Eliminar",
      onClick: () => onDelete(client),
      variant: "destructive" as const,
      icon: <Trash2 className="h-4 w-4" />,
      show: true
    }] : [])
  ]

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title="Detalles del Cliente"
      description="Información completa del cliente"
      size="lg"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Header del cliente */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-semibold shadow-lg">
            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {client.firstName} {client.lastName}
            </h3>
            {client.clientType && (
              <div className="mt-1">
                <Badge variant={getTypeColor(client.clientType) as any} className="text-xs">
                  {getTypeLabel(client.clientType)}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Información de contacto */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Información de Contacto</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
              <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{client.email}</span>
            </div>

            {client.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{client.phone}</span>
              </div>
            )}

            {client.dateOfBirth && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">Nació el {formatDate(client.dateOfBirth)}</span>
              </div>
            )}

            {client.address && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                <div className="text-gray-500 flex-shrink-0 mt-0.5">📍</div>
                <span className="text-sm text-gray-700">{client.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Estadísticas</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-700">Total Visitas</p>
              <p className="text-3xl font-bold text-blue-900">{client.totalVisits || 0}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Estado</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                client.isActive 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {client.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {client.lastVisit && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Última Visita</h4>
            <p className="text-blue-700">{formatLastVisit(client.lastVisit)}</p>
          </div>
        )}

        {client.notes && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Notas</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{client.notes}</p>
          </div>
        )}

        {/* Fechas de sistema */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Información del Sistema</h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div className="space-y-1">
              <p className="font-medium">Creado</p>
              <p>{client.createdAt ? formatDate(client.createdAt) : 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Actualizado</p>
              <p>{client.updatedAt ? formatDate(client.updatedAt) : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </GenericModal>
  )
}