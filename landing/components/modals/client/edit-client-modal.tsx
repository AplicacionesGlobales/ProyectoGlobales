import React, { useState, useEffect } from "react"
import { BaseModal } from "@/components/reusable-components/BaseModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Edit3, AlertCircle, CheckCircle, Mail, Phone, User, FileText, Clock } from "lucide-react"
import { Client, UpdateClientData } from "@/services/client.service"

interface EditClientModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  onSave: (clientId: number, data: UpdateClientData) => Promise<void>
  loading?: boolean
  error?: string | null
  success?: string | null
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
}

interface ValidationErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  notes?: string
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onSave,
  loading = false,
  error = null,
  success = null
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  })
  
  const [originalData, setOriginalData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  })
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [localError, setLocalError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  // Cargar datos del cliente cuando el modal se abra
  useEffect(() => {
    if (isOpen && client) {
      const clientData: FormData = {
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        email: client.email || '',
        phone: client.phone || '',
        notes: client.notes || ''
      }
      setFormData(clientData)
      setOriginalData(clientData)
      setValidationErrors({})
      setLocalError(null)
      setHasChanges(false)
      setShowUnsavedWarning(false)
    }
  }, [isOpen, client])

  // Detectar cambios en el formulario
  useEffect(() => {
    if (!isOpen) return

    const changed = Object.keys(formData).some(key => {
      const currentValue = formData[key as keyof FormData]?.trim() || ''
      const originalValue = originalData[key as keyof FormData]?.trim() || ''
      return currentValue !== originalValue
    })
    
    setHasChanges(changed)
  }, [formData, originalData, isOpen])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setLocalError(null)
    
    // Limpiar error de validación del campo específico
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {}
    
    // Validar firstName
    if (!formData.firstName.trim()) {
      errors.firstName = 'El nombre es obligatorio'
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'El nombre debe tener al menos 2 caracteres'
    } else if (formData.firstName.trim().length > 50) {
      errors.firstName = 'El nombre no puede exceder 50 caracteres'
    }
    
    // Validar lastName
    if (!formData.lastName.trim()) {
      errors.lastName = 'El apellido es obligatorio'
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'El apellido debe tener al menos 2 caracteres'
    } else if (formData.lastName.trim().length > 50) {
      errors.lastName = 'El apellido no puede exceder 50 caracteres'
    }
    
    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'El formato del email no es válido'
      }
    }
    
    // Validar phone (opcional)
    if (formData.phone.trim() && formData.phone.trim().length < 8) {
      errors.phone = 'El teléfono debe tener al menos 8 caracteres'
    }
    
    // Validar notes (opcional)
    if (formData.notes.trim() && formData.notes.trim().length > 500) {
      errors.notes = 'Las notas no pueden exceder 500 caracteres'
    }
    
    return errors
  }

  const handleSubmit = async () => {
    if (!client) return

    try {
      setLocalError(null)
      
      const errors = validateForm()
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        return
      }
      
      // Preparar datos para envío (solo campos modificados)
      const updateData: UpdateClientData = {}
      
      if (formData.firstName.trim() !== originalData.firstName.trim()) {
        updateData.firstName = formData.firstName.trim()
      }
      if (formData.lastName.trim() !== originalData.lastName.trim()) {
        updateData.lastName = formData.lastName.trim()
      }
      if (formData.email.trim().toLowerCase() !== originalData.email.trim().toLowerCase()) {
        updateData.email = formData.email.trim().toLowerCase()
      }
      if (formData.phone.trim() !== originalData.phone.trim()) {
        updateData.phone = formData.phone.trim() || undefined
      }
      if (formData.notes.trim() !== originalData.notes.trim()) {
        updateData.notes = formData.notes.trim() || undefined
      }
      
      if (Object.keys(updateData).length === 0) {
        setLocalError('No hay cambios para guardar')
        return
      }
      
      await onSave(client.id, updateData)
      
    } catch (err: any) {
      console.error('Error saving client:', err)
      setLocalError(err?.message || 'Error guardando cambios')
    }
  }

  const handleClose = () => {
    if (hasChanges && !loading) {
      setShowUnsavedWarning(true)
      return
    }
    
    resetAndClose()
  }

  const resetAndClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: ''
    })
    setOriginalData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: ''
    })
    setValidationErrors({})
    setLocalError(null)
    setHasChanges(false)
    setShowUnsavedWarning(false)
    onClose()
  }

  const confirmDiscard = () => {
    resetAndClose()
  }

  const cancelDiscard = () => {
    setShowUnsavedWarning(false)
  }

  const currentError = error || localError
  const currentSuccess = success

  // Modal de confirmación para descartar cambios
  if (showUnsavedWarning) {
    return (
      <BaseModal
        isOpen={true}
        onClose={cancelDiscard}
        title="¿Descartar cambios?"
        description="Tienes cambios sin guardar que se perderán si continúas."
        titleIcon={<AlertCircle className="h-5 w-5 text-orange-500" />}
        size="sm"
        primaryButton={{
          text: "Descartar",
          onClick: confirmDiscard,
          variant: "destructive"
        }}
        secondaryButton={{
          text: "Cancelar",
          onClick: cancelDiscard
        }}
      >
        <p className="text-sm text-muted-foreground">
          ¿Estás seguro de que quieres cerrar sin guardar los cambios realizados?
        </p>
      </BaseModal>
    )
  }

  if (!client) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Cliente"
      description={`Modificar información de ${client.firstName} ${client.lastName}`}
      titleIcon={<Edit3 className="h-5 w-5" />}
      size="md"
      maxHeight="85vh"
      primaryButton={{
        text: loading ? "Guardando..." : "Guardar Cambios",
        onClick: handleSubmit,
        loading: loading,
        disabled: loading || !hasChanges
      }}
      secondaryButton={{
        text: "Cancelar",
        onClick: handleClose,
        disabled: loading
      }}
    >
      <div className="space-y-6">
        {/* Header con información del cliente */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
            {client.firstName[0]}{client.lastName[0]}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {client.firstName} {client.lastName}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {client.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={client.isActive ? "default" : "secondary"} className="text-xs">
                {client.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ID: #{client.id}
              </span>
            </div>
          </div>
        </div>

        {/* Mensajes de estado */}
        {currentError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{currentError}</AlertDescription>
          </Alert>
        )}

        {currentSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{currentSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Indicador de cambios */}
        {hasChanges && (
          <Alert className="border-blue-200 bg-blue-50">
            <Edit3 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Has realizado cambios. Recuerda guardar antes de cerrar.
            </AlertDescription>
          </Alert>
        )}

        {/* Formulario */}
        <div className="space-y-4">
          {/* Información personal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Nombre *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Nombre del cliente"
                disabled={loading}
                className={validationErrors.firstName ? 'border-red-500' : ''}
              />
              {validationErrors.firstName && (
                <p className="text-xs text-red-600">{validationErrors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Apellido *
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Apellido del cliente"
                disabled={loading}
                className={validationErrors.lastName ? 'border-red-500' : ''}
              />
              {validationErrors.lastName && (
                <p className="text-xs text-red-600">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Información de contacto */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@ejemplo.com"
              disabled={loading}
              className={validationErrors.email ? 'border-red-500' : ''}
            />
            {validationErrors.email && (
              <p className="text-xs text-red-600">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Teléfono
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+506 8888 8888"
              disabled={loading}
              className={validationErrors.phone ? 'border-red-500' : ''}
            />
            {validationErrors.phone && (
              <p className="text-xs text-red-600">{validationErrors.phone}</p>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Notas
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notas adicionales sobre el cliente, preferencias, alergias, etc."
              rows={3}
              disabled={loading}
              className={validationErrors.notes ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center">
              {validationErrors.notes && (
                <p className="text-xs text-red-600">{validationErrors.notes}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.notes.length}/500 caracteres
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
