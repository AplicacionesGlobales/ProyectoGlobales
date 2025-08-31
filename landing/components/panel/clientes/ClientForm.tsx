// components/panel/clientes/ClientForm.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertCircle,
  RefreshCw,
  User,
  Mail,
  Phone,
  FileText,
  Key
} from "lucide-react"
import { Client, CreateClientData } from "@/services/client.service"

interface ClientFormProps {
  client?: Client
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateClientData ) => Promise<void>
  loading: boolean
}

interface ClientFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  createAccess: boolean
  tempPassword: string
}

const defaultFormData: ClientFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
  createAccess: false,
  tempPassword: ''
}

export function ClientForm({
  client,
  isOpen,
  onClose,
  onSave,
  loading
}: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>(defaultFormData)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isEditing = !!client

  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData({
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone || '',
          notes: client.notes || '',
          createAccess: false,
          tempPassword: ''
        })
      } else {
        setFormData(defaultFormData)
      }
      setError(null)
    }
  }, [isOpen, client])

  const handleFormChange = (field: keyof ClientFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) {
      return 'El nombre es obligatorio'
    }
    if (!formData.lastName.trim()) {
      return 'El apellido es obligatorio'
    }
    if (!formData.email.trim()) {
      return 'El email es obligatorio'
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'El formato del email no es válido'
    }
    
    if (formData.phone && formData.phone.length > 0 && formData.phone.length < 8) {
      return 'El teléfono debe tener al menos 8 caracteres'
    }
    
    if (!isEditing && formData.createAccess && !formData.tempPassword.trim()) {
      return 'La contraseña temporal es obligatoria cuando se crea acceso al sistema'
    }
    
    if (formData.tempPassword && formData.tempPassword.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    
    return null
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const validationError = validateForm()
      if (validationError) {
        setError(validationError)
        return
      }
      
      const clientData: CreateClientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      }

      if (!isEditing) {
        // Crear cliente
        const createData = clientData as CreateClientData
        createData.createAccess = formData.createAccess
        if (formData.createAccess && formData.tempPassword.trim()) {
          createData.tempPassword = formData.tempPassword.trim()
        }
      }
      
      await onSave(clientData)
      
    } catch (error: any) {
      console.error('Error saving client:', error)
      setError(error?.message || 'Error guardando cliente')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (!saving) {
      setFormData(defaultFormData)
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica la información del cliente existente' 
              : 'Registra un nuevo cliente en tu base de datos'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Información básica */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Nombre *
                </Label>
                <Input
                  id="firstName"
                  placeholder="Nombre del cliente"
                  value={formData.firstName}
                  onChange={(e) => handleFormChange('firstName', e.target.value)}
                  disabled={saving || loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  placeholder="Apellido del cliente"
                  value={formData.lastName}
                  onChange={(e) => handleFormChange('lastName', e.target.value)}
                  disabled={saving || loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                disabled={saving || loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Teléfono
              </Label>
              <Input
                id="phone"
                placeholder="+506 8888 8888"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                disabled={saving || loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Notas
              </Label>
              <Textarea
                id="notes"
                placeholder="Notas adicionales sobre el cliente, preferencias, alergias, etc."
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                rows={3}
                disabled={saving || loading}
              />
            </div>
          </div>

          {/* Opciones de acceso (solo para crear cliente) */}
          {!isEditing && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createAccess"
                  checked={formData.createAccess}
                  onCheckedChange={(checked) => handleFormChange('createAccess', !!checked)}
                  disabled={saving || loading}
                />
                <Label htmlFor="createAccess" className="text-sm font-medium">
                  Crear acceso al sistema
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Permitir al cliente acceder al sistema para agendar sus propias citas
              </p>

              {formData.createAccess && (
                <div className="space-y-2">
                  <Label htmlFor="tempPassword" className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    Contraseña Temporal *
                  </Label>
                  <Input
                    id="tempPassword"
                    type="password"
                    placeholder="Contraseña que el cliente deberá cambiar"
                    value={formData.tempPassword}
                    onChange={(e) => handleFormChange('tempPassword', e.target.value)}
                    disabled={saving || loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    El cliente recibirá un email con estas credenciales y deberá cambiar la contraseña al primer inicio de sesión
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={saving || loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={saving || loading}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              isEditing ? 'Actualizar Cliente' : 'Crear Cliente'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}