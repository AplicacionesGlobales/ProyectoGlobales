// landing\components\modals\appointment\create-appointment-modal.tsx
import React, { useState, useEffect } from "react"
import { BaseModal } from "@/components/reusable-components/BaseModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, AlertCircle, CheckCircle, Search } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScheduleValidator } from "@/components/validators/ScheduleValidator"
import { ValidationResult } from "@/services/schedule-validator.service"

interface Client {
  id: number
  firstName: string
  lastName: string
  email: string
}

interface FormData {
  startTime: string
  notes: string
  clientId: number | null
  serviceTypeId: number | null
}

interface ServiceType {
  id: number
  name: string
  duration: number
  price: number | null
}

interface CreateAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void>
  clients: Client[]
  serviceTypes: ServiceType[]
  loading?: boolean
  error?: string | null
  success?: string | null
}

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clients,
  serviceTypes,
  loading = false,
  error = null,
  success = null
}) => {
  const [formData, setFormData] = useState<FormData>({
    startTime: '',
    notes: '',
    clientId: null,
    serviceTypeId: null
  })
  const [date, setDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [time, setTime] = useState<string>('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [clientSearchOpen, setClientSearchOpen] = useState(false)
  const [clientSearchValue, setClientSearchValue] = useState("")
  const [brandId, setBrandId] = useState<number | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    hasConflicts: false,
    hasBusinessHourConflict: false,
    conflicts: [],
    suggestions: [],
    warnings: []
  })

  useEffect(() => {
    const brandData = localStorage.getItem('brand_data')
    if (brandData) {
      const brand = JSON.parse(brandData)
      setBrandId(brand.id)
    }
  }, [])

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const handleInputChange = (field: keyof FormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setLocalError(null)
  }

  const handleDateChange = (value: string) => {
    setDate(value)
    setLocalError(null)
  }

  const handleTimeChange = (value: string) => {
    setTime(value)
    setLocalError(null)
  }

  const getStartTimeISO = () => {
    if (date && time) {
      return `${date}T${time}:00.000`
    }
    return ''
  }

  const getCurrentDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const handleValidationChange = (result: ValidationResult) => {
    setValidationResult(result)
  }

  const validateForm = (): string | null => {
    if (!date || !time) return 'Fecha y hora son requeridas'
    if (!formData.clientId) return 'Cliente es requerido'
    
    const appointmentDate = new Date(getStartTimeISO())
    const now = new Date()
    if (appointmentDate < now) {
      return 'No se pueden crear citas en el pasado'
    }

    if (!validationResult.isValid) {
      return 'Hay conflictos de horario que deben resolverse'
    }
    
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setLocalError(validationError)
      return
    }

    const submitData = {
      ...formData,
      startTime: getStartTimeISO()
    }

    try {
      await onSubmit(submitData)
      if (!error) {
        resetForm()
      }
    } catch (err) {
      // Error handling done by parent
    }
  }

  const resetForm = () => {
    setFormData({
      startTime: '',
      notes: '',
      clientId: null,
      serviceTypeId: null
    })
    setDate(getCurrentDate())
    setTime('')
    setLocalError(null)
    setClientSearchValue("")
    setValidationResult({
      isValid: true,
      hasConflicts: false,
      hasBusinessHourConflict: false,
      conflicts: [],
      suggestions: [],
      warnings: []
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const currentError = error || localError
  const currentSuccess = success
  const selectedClient = clients.find(client => client.id === formData.clientId)
  const filteredClients = clients.filter(client =>
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(clientSearchValue.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchValue.toLowerCase())
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Cita"
      description="Programar una nueva cita"
      titleIcon={<Calendar className="h-5 w-5" />}
      size="lg"
      maxHeight="90vh"
      primaryButton={{
        text: loading ? "Creando..." : "Crear Cita",
        onClick: handleSubmit,
        loading: loading,
        disabled: loading || !validationResult.isValid
      }}
      secondaryButton={{
        text: "Cancelar",
        onClick: handleClose,
        disabled: loading
      }}
    >
      <div className="space-y-4 py-2">
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

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {/* Cliente */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientSearchOpen}
                  className="w-full justify-between"
                  disabled={loading}
                >
                  {selectedClient
                    ? `${selectedClient.firstName} ${selectedClient.lastName}`
                    : "Seleccionar cliente..."}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Buscar cliente..." 
                    value={clientSearchValue}
                    onValueChange={setClientSearchValue}
                  />
                  <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {filteredClients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={`${client.firstName} ${client.lastName}`}
                        onSelect={() => {
                          handleInputChange('clientId', client.id)
                          setClientSearchOpen(false)
                          setClientSearchValue("")
                        }}
                      >
                        <div className="flex flex-col">
                          <span>{`${client.firstName} ${client.lastName}`}</span>
                          <span className="text-sm text-muted-foreground">{client.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tipo de Servicio */}
          <div className="space-y-2">
            <Label>Tipo de Servicio</Label>
            <Select
              value={formData.serviceTypeId ? formData.serviceTypeId.toString() : undefined}
              onValueChange={(value) => handleInputChange('serviceTypeId', value ? parseInt(value) : null)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar servicio (opcional)" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {serviceTypes.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name} ({service.duration} min) {service.price ? `- ${service.price}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={getCurrentDate()}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora *</Label>
              <Select
                value={time}
                onValueChange={handleTimeChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Validador de Horarios */}
          {brandId && (
            <ScheduleValidator
              selectedDate={date}
              selectedTime={time}
              selectedServiceId={formData.serviceTypeId}
              serviceTypes={serviceTypes}
              brandId={brandId}
              onValidationChange={handleValidationChange}
              className="mt-4"
            />
          )}

          {/* Notas */}
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notas sobre la cita..."
              rows={3}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </BaseModal>
  )
}