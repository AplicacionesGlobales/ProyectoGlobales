// components/modals/client/client-form-modal.tsx
import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw } from "lucide-react"
import { GenericModal, ModalAction } from "@/components/reusable components/generic-modal"
import { Client } from "@/services/client.service"

// Interfaces
interface ClientFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  notes: string
}

interface ClientFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
  formData: ClientFormData
  onFormChange: (field: keyof ClientFormData, value: string) => void
  onSave: () => void
  onCancel: () => void
  saving?: boolean
  error?: string | null
}

export function ClientFormModal({
  open,
  onOpenChange,
  client,
  formData,
  onFormChange,
  onSave,
  onCancel,
  saving = false,
  error
}: ClientFormModalProps) {
  const isEditing = Boolean(client)
  
  const actions: ModalAction[] = [
    {
      label: "Cancelar",
      onClick: onCancel,
      variant: "outline",
      disabled: saving,
      show: true
    },
    {
      label: isEditing ? "Actualizar Cliente" : "Crear Cliente",
      onClick: onSave,
      variant: "default",
      loading: saving,
      disabled: saving || !formData.firstName || !formData.lastName || !formData.email,
      icon: saving ? <RefreshCw className="h-4 w-4" /> : undefined,
      show: true
    }
  ]

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Cliente" : "Nuevo Cliente"}
      description={
        isEditing 
          ? "Modifica la información del cliente" 
          : "Agrega un nuevo cliente a tu base de datos"
      }
      size="md"
      actions={actions}
      error={error}
      closable={!saving}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onFormChange('firstName', e.target.value)}
              placeholder="Ingresa el nombre"
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Apellido <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => onFormChange('lastName', e.target.value)}
              placeholder="Ingresa el apellido"
              disabled={saving}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onFormChange('email', e.target.value)}
            placeholder="cliente@ejemplo.com"
            disabled={saving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onFormChange('phone', e.target.value)}
            placeholder="+506 88888888"
            disabled={saving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => onFormChange('dateOfBirth', e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => onFormChange('address', e.target.value)}
            placeholder="Dirección completa"
            disabled={saving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            placeholder="Notas adicionales sobre el cliente..."
            value={formData.notes}
            onChange={(e) => onFormChange('notes', e.target.value)}
            rows={3}
            disabled={saving}
            className="resize-none"
          />
        </div>
      </div>
    </GenericModal>
  )
}

export type { ClientFormData }