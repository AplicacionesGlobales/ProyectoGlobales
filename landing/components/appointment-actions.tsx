"use client"

import { useState } from "react"
import { Check, X, Clock, PlayCircle, UserX, MoreVertical, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AppointmentStatus, APPOINTMENT_STATUS_LABELS } from "@/services/appointment.service"

interface AppointmentActionsProps {
  appointmentId: number
  currentStatus: AppointmentStatus | string
  onStatusChange: (id: number, newStatus: string) => Promise<void> | void
}

const statusColors: Record<string, string> = {
  [AppointmentStatus.CONFIRMED]: "bg-blue-100 text-blue-800 border-blue-200",
  [AppointmentStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [AppointmentStatus.IN_PROGRESS]: "bg-green-100 text-green-800 border-green-200",
  [AppointmentStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
  [AppointmentStatus.COMPLETED]: "bg-gray-100 text-gray-800 border-gray-200",
  [AppointmentStatus.NO_SHOW]: "bg-orange-100 text-orange-800 border-orange-200",
}

const statusIcons: Record<string, React.ReactNode> = {
  [AppointmentStatus.CONFIRMED]: <Check className="h-3 w-3" />,
  [AppointmentStatus.PENDING]: <Clock className="h-3 w-3" />,
  [AppointmentStatus.IN_PROGRESS]: <PlayCircle className="h-3 w-3" />,
  [AppointmentStatus.CANCELLED]: <X className="h-3 w-3" />,
  [AppointmentStatus.COMPLETED]: <Check className="h-3 w-3" />,
  [AppointmentStatus.NO_SHOW]: <UserX className="h-3 w-3" />,
}

export function AppointmentActions({ appointmentId, currentStatus, onStatusChange }: AppointmentActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await onStatusChange(appointmentId, newStatus)
    } catch (error) {
      console.error("Error updating appointment status:", error)
      setError("Error al actualizar el estado")
      // Revertir visualmente después de 3 segundos
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  // Asegurar que currentStatus es un string válido
  const status = currentStatus as AppointmentStatus

  // Determinar qué acciones rápidas mostrar según el estado actual
  const getQuickActions = () => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(AppointmentStatus.CONFIRMED)}
              disabled={isLoading}
              className="h-8 w-8 p-0 border-blue-200 hover:bg-blue-50"
              title="Confirmar cita"
            >
              <Check className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(AppointmentStatus.CANCELLED)}
              disabled={isLoading}
              className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
              title="Cancelar cita"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      
      case AppointmentStatus.CONFIRMED:
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(AppointmentStatus.IN_PROGRESS)}
              disabled={isLoading}
              className="h-8 px-3 border-green-200 hover:bg-green-50"
              title="Iniciar cita"
            >
              <PlayCircle className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 text-xs">Iniciar</span>
            </Button>
          </div>
        )
      
      case AppointmentStatus.IN_PROGRESS:
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(AppointmentStatus.COMPLETED)}
              disabled={isLoading}
              className="h-8 px-3 border-gray-200 hover:bg-gray-50"
              title="Completar cita"
            >
              <Check className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-gray-600 text-xs">Completar</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(AppointmentStatus.NO_SHOW)}
              disabled={isLoading}
              className="h-8 w-8 p-0 border-orange-200 hover:bg-orange-50"
              title="Cliente no se presentó"
            >
              <UserX className="h-4 w-4 text-orange-600" />
            </Button>
          </div>
        )
      
      default:
        return null
    }
  }

  // Determinar qué opciones mostrar en el dropdown según el estado actual
  const getDropdownOptions = () => {
    const options: React.ReactNode[] = []
    
    // No permitir cambios desde estados finales (COMPLETED, CANCELLED, NO_SHOW)
    if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW].includes(status)) {
      return options
    }

    // Opciones disponibles según el estado actual
    if (status !== AppointmentStatus.CONFIRMED) {
      options.push(
        <DropdownMenuItem 
          key="confirm"
          onClick={() => handleStatusChange(AppointmentStatus.CONFIRMED)}
          disabled={isLoading}
        >
          <Check className="h-4 w-4 mr-2 text-blue-600" />
          Confirmar
        </DropdownMenuItem>
      )
    }

    if (status === AppointmentStatus.CONFIRMED || status === AppointmentStatus.PENDING) {
      options.push(
        <DropdownMenuItem 
          key="in-progress"
          onClick={() => handleStatusChange(AppointmentStatus.IN_PROGRESS)}
          disabled={isLoading}
        >
          <PlayCircle className="h-4 w-4 mr-2 text-green-600" />
          Iniciar
        </DropdownMenuItem>
      )
    }

    if (status === AppointmentStatus.IN_PROGRESS || status === AppointmentStatus.CONFIRMED) {
      options.push(
        <DropdownMenuItem 
          key="complete"
          onClick={() => handleStatusChange(AppointmentStatus.COMPLETED)}
          disabled={isLoading}
        >
          <Check className="h-4 w-4 mr-2 text-gray-600" />
          Completar
        </DropdownMenuItem>
      )
    }

    if (status === AppointmentStatus.IN_PROGRESS || status === AppointmentStatus.CONFIRMED) {
      options.push(
        <DropdownMenuItem 
          key="no-show"
          onClick={() => handleStatusChange(AppointmentStatus.NO_SHOW)}
          disabled={isLoading}
          className="text-orange-600"
        >
          <UserX className="h-4 w-4 mr-2" />
          No se presentó
        </DropdownMenuItem>
      )
    }

    // Siempre permitir cancelar si no está en estado final
    if (![AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW].includes(status)) {
      if (options.length > 0) {
        options.push(<DropdownMenuSeparator key="separator" />)
      }
      options.push(
        <DropdownMenuItem 
          key="cancel"
          onClick={() => handleStatusChange(AppointmentStatus.CANCELLED)} 
          className="text-destructive"
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </DropdownMenuItem>
      )
    }

    return options
  }

  const dropdownOptions = getDropdownOptions()

  return (
    <div className="flex items-center gap-2">
      {/* Badge de estado actual */}
      <Badge 
        variant="outline" 
        className={`${statusColors[status]} flex items-center gap-1`}
      >
        {statusIcons[status]}
        <span>{APPOINTMENT_STATUS_LABELS[status as AppointmentStatus]}</span>
      </Badge>

      {/* Mostrar error si existe */}
      {error && (
        <div className="flex items-center text-red-600 text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </div>
      )}

      {/* Acciones rápidas según el estado */}
      {getQuickActions()}

      {/* Menú dropdown con todas las opciones disponibles */}
      {dropdownOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {dropdownOptions}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Indicador de carga */}
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      )}
    </div>
  )
}