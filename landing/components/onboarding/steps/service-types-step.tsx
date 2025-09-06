"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Plus, Trash2, Clock, DollarSign, Palette, FileText, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ServiceType {
  name: string
  description?: string
  duration: number
  price?: number
  color?: string
  icon?: string
}

interface ServiceTypesStepProps {
  appointmentSettings: {
    useServiceTypes: boolean
    defaultDuration: number
    serviceTypes: ServiceType[]
  }
  businessType: string
  onChange: (settings: any) => void
  onNext: () => void
  onPrev: () => void
}

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
]

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120]

const SERVICE_ICONS = [
  { value: "scissors", label: "✂️ Tijeras" },
  { value: "calendar", label: "📅 Calendario" },
  { value: "camera", label: "📷 Cámara" },
  { value: "brush", label: "🎨 Pincel" },
  { value: "star", label: "⭐ Estrella" },
  { value: "heart", label: "❤️ Corazón" },
  { value: "tool", label: "🔧 Herramienta" },
  { value: "book", label: "📚 Libro" },
]

// Sugerencias predefinidas por tipo de negocio
const SERVICE_SUGGESTIONS: Record<string, ServiceType[]> = {
  barberia: [
    { name: "Corte de Cabello", duration: 30, price: 15000, color: "#3B82F6", icon: "scissors" },
    { name: "Arreglo de Barba", duration: 15, price: 8000, color: "#10B981", icon: "scissors" },
    { name: "Corte + Barba", duration: 45, price: 20000, color: "#8B5CF6", icon: "star" },
  ],
  belleza: [
    { name: "Manicure", duration: 45, price: 20000, color: "#EC4899", icon: "brush" },
    { name: "Pedicure", duration: 60, price: 25000, color: "#F59E0B", icon: "brush" },
    { name: "Uñas Acrílicas", duration: 90, price: 35000, color: "#8B5CF6", icon: "star" },
  ],
  medico: [
    { name: "Consulta General", duration: 30, price: 50000, color: "#3B82F6", icon: "heart" },
    { name: "Consulta Especializada", duration: 45, price: 70000, color: "#10B981", icon: "star" },
    { name: "Chequeo Completo", duration: 60, price: 100000, color: "#6366F1", icon: "calendar" },
  ],
  fotografo: [
    { name: "Sesión Retrato", duration: 60, price: 80000, color: "#3B82F6", icon: "camera" },
    { name: "Sesión Eventos", duration: 120, price: 150000, color: "#F59E0B", icon: "camera" },
    { name: "Edición Digital", duration: 30, price: 40000, color: "#8B5CF6", icon: "brush" },
  ],
}

