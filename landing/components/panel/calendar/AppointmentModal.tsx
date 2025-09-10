// components/calendar/AppointmentModal.tsx
"use client"

import { useState, useEffect, useMemo } from 'react'
import { format, parse, addMinutes } from 'date-fns'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Calendar, Clock, User, Save, Briefcase } from "lucide-react"
import { 
  appointmentsService, 
  Appointment, 
  AppointmentStatus, 
  CreateAppointmentByRootData, 
  CalendarEvent
} from "@/services/appointment.service"

import { formatPriceSimple } from '@/utils/format-utils'

interface ServiceType {
  id: number
  name: string
  description?: string
  duration: number
  price: number
  color: string
  icon?: string
}

interface AppointmentModalProps {
  brandId: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialDate?: Date
  initialTime?: string
  editingAppointment?: CalendarEvent
  serviceTypes: ServiceType[] // Recibir tipos de servicio desde el componente padre
}

interface AppointmentFormData {
  serviceTypeId: number | null
  startTime: string // ISO string format
  duration: number
  notes: string
  clientId?: number
}

export function AppointmentModal({
  brandId,
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  initialTime,
  editingAppointment,
  serviceTypes
}: AppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Datos del formulario
  const [formData, setFormData] = useState<AppointmentFormData>({
    serviceTypeId: serviceTypes.length > 0 ? serviceTypes[0].id : null,
    startTime: initialDate && initialTime 
      ? `${format(initialDate, 'yyyy-MM-dd')}T${initialTime}:00`
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    duration: serviceTypes.length > 0 ? serviceTypes[0].duration : 30,
    notes: '',
    clientId: undefined
  })

  // Si estamos editando, cargar datos de la cita
  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        serviceTypeId: editingAppointment.serviceTypeId || null,
        startTime: editingAppointment.startTime,
        duration: editingAppointment.duration,
        notes: editingAppointment.notes || '',
        clientId: editingAppointment.clientId
      })
    }
  }, [editingAppointment])

  // Obtener el tipo de servicio seleccionado
  const selectedServiceType = useMemo(() => {
    if (!formData.serviceTypeId) return null
    return serviceTypes.find(st => st.id === formData.serviceTypeId)
  }, [formData.serviceTypeId, serviceTypes])

  // Calcular hora de fin basada en duración
  const endTime = useMemo(() => {
    if (!formData.startTime) return ''
    
    try {
      const start = new Date(formData.startTime)
      const end = addMinutes(start, formData.duration)
      return format(end, 'HH:mm')
    } catch {
      return ''
    }
  }, [formData.startTime, formData.duration])

  // Actualizar duración cuando cambia el tipo de servicio
  const handleServiceTypeChange = (serviceTypeId: string) => {
    const id = parseInt(serviceTypeId)
    const serviceType = serviceTypes.find(st => st.id === id)
    
    setFormData(prev => ({
      ...prev,
      serviceTypeId: id,
      duration: serviceType?.duration || 30
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Validaciones
      if (!formData.startTime) {
        setError('Debe seleccionar una fecha y hora')
        return
      }

      if (!formData.serviceTypeId) {
        setError('Debe seleccionar un tipo de servicio')
        return
      }

      if (formData.duration < 15) {
        setError('La duración mínima es de 15 minutos')
        return
      }

      const appointmentData: CreateAppointmentByRootData = {
        serviceTypeId: formData.serviceTypeId,
        startTime: formData.startTime,
        duration: formData.duration,
        notes: formData.notes || undefined,
        clientId: formData.clientId
      }

      let response
      if (editingAppointment) {
        response = await appointmentsService.updateAppointment(
          brandId,
          editingAppointment.id,
          appointmentData
        )
      } else {
        response = await appointmentsService.createAppointmentByRoot(brandId, appointmentData)
      }

      if (response.success) {
        onSuccess()
        handleClose()
      } else {
        setError(response.errors?.[0]?.description || 'Error guardando cita')
      }

    } catch (error: any) {
      console.error('Error saving appointment:', error)
      setError('Error guardando cita')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setFormData({
      serviceTypeId: serviceTypes.length > 0 ? serviceTypes[0].id : null,
      startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      duration: serviceTypes.length > 0 ? serviceTypes[0].duration : 30,
      notes: '',
      clientId: undefined
    })
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {editingAppointment ? 'Editar Cita' : 'Nueva Cita'}
          </DialogTitle>
          <DialogDescription>
            {editingAppointment 
              ? 'Modifica los detalles de la cita existente'
              : 'Crea una nueva cita en el calendario'
            }
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Tipo de Servicio */}
          <div className="space-y-2">
            <Label htmlFor="serviceType" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Tipo de Servicio
            </Label>
            <Select
              value={formData.serviceTypeId?.toString()}
              onValueChange={handleServiceTypeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((serviceType) => (
                  <SelectItem 
                    key={serviceType.id} 
                    value={serviceType.id.toString()}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: serviceType.color }}
                        />
                        <span>{serviceType.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground ml-4">
                        {formatPriceSimple(serviceType.price)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Mostrar información del servicio seleccionado */}
            {selectedServiceType && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Precio:</span>
                  <span className="font-medium">{formatPriceSimple(selectedServiceType.price)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">Duración sugerida:</span>
                  <span className="font-medium">{selectedServiceType.duration} min</span>
                </div>
                {selectedServiceType.description && (
                  <p className="text-gray-500 mt-2 text-xs">{selectedServiceType.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Fecha y Hora */}
          <div className="space-y-2">
            <Label htmlFor="datetime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Fecha y Hora
            </Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={formData.startTime.slice(0, 16)} // Remove seconds for input
              onChange={(e) => setFormData(prev => ({
                ...prev,
                startTime: e.target.value + ':00' // Add seconds back
              }))}
              className="w-full"
            />
          </div>

          {/* Duración */}
          <div className="space-y-2">
            <Label htmlFor="duration">
              Duración (minutos) - Termina a las {endTime}
            </Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="480"
              step="15"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                duration: parseInt(e.target.value) || 30
              }))}
              className="w-full"
            />
            {selectedServiceType && formData.duration !== selectedServiceType.duration && (
              <p className="text-xs text-amber-600">
                ⚠️ La duración difiere de la sugerida ({selectedServiceType.duration} min)
              </p>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Agregar notas sobre la cita..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !formData.serviceTypeId}
            className="flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {editingAppointment ? 'Actualizar' : 'Crear'} Cita
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}