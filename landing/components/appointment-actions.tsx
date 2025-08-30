"use client"

import { useState } from "react"
import { Check, X, Clock, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface AppointmentActionsProps {
  appointmentId: number
  currentStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  onStatusChange: (id: number, newStatus: string) => void
}

const statusColors = {
  CONFIRMED: "bg-green-100 text-green-800 border-green-200",
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
}

const statusLabels = {
  CONFIRMED: "Confirmada",
  PENDING: "Pendiente",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
}

export function AppointmentActions({ appointmentId, currentStatus, onStatusChange }: AppointmentActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    try {
      // Aquí iría la llamada al API para actualizar el estado
      // await updateAppointmentStatus(appointmentId, newStatus)
      onStatusChange(appointmentId, newStatus)
    } catch (error) {
      console.error("Error updating appointment status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={statusColors[currentStatus]}>
        {statusLabels[currentStatus]}
      </Badge>

      {/* Quick action buttons for common status changes */}
      {currentStatus === "PENDING" && (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange("CONFIRMED")}
            disabled={isLoading}
            className="h-8 w-8 p-0 border-green-200 hover:bg-green-50"
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange("CANCELLED")}
            disabled={isLoading}
            className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )}

      {currentStatus === "CONFIRMED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange("COMPLETED")}
          disabled={isLoading}
          className="h-8 px-3 border-blue-200 hover:bg-blue-50"
        >
          <Clock className="h-4 w-4 text-blue-600 mr-1" />
          <span className="text-blue-600">Completar</span>
        </Button>
      )}

      {/* Dropdown menu for all status options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentStatus !== "CONFIRMED" && (
            <DropdownMenuItem onClick={() => handleStatusChange("CONFIRMED")}>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Confirmar
            </DropdownMenuItem>
          )}
          {currentStatus !== "COMPLETED" && currentStatus !== "CANCELLED" && (
            <DropdownMenuItem onClick={() => handleStatusChange("COMPLETED")}>
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              Completar
            </DropdownMenuItem>
          )}
          {currentStatus !== "CANCELLED" && (
            <DropdownMenuItem onClick={() => handleStatusChange("CANCELLED")} className="text-destructive">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