export function ServiceTypesStep({ 
  appointmentSettings, 
  businessType,
  onChange, 
  onNext, 
  onPrev 
}: ServiceTypesStepProps) {
  const [useServiceTypes, setUseServiceTypes] = useState(appointmentSettings.useServiceTypes)
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(
    appointmentSettings.serviceTypes.length > 0 
      ? appointmentSettings.serviceTypes 
      : []
  )
  const [defaultDuration, setDefaultDuration] = useState(appointmentSettings.defaultDuration)
  const [errors, setErrors] = useState<Record<number, string>>({})

  // Auto-sugerir servicios basados en el tipo de negocio
  useEffect(() => {
    if (serviceTypes.length === 0 && businessType && SERVICE_SUGGESTIONS[businessType]) {
      setServiceTypes(SERVICE_SUGGESTIONS[businessType])
      setUseServiceTypes(true)
    }
  }, [businessType])

  const handleUseServiceTypesChange = (checked: boolean) => {
    setUseServiceTypes(checked)
    if (checked && serviceTypes.length === 0) {
      // Agregar un servicio por defecto
      setServiceTypes([{
        name: "Servicio General",
        duration: defaultDuration,
        color: PRESET_COLORS[0]
      }])
    }
  }

  const addServiceType = () => {
    setServiceTypes([...serviceTypes, {
      name: "",
      duration: defaultDuration,
      color: PRESET_COLORS[serviceTypes.length % PRESET_COLORS.length]
    }])
  }

  const removeServiceType = (index: number) => {
    setServiceTypes(serviceTypes.filter((_, i) => i !== index))
    const newErrors = { ...errors }
    delete newErrors[index]
    setErrors(newErrors)
  }

  const updateServiceType = (index: number, field: keyof ServiceType, value: any) => {
    const updated = [...serviceTypes]
    updated[index] = { ...updated[index], [field]: value }
    setServiceTypes(updated)

    // Validar duración
    if (field === 'duration' && value % 15 !== 0) {
      setErrors({ ...errors, [index]: 'La duración debe ser múltiplo de 15 minutos' })
    } else if (field === 'duration') {
      const newErrors = { ...errors }
      delete newErrors[index]
      setErrors(newErrors)
    }
  }

  const validateAndNext = () => {
    if (useServiceTypes) {
      // Validar que todos los servicios tengan nombre
      const hasEmptyNames = serviceTypes.some(st => !st.name.trim())
      if (hasEmptyNames) {
        alert("Todos los servicios deben tener un nombre")
        return
      }

      // Validar duraciones
      const hasInvalidDurations = serviceTypes.some(st => st.duration % 15 !== 0)
      if (hasInvalidDurations) {
        alert("Todas las duraciones deben ser múltiplos de 15 minutos")
        return
      }
    }

    onChange({
      appointmentSettings: {
        useServiceTypes,
        defaultDuration,
        serviceTypes: useServiceTypes ? serviceTypes : []
      }
    })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Configuración de Servicios</h2>
        <p className="mt-2 text-gray-600">
          Define los tipos de servicios que ofreces y sus características
        </p>
      </div>

      {/* Switch para habilitar tipos de servicio */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="use-service-types" className="text-base font-medium">
              Usar tipos de servicio personalizados
            </Label>
            <p className="text-sm text-gray-500">
              Permite a tus clientes elegir entre diferentes servicios con duraciones y precios específicos
            </p>
          </div>
          <Switch
            id="use-service-types"
            checked={useServiceTypes}
            onCheckedChange={handleUseServiceTypesChange}
          />
        </div>

        {!useServiceTypes && (
          <div className="mt-4 pt-4 border-t">
            <Label htmlFor="default-duration">Duración por defecto (minutos)</Label>
            <Select
              value={defaultDuration.toString()}
              onValueChange={(value) => setDefaultDuration(parseInt(value))}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(duration => (
                  <SelectItem key={duration} value={duration.toString()}>
                    {duration} minutos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </Card>

      {/* Lista de tipos de servicio */}
      {useServiceTypes && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tus Servicios</h3>
            <Button
              type="button"
              onClick={addServiceType}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar Servicio
            </Button>
          </div>

          {serviceTypes.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No has agregado ningún servicio aún</p>
              <Button
                type="button"
                onClick={addServiceType}
                variant="default"
                className="mt-4"
              >
                Agregar tu primer servicio
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {serviceTypes.map((service, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 grid gap-4 md:grid-cols-2">
                        {/* Nombre del servicio */}
                        <div>
                          <Label htmlFor={`name-${index}`}>
                            Nombre del servicio <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`name-${index}`}
                            value={service.name}
                            onChange={(e) => updateServiceType(index, 'name', e.target.value)}
                            placeholder="Ej: Corte de cabello"
                            className="mt-1"
                            required
                          />
                        </div>

                        {/* Duración */}
                        <div>
                          <Label htmlFor={`duration-${index}`} className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Duración (minutos) <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={service.duration.toString()}
                            onValueChange={(value) => updateServiceType(index, 'duration', parseInt(value))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DURATION_OPTIONS.map(duration => (
                                <SelectItem key={duration} value={duration.toString()}>
                                  {duration} minutos
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[index] && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                              <AlertCircle className="w-3 h-3" />
                              {errors[index]}
                            </div>
                          )}
                        </div>

                        {/* Precio */}
                        <div>
                          <Label htmlFor={`price-${index}`} className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Precio (opcional)
                          </Label>
                          <Input
                            id={`price-${index}`}
                            type="number"
                            value={service.price || ''}
                            onChange={(e) => updateServiceType(index, 'price', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Ej: 15000"
                            className="mt-1"
                          />
                        </div>

                        {/* Color */}
                        <div>
                          <Label htmlFor={`color-${index}`} className="flex items-center gap-1">
                            <Palette className="w-4 h-4" />
                            Color
                          </Label>
                          <div className="flex gap-2 mt-2">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => updateServiceType(index, 'color', color)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  service.color === color 
                                    ? 'border-gray-900 scale-110' 
                                    : 'border-gray-300 hover:border-gray-500'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Descripción */}
                        <div className="md:col-span-2">
                          <Label htmlFor={`description-${index}`}>
                            Descripción (opcional)
                          </Label>
                          <Textarea
                            id={`description-${index}`}
                            value={service.description || ''}
                            onChange={(e) => updateServiceType(index, 'description', e.target.value)}
                            placeholder="Describe brevemente este servicio..."
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                      </div>

                      {/* Botón eliminar */}
                      <Button
                        type="button"
                        onClick={() => removeServiceType(index)}
                        variant="ghost"
                        size="sm"
                        className="ml-4 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Resumen de servicios */}
          {serviceTypes.length > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {serviceTypes.length} {serviceTypes.length === 1 ? 'servicio' : 'servicios'} configurados
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Los clientes podrán elegir entre estos servicios al agendar
                  </p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {serviceTypes.reduce((total, s) => total + s.duration, 0)} min total
                </Badge>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Navegación */}
      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button onClick={validateAndNext} className="flex items-center gap-2">
          Continuar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}