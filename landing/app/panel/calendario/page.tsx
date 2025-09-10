"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Mail, ChevronLeft, ChevronRight, Phone, DollarSign, Briefcase, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AppointmentActions } from "@/components/appointment-actions"
import { 
  appointmentsService, 
  Appointment, 
  AppointmentStatus,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS 
} from "@/services/appointment.service"
import { formatPriceSimple } from "@/utils/format-utils"

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [loadingMonth, setLoadingMonth] = useState(false)

  // Obtener el brandId del usuario (temporal)
  const getBrandId = () => {
    // En producción, obtener del contexto de auth o del token decodificado
    return 1;
  }

  // Formatear fecha a YYYY-MM-DD
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Obtener primer y último día del mes
  const getMonthDateRange = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return {
      startDate: formatDateForAPI(firstDay),
      endDate: formatDateForAPI(lastDay)
    }
  }

  // Obtener variante del badge según el estado
  const getStatusBadgeVariant = (status: AppointmentStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return "default"
      case AppointmentStatus.PENDING:
        return "secondary"
      case AppointmentStatus.COMPLETED:
        return "outline"
      case AppointmentStatus.CANCELLED:
      case AppointmentStatus.NO_SHOW:
        return "destructive"
      case AppointmentStatus.IN_PROGRESS:
        return "default"
      default:
        return "secondary"
    }
  }

  // Cargar citas del día seleccionado
  const fetchDayAppointments = async () => {
    try {
      setLoading(true)
      const brandId = getBrandId()
      const dateStr = formatDateForAPI(selectedDate)

      const response = await appointmentsService.getAppointments(
        brandId,
        1,
        100,
        {
          startDate: dateStr,
          endDate: dateStr
        }
      )

      if (response.success && response.data) {
        let appointmentsList: Appointment[] = []
        
        if (Array.isArray(response.data)) {
          appointmentsList = response.data
        } else if (typeof response.data === 'object' && 'appointments' in response.data) {
          appointmentsList = (response.data as any).appointments || []
        }
        
        // Ordenar por hora de inicio
        appointmentsList.sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
        
        setAppointments(appointmentsList)
      } else {
        console.error('Error:', response.errors)
        setAppointments([])
      }
    } catch (error) {
      console.error("Error fetching day appointments:", error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar todas las citas del mes para mostrar indicadores
  const fetchMonthAppointments = async () => {
    try {
      setLoadingMonth(true)
      const brandId = getBrandId()
      const { startDate, endDate } = getMonthDateRange(currentMonth)

      const response = await appointmentsService.getAppointments(
        brandId,
        1,
        200,
        {
          startDate,
          endDate
        }
      )

      if (response.success && response.data) {
        let appointmentsList: Appointment[] = []
        
        if (Array.isArray(response.data)) {
          appointmentsList = response.data
        } else if (typeof response.data === 'object' && 'appointments' in response.data) {
          appointmentsList = (response.data as any).appointments || []
        }
        
        setMonthAppointments(appointmentsList)
      } else {
        console.error('Error:', response.errors)
        setMonthAppointments([])
      }
    } catch (error) {
      console.error("Error fetching month appointments:", error)
      setMonthAppointments([])
    } finally {
      setLoadingMonth(false)
    }
  }

  // Manejar cambio de estado de cita
  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      const brandId = getBrandId()
      
      const response = await appointmentsService.updateAppointment(brandId, appointmentId, {
        status: newStatus as AppointmentStatus
      })

      if (response.success) {
        setAppointments((prev) =>
          prev.map((apt) => 
            apt.id === appointmentId 
              ? { ...apt, status: newStatus as AppointmentStatus } 
              : apt
          )
        )
        
        setMonthAppointments((prev) =>
          prev.map((apt) => 
            apt.id === appointmentId 
              ? { ...apt, status: newStatus as AppointmentStatus } 
              : apt
          )
        )
      } else {
        console.error('Error actualizando estado:', response.errors)
      }
    } catch (error) {
      console.error('Error updating appointment status:', error)
    }
  }

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const today = new Date()
  const currentMonthNumber = currentMonth.getMonth()

  // Navegar entre meses
  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  // Obtener cantidad de citas para un día
  const getAppointmentCount = (date: Date) => {
    const dateStr = formatDateForAPI(date)
    return monthAppointments.filter((apt) => {
      const aptDate = formatDateForAPI(new Date(apt.startTime))
      return aptDate === dateStr && apt.status !== AppointmentStatus.CANCELLED
    }).length
  }

  // Efectos
  useEffect(() => {
    fetchDayAppointments()
  }, [selectedDate])

  useEffect(() => {
    fetchMonthAppointments()
  }, [currentMonth])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Citas</h1>
            <p className="text-muted-foreground mt-1">Administra las citas de tu negocio desde un solo lugar</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Nueva Cita</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground">
                    {currentMonth.toLocaleDateString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigateMonth("prev")} 
                      className="border-border"
                      disabled={loadingMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigateMonth("next")} 
                      className="border-border"
                      disabled={loadingMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === currentMonthNumber
                    const isToday = day.toDateString() === today.toDateString()
                    const isSelected = day.toDateString() === selectedDate.toDateString()
                    const appointmentCount = getAppointmentCount(day)

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        disabled={loadingMonth}
                        className={`
                          relative p-2 text-sm rounded-md transition-colors
                          ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}
                          ${isToday ? "bg-accent text-accent-foreground font-semibold" : ""}
                          ${isSelected && !isToday ? "bg-primary text-primary-foreground" : ""}
                          ${!isSelected && !isToday ? "hover:bg-muted" : ""}
                          ${loadingMonth ? "cursor-wait" : ""}
                        `}
                      >
                        {day.getDate()}
                        {appointmentCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {appointmentCount}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                {loadingMonth && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lista de Citas Mejorada */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Citas del {selectedDate.toLocaleDateString("es-ES", { day: 'numeric', month: 'long' })}
                  </CardTitle>
                  {appointments.length > 0 && (
                    <Badge variant="outline">
                      {appointments.length} {appointments.length === 1 ? 'cita' : 'citas'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Cargando citas...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay citas programadas para esta fecha</p>
                  </div>
                ) : (
                  appointments.map((appointment) => {
                    const startTime = new Date(appointment.startTime)
                    const endTime = new Date(appointment.endTime)
                    const clientName = appointment.client 
                      ? `${appointment.client.firstName || ''} ${appointment.client.lastName || ''}`.trim() || appointment.client.email
                      : 'Sin cliente asignado'

                    return (
                      <Card 
                        key={appointment.id} 
                        className="relative bg-muted/50 border-border overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Indicador de color del servicio */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1"
                          style={{ 
                            backgroundColor: appointment.serviceType?.color || '#3B82F6' 
                          }}
                        />
                        
                        <CardContent className="p-4 pl-5">
                          {/* Header con tipo de servicio y precio */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              {/* Tipo de servicio y precio */}
                              {appointment.serviceType && (
                                <div className="flex items-center gap-2 mb-2">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  <h4 className="font-semibold text-sm">
                                    {appointment.serviceType.name}
                                  </h4>
                                  <Badge variant="outline" className="text-xs">
                                    {formatPriceSimple(appointment.serviceType.price)}
                                  </Badge>
                                </div>
                              )}
                              
                              {/* Cliente */}
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src="/placeholder.svg" />
                                  <AvatarFallback className="bg-accent text-accent-foreground">
                                    {appointment.client 
                                      ? `${appointment.client.firstName?.[0] || ''}${appointment.client.lastName?.[0] || ''}`
                                      : 'NA'
                                    }
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium text-card-foreground">{clientName}</h4>
                                  <Badge 
                                    variant={getStatusBadgeVariant(appointment.status)}
                                    className="text-xs"
                                  >
                                    {APPOINTMENT_STATUS_LABELS[appointment.status]}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Información de contacto y horario */}
                          <div className="space-y-2 text-sm">
                            {/* Horario */}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {startTime.toLocaleTimeString("es-ES", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                -{" "}
                                {endTime.toLocaleTimeString("es-ES", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                <span className="text-xs">
                                  ({appointment.duration || appointment.serviceType?.duration || 30} min)
                                </span>
                              </span>
                            </div>
                            
                            {/* Email */}
                            {appointment.client?.email && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <a 
                                  href={`mailto:${appointment.client.email}`}
                                  className="hover:underline text-xs"
                                >
                                  {appointment.client.email}
                                </a>
                              </div>
                            )}
                            
                            {/* Teléfono */}
                            {appointment.client?.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <a 
                                  href={`tel:${appointment.client.phone}`}
                                  className="hover:underline text-xs"
                                >
                                  {appointment.client.phone}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Acciones */}
                          <div className="mt-3">
                            <AppointmentActions
                              appointmentId={appointment.id}
                              currentStatus={appointment.status as string}
                              onStatusChange={handleStatusChange}
                            />
                          </div>

                          {/* Notas */}
                          {appointment.notes && (
                            <div className="mt-3 p-2 bg-muted rounded text-xs text-muted-foreground">
                              <strong>Notas:</strong> {appointment.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}