// components/panel/schedule/ScheduleConfig.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Settings, Save, RefreshCw, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import { scheduleService, BusinessHour, AppointmentSettings } from "@/services/schedule.service"
import { 
  DayOfWeek, 
  DAY_NAMES, 
  SCHEDULE_TEMPLATES, 
  scheduleUtils,
  DaySchedule 
} from "@/types/schedule.types"

interface ScheduleConfigProps {
  brandId: number
}

interface ScheduleFormData {
  businessHours: DaySchedule[]
  appointmentSettings: {
    defaultDuration: number
    bufferTime: number
    maxAdvanceBookingDays: number
    minAdvanceBookingHours: number
    allowSameDayBooking: boolean
  }
}

export function ScheduleConfig({ brandId }: ScheduleConfigProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ScheduleFormData>({
    businessHours: scheduleUtils.getAllDays(),
    appointmentSettings: {
      defaultDuration: 30,
      bufferTime: 5,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 2,
      allowSameDayBooking: true
    }
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadScheduleData()
  }, [brandId])

  const loadScheduleData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar horarios de negocio y configuración de citas en paralelo
      const [businessHoursResponse, settingsResponse] = await Promise.all([
        scheduleService.getBusinessHours(brandId),
        scheduleService.getAppointmentSettings(brandId)
      ])

      // Procesar horarios de negocio
      let businessHours = scheduleUtils.getAllDays()
      if (businessHoursResponse.success && businessHoursResponse.data) {
        const apiHours = businessHoursResponse.data
        businessHours = businessHours.map(day => {
          const apiDay = apiHours.find(h => h.dayOfWeek === day.dayOfWeek)
          return {
            ...day,
            isOpen: apiDay?.isOpen || false,
            openTime: apiDay?.openTime,
            closeTime: apiDay?.closeTime
          }
        })
      }

      // Procesar configuración de citas
      let appointmentSettings = formData.appointmentSettings
      if (settingsResponse.success && settingsResponse.data) {
        appointmentSettings = {
          defaultDuration: settingsResponse.data.defaultDuration,
          bufferTime: settingsResponse.data.bufferTime,
          maxAdvanceBookingDays: settingsResponse.data.maxAdvanceBookingDays,
          minAdvanceBookingHours: settingsResponse.data.minAdvanceBookingHours,
          allowSameDayBooking: settingsResponse.data.allowSameDayBooking
        }
      }

      setFormData({
        businessHours,
        appointmentSettings
      })

    } catch (error) {
      console.error('Error loading schedule data:', error)
      setError('Error cargando la configuración de horarios')
    } finally {
      setLoading(false)
    }
  }

  const handleDayToggle = (dayOfWeek: DayOfWeek, isOpen: boolean) => {
    setFormData(prev => ({
      ...prev,
      businessHours: prev.businessHours.map(day =>
        day.dayOfWeek === dayOfWeek ? { ...day, isOpen } : day
      )
    }))
  }

  const handleTimeChange = (dayOfWeek: DayOfWeek, field: 'openTime' | 'closeTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      businessHours: prev.businessHours.map(day =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
      )
    }))
  }

  const handleSettingsChange = (field: keyof ScheduleFormData['appointmentSettings'], value: any) => {
    setFormData(prev => ({
      ...prev,
      appointmentSettings: {
        ...prev.appointmentSettings,
        [field]: value
      }
    }))
  }

  const applyTemplate = (templateKey: keyof typeof SCHEDULE_TEMPLATES) => {
    const template = SCHEDULE_TEMPLATES[templateKey]
    setFormData(prev => ({
      ...prev,
      businessHours: scheduleUtils.getAllDays().map(day => {
        const templateDay = template.schedule.find(t => t.dayOfWeek === day.dayOfWeek)
        return {
          ...day,
          isOpen: templateDay?.isOpen || false,
          openTime: templateDay?.openTime,
          closeTime: templateDay?.closeTime
        }
      })
    }))
  }

  const validateForm = (): string | null => {
    // Validar que los días abiertos tengan horarios válidos
    for (const day of formData.businessHours) {
      if (day.isOpen) {
        if (!day.openTime || !day.closeTime) {
          return `${day.dayName}: Debe especificar hora de apertura y cierre`
        }
        if (!scheduleUtils.isValidTimeFormat(day.openTime) || !scheduleUtils.isValidTimeFormat(day.closeTime)) {
          return `${day.dayName}: Formato de hora inválido`
        }
        if (!scheduleUtils.validateWorkingHours(day.openTime, day.closeTime)) {
          return `${day.dayName}: La hora de apertura debe ser anterior a la de cierre`
        }
      }
    }

    // Validar configuración de citas
    const settings = formData.appointmentSettings
    if (settings.defaultDuration < 15 || settings.defaultDuration > 480) {
      return 'La duración por defecto debe estar entre 15 y 480 minutos'
    }
    if (settings.bufferTime < 0 || settings.bufferTime > 60) {
      return 'El tiempo de buffer debe estar entre 0 y 60 minutos'
    }
    if (settings.maxAdvanceBookingDays < 1 || settings.maxAdvanceBookingDays > 365) {
      return 'Los días máximos de anticipación deben estar entre 1 y 365'
    }
    if (settings.minAdvanceBookingHours < 0 || settings.minAdvanceBookingHours > 168) {
      return 'Las horas mínimas de anticipación deben estar entre 0 y 168'
    }

    return null
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Validar formulario
      const validationError = validateForm()
      if (validationError) {
        setError(validationError)
        return
      }

      // Preparar datos para la API
      const businessHoursData = formData.businessHours.map(day => ({
        dayOfWeek: day.dayOfWeek,
        isOpen: day.isOpen,
        openTime: day.isOpen ? day.openTime : undefined,
        closeTime: day.isOpen ? day.closeTime : undefined
      }))

      // Guardar horarios de negocio y configuración en paralelo
      const [businessHoursResponse, settingsResponse] = await Promise.all([
        scheduleService.updateBusinessHours(brandId, businessHoursData),
        scheduleService.updateAppointmentSettings(brandId, formData.appointmentSettings)
      ])

      // Verificar respuestas
      if (!businessHoursResponse.success) {
        throw new Error(businessHoursResponse.errors?.[0]?.description || 'Error actualizando horarios')
      }

      if (!settingsResponse.success) {
        throw new Error(settingsResponse.errors?.[0]?.description || 'Error actualizando configuración')
      }

      setSuccess('Configuración de horarios guardada exitosamente')

      // Recargar datos para confirmar cambios
      setTimeout(() => {
        loadScheduleData()
      }, 1000)

    } catch (error: any) {
      console.error('Error saving schedule:', error)
      setError(error.message || 'Error guardando la configuración')
    } finally {
      setSaving(false)
    }
  }

  // Generar opciones de hora
  const timeOptions = scheduleUtils.generateHourOptions(6, 23, 30)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Cargando configuración...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

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

      {/* Templates de horarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Plantillas Predefinidas
          </CardTitle>
          <CardDescription>
            Aplica plantillas comunes para configurar rápidamente tus horarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(SCHEDULE_TEMPLATES).map(([key, template]) => (
              <div key={key} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{template.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => applyTemplate(key as keyof typeof SCHEDULE_TEMPLATES)}
                  className="w-full"
                >
                  Aplicar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Horarios por día */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios de Trabajo
          </CardTitle>
          <CardDescription>
            Configura los horarios de atención para cada día de la semana
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.businessHours.map((day) => (
            <div key={day.dayOfWeek} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={day.isOpen}
                  onCheckedChange={(checked) => handleDayToggle(day.dayOfWeek, checked)}
                />
                <Label className="w-20 font-medium">{day.dayName}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                {day.isOpen ? (
                  <>
                    <Select
                      value={day.openTime || ''}
                      onValueChange={(value) => handleTimeChange(day.dayOfWeek, 'openTime', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Inicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>
                            {scheduleUtils.formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <span className="text-muted-foreground">-</span>
                    
                    <Select
                      value={day.closeTime || ''}
                      onValueChange={(value) => handleTimeChange(day.dayOfWeek, 'closeTime', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Fin" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>
                            {scheduleUtils.formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {day.openTime && day.closeTime && (
                      <Badge variant="secondary" className="ml-2">
                        {scheduleUtils.calculateDuration(day.openTime, day.closeTime)} min
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">Cerrado</span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Configuración de citas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configuración de Citas
          </CardTitle>
          <CardDescription>
            Configura los parámetros generales para las citas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultDuration">Duración por defecto (minutos)</Label>
              <Input
                id="defaultDuration"
                type="number"
                min="15"
                max="480"
                value={formData.appointmentSettings.defaultDuration}
                onChange={(e) => handleSettingsChange('defaultDuration', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bufferTime">Tiempo de buffer (minutos)</Label>
              <Input
                id="bufferTime"
                type="number"
                min="0"
                max="60"
                value={formData.appointmentSettings.bufferTime}
                onChange={(e) => handleSettingsChange('bufferTime', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxAdvanceBookingDays">Máximo días de anticipación</Label>
              <Input
                id="maxAdvanceBookingDays"
                type="number"
                min="1"
                max="365"
                value={formData.appointmentSettings.maxAdvanceBookingDays}
                onChange={(e) => handleSettingsChange('maxAdvanceBookingDays', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minAdvanceBookingHours">Mínimo horas de anticipación</Label>
              <Input
                id="minAdvanceBookingHours"
                type="number"
                min="0"
                max="168"
                value={formData.appointmentSettings.minAdvanceBookingHours}
                onChange={(e) => handleSettingsChange('minAdvanceBookingHours', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Permitir reservas el mismo día</Label>
              <p className="text-sm text-muted-foreground">
                Los clientes pueden agendar citas para el día actual
              </p>
            </div>
            <Switch
              checked={formData.appointmentSettings.allowSameDayBooking}
              onCheckedChange={(checked) => handleSettingsChange('allowSameDayBooking', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  )
}