// components/calendar/AppointmentModal.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { format, addMinutes, parse } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Clock, 
  User, 
  Zap, 
  AlertCircle, 
  CheckCircle,
  Search,
  Plus,
  RefreshCw
} from "lucide-react"
import { appointmentsService, CalendarEvent, CreateAppointmentData, UpdateAppointmentData, AppointmentConflict } from "@/services/appointmentsService"
import { clientsService, Client } from "@/services/clientsService"
import { functionsService, BrandFunction } from "@/services/functionsService"
import { scheduleUtils } from "@/types/schedule.types"

interface AppointmentModalProps {
  brandId: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialDate?: Date
  initialTime?: string
  editingAppointment?: CalendarEvent
}

interface AppointmentFormData {
  clientId: number | null
  serviceId: number | null
  date: string
  startTime: string
  notes: string
}

export function AppointmentModal({
  brandId,
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  initialTime,
  editingAppointment
}: AppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conflicts, setConflicts] = useState<AppointmentConflict | null>(null)
  
  // Datos del formulario
  const [formData, setFormData] = useState<AppointmentFormData>({
    clientId: null,
    serviceId: null,
    date: initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: initialTime || '09:00',
    notes: ''
  })

  // Datos cargados
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<BrandFunction[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  
  // Estados del UI
  const [clientSearch, setClientSearch] = useState('')
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClientData, setNewClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen, brandId])

  // Si estamos editando, cargar datos de la cita
  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        clientId: editingAppointment.clientId,
        serviceId: editingAppointment.serviceId,
        date: format(editingAppointment.start, 'yyyy-MM-dd'),
        startTime: format(editingAppointment.start, 'HH:mm'),
        notes: editingAppointment.notes || ''
      })
    }
  }, [editingAppointment])

  // Filtrar clientes por búsqueda
  useEffect(() => {
    if (clientSearch.trim()) {
      const filtered = clients.filter(client =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(clientSearch.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (client.phone && client.phone.includes(clientSearch))
      )
      setFilteredClients(filtered)
    } else {
      setFilteredClients(clients.slice(0, 20)) // Mostrar solo primeros 20
    }
  }, [clientSearch, clients])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar clientes y servicios en paralelo
      const [clientsResponse, servicesResponse] = await Promise.all([
        clientsService.getClients(brandId, 1, 100),
        functionsService.getBrandFunctions(brandId)
      ])

      if (clientsResponse.success && clientsResponse.data) {
        setClients(clientsResponse.data)
        setFilteredClients(clientsResponse.data.slice(0, 20))
      }

      if (servicesResponse.success && servicesResponse.data) {
        const activeServices = servicesResponse.data.filter(service => service.isActive)
        setServices(activeServices)
      }

    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Error cargando datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  // Calcular hora de fin basada en servicio seleccionado
  const endTime = useMemo(() => {
    if (!formData.serviceId || !formData.startTime) return ''
    
    const selectedService = services.find(s => s.id === formData.serviceId)
    if (!selectedService) return ''

    try {
      const start = parse(formData.startTime, 'HH:mm', new Date())
      const end = addMinutes(start, selectedService.duration)
      return format(end, 'HH:mm')
    } catch {
      return ''
    }
  }, [formData.serviceId, formData.startTime, services])

  // Verificar conflictos cuando cambien datos relevantes
  useEffect(() => {
    if (formData.date && formData.startTime && formData.serviceId) {
      checkConflicts()
    }
  }, [formData.date, formData.startTime, formData.serviceId])

  const checkConflicts = async () => {
    if (!formData.serviceId) return

    const selectedService = services.find(s => s.id === formData.serviceId)
    if (!selectedService) return

    try {
      const response = await appointmentsService.checkConflicts(
        brandId,
        formData.date,
        formData.startTime,
        selectedService.duration,
        editingAppointment?.id
      )

      if (response.success && response.data) {
        setConflicts(response.data)
      }
    } catch (error) {
      console.error('Error checking conflicts:', error)
    }
  }

  const handleCreateNewClient = async () => {
    try {
      setSaving(true)
      setError(null)

      if (!newClientData.firstName || !newClientData.lastName || !newClientData.email) {
        setError('Nombre, apellido y email son obligatorios')
        return
      }

      const response = await clientsService.createClient(brandId, newClientData)

      if (response.success && response.data) {
        // Agregar el nuevo cliente a la lista
        const newClient = response.data
        setClients(prev => [newClient, ...prev])
        setFilteredClients(prev => [newClient, ...prev])
        
        // Seleccionar el nuevo cliente
        setFormData(prev => ({ ...prev, clientId: newClient.id }))
        
        // Limpiar formulario y cerrar
        setNewClientData({ firstName: '', lastName: '', email: '', phone: '' })
        setShowNewClientForm(false)
        setClientSearch(`${newClient.firstName} ${newClient.lastName}`)
      } else {
        setError(response.errors?.[0]?.description || 'Error creando cliente')
      }
    } catch (error) {
      console.error('Error creating client:', error)
      setError('Error creando cliente')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Validaciones
      if (!formData.clientId) {
        setError('Debe seleccionar un cliente')
        return
      }

      if (!formData.serviceId) {
        setError('Debe seleccionar un servicio')
        return
      }

      if (!formData.date) {
        setError('Debe seleccionar una fecha')
        return
      }

      if (!formData.startTime) {
        setError('Debe seleccionar una hora')
        return
      }

      // Verificar si hay conflictos
      if (conflicts?.hasConflict) {
        setError('Hay conflictos de horario. Por favor seleccione otro horario.')
        return
      }

      const appointmentData = {
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        date: formData.date,
        startTime: formData.startTime,
        notes: formData.notes || undefined
      }

      let response
      if (editingAppointment) {
        // Actualizar cita existente
        response = await appointmentsService.updateAppointment(
          brandId,
          editingAppointment.id,
          appointmentData
        )
      } else {
        // Crear nueva cita
        response = await appointmentsService.createAppointment(brandId, appointmentData)
      }

      if (response.success) {
        onSuccess()
        onClose()
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
      clientId: null,
      serviceId: null,
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      notes: ''
    })
    setClientSearch('')
    setShowNewClientForm(false)
    setNewClientData({ firstName: '', lastName: '', email: '', phone: '' })
    setError(null)
    setConflicts(null)
    onClose()
  }

  // Generar opciones de tiempo
  const timeOptions = scheduleUtils.generateHourOptions(7, 22, 30)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAppointment ? 'Editar Cita' : 'Nueva Cita'}
          </DialogTitle>
          <DialogDescription>
            {editingAppointment 
              ? 'Modifica los detalles de la cita existente'
              : 'Crea una nueva cita para tu cliente'
            }
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {conflicts?.hasConflict && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Conflicto de horario detectado:</p>
                {conflicts.conflictingAppointments.map((conflict, index) => (
                  <div key={index} className="text-sm">
                    • {conflict.clientName} - {conflict.serviceName} 
                    ({conflict.startTime} - {conflict.endTime})
                  </div>
                ))}
                {conflicts.suggestedTimes.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium">Horarios sugeridos:</p>
                    <div className="flex gap-1 flex-wrap">
                      {conflicts.suggestedTimes.map((time, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleFormChange('startTime', time)}
                          className="text-xs"
                        >
                          {scheduleUtils.formatTime(time)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando datos...</span>
            </div>
          ) : (
            <>
              {/* Selección de Cliente */}
              <div className="space-y-3">
                <Label>Cliente</Label>
                
                {!showNewClientForm ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar cliente por nombre, email o teléfono..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowNewClientForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Nuevo
                      </Button>
                    </div>

                    {filteredClients.length > 0 ? (
                      <Select
                        value={formData.clientId?.toString() || ''}
                        onValueChange={(value) => handleFormChange('clientId', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredClients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span>{client.firstName} {client.lastName}</span>
                                <div className="text-xs text-muted-foreground ml-2">
                                  {client.email}
                                  {client.phone && ` • ${client.phone}`}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : clientSearch ? (
                      <div className="text-sm text-muted-foreground p-2 border rounded">
                        No se encontraron clientes. 
                        <Button 
                          variant="link" 
                          className="p-0 ml-1"
                          onClick={() => setShowNewClientForm(true)}
                        >
                          Crear nuevo cliente
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-2 border rounded">
                        Comience a escribir para buscar clientes
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Crear Nuevo Cliente</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewClientForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="firstName">Nombre *</Label>
                        <Input
                          id="firstName"
                          value={newClientData.firstName}
                          onChange={(e) => setNewClientData(prev => ({
                            ...prev,
                            firstName: e.target.value
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Apellido *</Label>
                        <Input
                          id="lastName"
                          value={newClientData.lastName}
                          onChange={(e) => setNewClientData(prev => ({
                            ...prev,
                            lastName: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClientData.email}
                        onChange={(e) => setNewClientData(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={newClientData.phone}
                        onChange={(e) => setNewClientData(prev => ({
                          ...prev,
                          phone: e.target.value
                        }))}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleCreateNewClient}
                      disabled={saving}
                      className="w-full"
                    >
                      {saving ? 'Creando...' : 'Crear Cliente'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Selección de Servicio */}
              <div className="space-y-2">
                <Label>Servicio</Label>
                <Select
                  value={formData.serviceId?.toString() || ''}
                  onValueChange={(value) => handleFormChange('serviceId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{service.title}</span>
                          <div className="text-xs text-muted-foreground ml-2">
                            {scheduleUtils.formatTime(service.duration.toString() + ':00')} • ${service.currentPrice}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Hora de inicio</Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(value) => handleFormChange('startTime', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={time} value={time}>
                          {scheduleUtils.formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Información calculada */}
              {endTime && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      Duración: {formData.startTime} - {endTime}
                    </span>
                  </div>
                  {formData.serviceId && (
                    <div className="text-sm text-blue-600 mt-1">
                      Servicio: {services.find(s => s.id === formData.serviceId)?.title}
                      • Precio: ${services.find(s => s.id === formData.serviceId)?.currentPrice}
                    </div>
                  )}
                </div>
              )}

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales sobre la cita..."
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {editingAppointment ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              editingAppointment ? 'Actualizar Cita' : 'Crear Cita'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}FormChange = (field: keyof AppointmentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handle