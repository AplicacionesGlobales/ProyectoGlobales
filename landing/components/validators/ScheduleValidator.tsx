// landing\components\validators\ScheduleValidator.tsx
import React, { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Clock, Calendar, XCircle, Info } from "lucide-react"
import { scheduleValidatorService, ValidationResult } from "@/services/schedule-validator.service"

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

  useEffect(() => {
    if (selectedDate && selectedTime) {
      validateSchedule()
    } else {
      resetValidation()
    }
  }, [selectedDate, selectedTime, selectedServiceId])

  const resetValidation = () => {
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

  const validateSchedule = async () => {
    if (!selectedDate || !selectedTime) return

    setIsValidating(true)
    
    try {
      let serviceDuration: number | undefined = undefined
      
      if (selectedServiceId) {
        const selectedService = serviceTypes.find(s => s.id === selectedServiceId)
        if (selectedService) {
          serviceDuration = selectedService.duration
        }
      }

      const result = await scheduleValidatorService.validateCompleteSchedule(
        brandId,
        selectedDate,
        selectedTime,
        serviceDuration
      )

      setValidationResult(result)
      onValidationChange(result)

    } catch (error) {
      console.error('Error validating schedule:', error)
      
      const errorResult: ValidationResult = {
        isValid: false,
        hasConflicts: false,
        hasBusinessHourConflict: false,
        conflicts: [],
        suggestions: ['Error validando horario'],
        warnings: []
      }
      
      setValidationResult(errorResult)
      onValidationChange(errorResult)
    } finally {
      setIsValidating(false)
    }
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } catch {
      return timeString
    }
  }

  const getConflictTypeText = (type: string) => {
    const typeTexts: Record<string, string> = {
      'overlap': 'Solapamiento',
      'adjacent': 'Adyacente', 
      'business_hours': 'Fuera de horario'
    }
    return typeTexts[type] || type
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
          {/* Estado general */}
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
                  {validationResult.isValid ? 'Horario disponible' : 'Conflicto detectado'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Conflictos */}
          {validationResult.conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Conflictos encontrados:</p>
                  {validationResult.conflicts.map((conflict, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>{scheduleValidatorService.getReasonText(conflict.clientName)}</span>
                      <Badge variant="destructive" className="text-xs">
                        {getConflictTypeText(conflict.type)}
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