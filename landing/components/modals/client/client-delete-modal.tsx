// components/modals/client/client-delete-modal.tsx
import React from 'react'
import { RefreshCw, Trash2, AlertTriangle } from "lucide-react"
import { GenericModal, ModalAction } from "@/components/reusable components/generic-modal"
import { Client } from "@/services/client.service"

interface ClientDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
  onConfirm: () => void
  onCancel: () => void
  deleting?: boolean
}

export function ClientDeleteModal({
  open,
  onOpenChange,
  client,
  onConfirm,
  onCancel,
  deleting = false
}: ClientDeleteModalProps) {
  if (!client) return null

  const actions: ModalAction[] = [
    {
      label: "Cancelar",
      onClick: onCancel,
      variant: "outline",
      disabled: deleting,
      show: true
    },
    {
      label: "Eliminar Cliente",
      onClick: onConfirm,
      variant: "destructive",
      loading: deleting,
      disabled: deleting,
      icon: deleting ? <RefreshCw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />,
      show: true
    }
  ]

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar Cliente"
      description="Esta acción no se puede deshacer"
      size="sm"
      actions={actions}
      closable={!deleting}
    >
      <div className="space-y-4">
        {/* Advertencia */}
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-900">
            Esta acción eliminará permanentemente todos los datos del cliente
          </p>
        </div>

        {/* Información del cliente */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {client.firstName} {client.lastName}
            </p>
            <p className="text-sm text-gray-500 truncate">{client.email}</p>
            {client.phone && (
              <p className="text-sm text-gray-500">{client.phone}</p>
            )}
          </div>
        </div>
        
        {/* Detalles de lo que se eliminará */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-900">
            Se eliminará la siguiente información:
          </p>
          
          <ul className="text-sm text-gray-600 space-y-1.5">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
              Información personal del cliente
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
              Historial de visitas ({client.totalVisits || 0} visita{client.totalVisits !== 1 ? 's' : ''})
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
              Notas y comentarios asociados
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
              Registros de fechas y actividad
            </li>
          </ul>
        </div>

        {/* Confirmación final */}
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800 font-medium">
            ¿Estás completamente seguro de que deseas eliminar este cliente?
          </p>
        </div>
      </div>
    </GenericModal>
  )
}