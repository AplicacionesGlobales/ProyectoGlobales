import React, { useState } from "react"
import { BaseModal } from "@/components/reusable-components/BaseModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, AlertCircle, CheckCircle } from "lucide-react"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  createAccess: boolean
  tempPassword: string
}

interface CreateClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void>
  loading?: boolean
  error?: string | null
  success?: string | null
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  error = null,
  success = null
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    createAccess: false,
    tempPassword: ''
  })

  const [localError, setLocalError] = useState<string | null>(null)

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setLocalError(null)
  }

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'Nombre es requerido'
    if (!formData.lastName.trim()) return 'Apellido es requerido'
    if (!formData.email.trim()) return 'Email es requerido'
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return 'Email inválido'
    
    if (formData.createAccess && !formData.tempPassword.trim()) {
      return 'Contraseña temporal requerida'
    }
    
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setLocalError(validationError)
      return
    }

    try {
      await onSubmit(formData)
      // Reset form on success
      if (!error) {
        resetForm()
      }
    } catch (err) {
      // Error handling is done by parent component
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: '',
      createAccess: false,
      tempPassword: ''
    })
    setLocalError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const currentError = error || localError
  const currentSuccess = success

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Cliente"
      description="Registra un nuevo cliente"
      titleIcon={<Plus className="h-5 w-5" />}
      size="md"
      maxHeight="85vh" // Ajustar altura máxima
      primaryButton={{
        text: loading ? "Creando..." : "Crear Cliente",
        onClick: handleSubmit,
        loading: loading,
        disabled: loading
      }}
      secondaryButton={{
        text: "Cancelar",
        onClick: handleClose,
        disabled: loading
      }}
    >
      <div className="space-y-4 py-2">
        {/* Mensajes de error y éxito */}
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

        {/* Formulario - Con contenedor scrolleable */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Nombre"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Apellido *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Apellido"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@ejemplo.com"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+506 8888 8888"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notas sobre el cliente..."
              rows={3}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.createAccess}
                onCheckedChange={(checked) => handleInputChange('createAccess', !!checked)}
                disabled={loading}
              />
              <Label className="text-sm">Crear acceso al sistema</Label>
            </div>
            
            {/* Campo de contraseña con transición suave */}
            {formData.createAccess && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <Label>Contraseña Temporal *</Label>
                <Input
                  type="password"
                  value={formData.tempPassword}
                  onChange={(e) => handleInputChange('tempPassword', e.target.value)}
                  placeholder="Contraseña temporal"
                  disabled={loading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  )
}