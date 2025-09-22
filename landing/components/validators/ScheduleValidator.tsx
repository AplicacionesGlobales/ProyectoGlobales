// landing\components\validators\ScheduleValidator.tsx
import React, { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar,
  XCircle,
  Info
} from "lucide-react"

// Tipos para el validador
interface ValidationResult {
  isValid: boolean
  hasConflicts: boolean
  hasBusinessHourConflict: boolean
  conflicts: ConflictInfo[]
  suggestions: string[]
  warnings: string[]
}

interface ConflictInfo {
  id: number
  startTime: string
  endTime: string
  clientName: string
  type: 'overlap' | 'adjacent' | 'business_hours'
}

interface ScheduleValidatorProps {
  selectedDate?: string
  selectedTime?: string
  selectedServiceId?: number | null
  serviceTypes: Array<{
    id: number
    name: string
    duration: number
  }>
  brandId: number
  onValidationChange: (result: ValidationResult) => void
  className?: string
}

export const ScheduleValidator: React.FC<ScheduleValidatorProps> = ({
  selectedDate,
  selectedTime,
  selectedServiceId,
  serviceTypes,
  brandId,
  onValidationChange,
  className = ""
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    hasConflicts: false,
    hasBusinessHourConflict: false,
    conflicts: [],
    suggestions: [],
    warnings: []
  })
  const [isValidating, setIsValidating] = useState(false)

  // Validar horarios cuando cambian los datos
  useEffect(() => {
    if (selectedDate && selectedTime) {
      validateSchedule()
    } else {
      // Reset validation si faltan datos
      const emptyResult: ValidationResult = {
        isValid: true,
        hasConflicts: false,
        hasBusinessHourConflict: false,
        conflicts: [],
        suggestions: [],
        warnings: []
      }
      setValidationResult(emptyResult)
      onValidationChange(emptyResult)
    }
  }, [selectedDate, selectedTime, selectedServiceId])

  const validateSchedule = async () => {
    if (!selectedDate || !selectedTime) return

    setIsValidating(true)
    
    try {
      // Obtener duración del servicio seleccionado (si hay uno)
      let serviceDuration = 30 // duración por defecto de 30 minutos
      let selectedService = null
      
      if (selectedServiceId) {
        selectedService = serviceTypes.find(s => s.id === selectedServiceId)
        if (selectedService) {
          serviceDuration = selectedService.duration
        }
      }

      // Crear datetime completo
      const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`)
      const endDateTime = new Date(startDateTime.getTime() + (serviceDuration * 60000))

      // Ejecutar validaciones
      const conflicts = await checkAppointmentConflicts(startDateTime, endDateTime)
      const businessHourCheck = checkBusinessHours(startDateTime, endDateTime)
      const timeValidation = checkTimeValidation(startDateTime)
      
      const result: ValidationResult = {
        isValid: conflicts.length === 0 && businessHourCheck.isValid && timeValidation.isValid,
        hasConflicts: conflicts.length > 0,
        hasBusinessHourConflict: !businessHourCheck.isValid,
        conflicts: conflicts,
        suggestions: [
          ...getSuggestions(conflicts, startDateTime),
          ...businessHourCheck.suggestions,
          ...timeValidation.suggestions
        ],
        warnings: [
          ...getWarnings(startDateTime, selectedService),
          ...businessHourCheck.warnings,
          ...timeValidation.warnings
        ]
      }

      setValidationResult(result)
      onValidationChange(result)

    } catch (error) {
      console.error('Error validating schedule:', error)
      
      const errorResult: ValidationResult = {
        isValid: false,
        hasConflicts: false,
        hasBusinessHourConflict: false,
        conflicts: [],
        suggestions: [],
        warnings: ['Error validando horario. Intente nuevamente.']
      }
      
      setValidationResult(errorResult)
      onValidationChange(errorResult)
    } finally {
      setIsValidating(false)
    }
  }

  // Simular verificación de conflictos con citas existentes
  // En producción, esto haría una llamada al API
  const checkAppointmentConflicts = async (startTime: Date, endTime: Date): Promise<ConflictInfo[]> => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Ejemplo de conflictos simulados
    const mockConflicts: ConflictInfo[] = []
    
    // Simular conflicto si es entre 2:00 PM y 3:00 PM
    if (startTime.getHours() >= 14 && startTime.getHours() < 15) {
      mockConflicts.push({
        id: 1,
        startTime: '2024-01-15T14:30:00',
        endTime: '2024-01-15T15:00:00',
        clientName: 'María González',
        type: 'overlap'
      })
    }

    return mockConflicts
  }

  // Validar horarios de negocio
  const checkBusinessHours = (startTime: Date, endTime: Date) => {
    const hour = startTime.getHours()
    const endHour = endTime.getHours()
    const minute = endTime.getMinutes()
    
    const businessStart = 8 // 8:00 AM
    const businessEnd = 18 // 6:00 PM
    
    const isValid = hour >= businessStart && (endHour < businessEnd || (endHour === businessEnd && minute === 0))
    
    return {
      isValid,
      suggestions: isValid ? [] : ['Seleccione un horario dentro del horario de atención (8:00 AM - 6:00 PM)'],
      warnings: []
    }
  }

  // Validaciones de tiempo general
  const checkTimeValidation = (startTime: Date) => {
    const now = new Date()
    const suggestions: string[] = []
    const warnings: string[] = []
    
    // No permitir citas en el pasado
    if (startTime < now) {
      suggestions.push('No se pueden crear citas en el pasado')
    }
    
    // Advertir si es muy pronto (menos de 1 hora)
    const oneHourFromNow = new Date(now.getTime() + (60 * 60000))
    if (startTime < oneHourFromNow && startTime > now) {
      warnings.push('La cita es en menos de 1 hora')
    }
    
    // Advertir si es en fin de semana
    const dayOfWeek = startTime.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      warnings.push('Esta cita es en fin de semana')
    }
    
    return {
      isValid: startTime >= now,
      suggestions,
      warnings
    }
  }

  // Generar sugerencias basadas en conflictos
  const getSuggestions = (conflicts: ConflictInfo[], requestedTime: Date): string[] => {
    if (conflicts.length === 0) return []
    
    const suggestions = ['Horarios alternativos sugeridos:']
    
    // Sugerir 30 minutos antes
    const before = new Date(requestedTime.getTime() - (30 * 60000))
    suggestions.push(`${before.getHours().toString().padStart(2, '0')}:${before.getMinutes().toString().padStart(2, '0')}`)
    
    // Sugerir 30 minutos después
    const after = new Date(requestedTime.getTime() + (30 * 60000))
    suggestions.push(`${after.getHours().toString().padStart(2, '0')}:${after.getMinutes().toString().padStart(2, '0')}`)
    
    return suggestions
  }

  // Generar advertencias
  const getWarnings = (startTime: Date, service: any): string[] => {
    const warnings: string[] = []
    
    // Solo advertir sobre servicios largos si hay un servicio seleccionado
    if (service && service.duration > 60) {
      const endTime = new Date(startTime.getTime() + (service.duration * 60000))
      if (endTime.getHours() >= 17) {
        warnings.push(`Servicio de ${service.duration} min puede extenderse hasta después del horario normal`)
      }
    } else if (!service) {
      // Advertencia cuando no hay servicio seleccionado
      warnings.push('No se ha especificado tipo de servicio. Se usará duración estándar de 30 minutos.')
    }
    
    return warnings
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } catch {
      return timeString
    }
  }

  if (!selectedDate || !selectedTime) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {isValidating && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700">Validando horario...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!isValidating && (
        <>
          {/* Estado general de validación */}
          <Card className={`border ${
            validationResult.isValid 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  validationResult.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {validationResult.isValid 
                    ? 'Horario disponible' 
                    : 'Conflicto detectado'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Conflictos específicos */}
          {validationResult.conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Conflictos encontrados:</p>
                  {validationResult.conflicts.map((conflict, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatTime(conflict.startTime)} - {formatTime(conflict.endTime)}: {conflict.clientName}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {conflict.type === 'overlap' ? 'Solapamiento' : 'Adyacente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Sugerencias */}
          {validationResult.suggestions.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <p key={index} className="text-sm">{suggestion}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Advertencias */}
          {validationResult.warnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <p key={index} className="text-sm text-yellow-700">{warning}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}