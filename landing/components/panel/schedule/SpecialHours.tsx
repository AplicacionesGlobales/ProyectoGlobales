// components/panel/schedule/SpecialHours.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Plus, Edit, Trash2, AlertCircle, CheckCircle, CalendarDays } from "lucide-react"
import { scheduleService, SpecialHour } from "@/services/schedule.service"
import { 
  SpecialHourType, 
  SPECIAL_HOUR_LABELS, 
  scheduleUtils,
  SpecialDay 
} from "@/types/schedule.types"

interface SpecialHoursProps {
  brandId: number
}

interface SpecialHourFormData {
  date: string
  isOpen: boolean
  openTime: string
  closeTime: string
  type: SpecialHourType
  reason: string
  description: string
}

const defaultFormData: SpecialHourFormData = {
  date: '',
  isOpen: false,
  openTime: '09:00',
  closeTime: '18:00',
  type: SpecialHourType.CLOSED,
  reason: '',
  description: ''
}

export function SpecialHours({ brandId }: SpecialHoursProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [specialHours, setSpecialHours] = useState<SpecialHour[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHour, setEditingHour] = useState<SpecialHour | null>(null)
  const [formData, setFormData] = useState<SpecialHourFormData>(defaultFormData)

  // Cargar horarios especiales
  useEffect(() => {
    loadSpecialHours()
  }, [brandId])

  const loadSpecialHours = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar horarios especiales de los próximos 6 meses
      const startDate = new Date().toISOString().split('T')[0]
      const endDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const response = await scheduleService.getSpecialHours(brandId, startDate, endDate)

      if (response.success && response.data) {
        setSpecialHours(response.data)
      } else {
        setError(response.errors?.[0]?.description || 'Error cargando horarios especiales')
      }

    } catch (error) {
      console.error('Error loading special hours:', error)
      setError('Error cargando horarios especiales')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (hour?: SpecialHour) => {
    if (hour) {
      setEditingHour(hour)
      setFormData({
        date: hour.date.split('T')[0], // Convertir ISO date a YYYY-MM-DD
        isOpen: hour.isOpen,
        openTime: hour.openTime || '09:00',
        closeTime: hour.closeTime || '18:00',
        type: (hour.reason as SpecialHourType) || SpecialHourType.CUSTOM,
        reason: hour.reason || '',
        description: hour.description || ''
      })
    } else {
      setEditingHour(null)
      setFormData(defaultFormData)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingHour(null)
    setFormData(defaultFormData)
    setError(null)
  }

  const handleFormChange = (field: keyof SpecialHourFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Si cambia el tipo, actualizar la razón automáticamente
    if (field === 'type') {
      setFormData(prev => ({
        ...prev,
        reason: SPECIAL_HOUR_LABELS[value as SpecialHourType]
      }))
    }
  }

  const validateForm = (): string | null => {
    if (!formData.date) {
      return 'Debe seleccionar una fecha'
    }

    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      return 'No se pueden configurar horarios para fechas pasadas'
    }

    if (formData.isOpen) {
      if (!formData.openTime || !formData.closeTime) {
        return 'Debe especificar horarios de apertura y cierre'
      }
      if (!scheduleUtils.validateWorkingHours(formData.openTime, formData.closeTime)) {
        return 'La hora de apertura debe ser anterior a la de cierre'
      }
    }

    if (!formData.reason.trim()) {
      return 'Debe especificar una razón para el horario especial'
    }

    return null
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const validationError = validateForm()
      if (validationError) {
        setError(validationError)
        return
      }

      const data = {
        date: formData.date,
        isOpen: formData.isOpen,
        openTime: formData.isOpen ? formData.openTime : undefined,
        closeTime: formData.isOpen ? formData.closeTime : undefined,
        reason: formData.reason,
        description: formData.description || undefined
      }

      let response
      if (editingHour) {
        // Actualizar horario especial existente
        response = await scheduleService.updateSpecialHour(brandId, editingHour.id, data)
      } else {
        // Crear nuevo horario especial
        response = await scheduleService.createSpecialHour(brandId, data)
      }

      if (response.success) {
        setSuccess(editingHour ? 'Horario especial actualizado' : 'Horario especial creado')
        handleCloseDialog()
        loadSpecialHours() // Recargar lista
      } else {
        setError(response.errors?.[0]?.description || 'Error guardando horario especial')
      }

    } catch (error: any) {
      console.error('Error saving special hour:', error)
      setError('Error guardando horario especial')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (specialHourId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este horario especial?')) {
      return
    }

    try {
      const response = await scheduleService.deleteSpecialHour(brandId, specialHourId)
      
      if (response.success) {
        setSuccess('Horario especial eliminado')
        loadSpecialHours() // Recargar lista
      } else {
        setError(response.errors?.[0]?.description || 'Error eliminando horario especial')
      }
    } catch (error) {
      console.error('Error deleting special hour:', error)
      setError('Error eliminando horario especial')
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTypeColor = (
    type: string
  ): "destructive" | "secondary" | "outline" | "default" => {
    switch (type) {
      case 'closed':
      case 'Cerrado':
        return 'destructive'
      case 'holiday':
      case 'Día Festivo':
        return 'secondary'
      case 'vacation':
      case 'Vacaciones':
        return 'outline'
      default:
        return 'default'
    }
  }

  // Generar opciones de hora
  const timeOptions = scheduleUtils.generateHourOptions(6, 23, 30)

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Horarios Especiales
              </CardTitle>
              <CardDescription>
                Configura excepciones a tus horarios regulares (días festivos, vacaciones, etc.)
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Excepción
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingHour ? 'Editar Horario Especial' : 'Nuevo Horario Especial'}
                  </DialogTitle>
                  <DialogDescription>
                    Configura un horario especial para una fecha específica
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de excepción</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleFormChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SPECIAL_HOUR_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Razón</Label>
                    <Input
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => handleFormChange('reason', e.target.value)}
                      placeholder="Ej: Día festivo, Vacaciones personales..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>¿Estará abierto este día?</Label>
                      <p className="text-sm text-muted-foreground">
                        Active si tendrá horarios especiales
                      </p>
                    </div>
                    <Switch
                      checked={formData.isOpen}
                      onCheckedChange={(checked) => handleFormChange('isOpen', checked)}
                    />
                  </div>

                  {formData.isOpen && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="openTime">Hora de apertura</Label>
                        <Select
                          value={formData.openTime}
                          onValueChange={(value) => handleFormChange('openTime', value)}
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

                      <div className="space-y-2">
                        <Label htmlFor="closeTime">Hora de cierre</Label>
                        <Select
                          value={formData.closeTime}
                          onValueChange={(value) => handleFormChange('closeTime', value)}
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
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción adicional (opcional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Información adicional sobre este horario especial..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Guardando...' : editingHour ? 'Actualizar' : 'Crear'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground">Cargando horarios especiales...</p>
              </div>
            </div>
          ) : specialHours.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hay horarios especiales</h3>
              <p className="text-muted-foreground mb-4">
                Aún no has configurado ningún horario especial o excepción.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primer Horario Especial
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {specialHours
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((hour) => (
                  <div
                    key={hour.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{formatDate(hour.date)}</h4>
                        <Badge variant={getTypeColor(hour.reason || '')}>
                          {hour.reason || 'Horario especial'}
                        </Badge>
                        {hour.isOpen ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Abierto
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Cerrado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {hour.isOpen ? (
                          <span>
                            Horario: {scheduleUtils.formatTime(hour.openTime || '00:00')} - {scheduleUtils.formatTime(hour.closeTime || '00:00')}
                          </span>
                        ) : (
                          <span>Establecimiento cerrado todo el día</span>
                        )}
                      </div>
                      
                      {hour.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {hour.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(hour)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(hour.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vista previa de próximos horarios especiales */}
      {specialHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Horarios Especiales</CardTitle>
            <CardDescription>
              Vista rápida de las próximas excepciones programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialHours
                .filter(hour => new Date(hour.date) >= new Date())
                .slice(0, 6)
                .map((hour) => (
                  <div
                    key={hour.id}
                    className="p-3 border rounded-lg text-center"
                  >
                    <div className="font-medium mb-1">
                      {new Date(hour.date).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <Badge variant={getTypeColor(hour.reason || '')} className="mb-2">
                      {hour.reason}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {hour.isOpen ? (
                        <>
                          {scheduleUtils.formatTime(hour.openTime || '00:00')}<br />
                          {scheduleUtils.formatTime(hour.closeTime || '00:00')}
                        </>
                      ) : (
                        'Cerrado'
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}