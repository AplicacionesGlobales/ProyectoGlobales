"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Mail, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppointmentActions } from "@/components/appointment-actions"

interface Appointment {
  id: number
  brandId: number
  clientId: number
  startTime: string
  endTime: string
  duration: number
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  notes: string | null
  createdBy: number
  createdAt: string
  updatedAt: string
  client: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
  creator: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
}

interface AppointmentsResponse {
  success: boolean
  data: {
    appointments: Appointment[]
    total: number
    pages: number
  }
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const brandId = 1 // Temporal - en producción obtener del token

      const response = await fetch(`/api/brand/${brandId}/appointments?limit=100&page=1`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Ajustar según tu implementación de auth
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }

      const data: AppointmentsResponse = await response.json()
      setAppointments(data.data.appointments)
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus as Appointment["status"] } : apt)),
    )
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.startTime).toISOString().split("T")[0]
    const selectedDateStr = selectedDate.toISOString().split("T")[0]
    return appointmentDate === selectedDateStr
  })

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

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  const getAppointmentCount = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime).toISOString().split("T")[0]
      return aptDate === dateStr
    }).length
  }

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
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="border-border">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="border-border">
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
                        className={`
                          relative p-2 text-sm rounded-md transition-colors
                          ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}
                          ${isToday ? "bg-accent text-accent-foreground font-semibold" : ""}
                          ${isSelected && !isToday ? "bg-primary text-primary-foreground" : ""}
                          ${!isSelected && !isToday ? "hover:bg-muted" : ""}
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
              </CardContent>
            </Card>
          </div>

          {/* Lista de Citas */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Citas del {selectedDate.toLocaleDateString("es-ES")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Cargando citas...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay citas programadas para esta fecha</p>
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => {
                    const startTime = new Date(appointment.startTime)
                    const endTime = new Date(appointment.endTime)
                    const clientName = `${appointment.client.firstName} ${appointment.client.lastName}`

                    return (
                      <Card key={appointment.id} className="bg-muted/50 border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback className="bg-accent text-accent-foreground">
                                  {appointment.client.firstName[0]}
                                  {appointment.client.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-card-foreground">{clientName}</h4>
                                <p className="text-sm text-muted-foreground">Cita programada</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
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
                                ({appointment.duration} min)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span>{appointment.client.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <AppointmentActions
                              appointmentId={appointment.id}
                              currentStatus={appointment.status}
                              onStatusChange={handleStatusChange}
                            />
                          </div>

                          {appointment.notes && (
                            <div className="mt-3 p-2 bg-muted rounded text-sm text-muted-foreground">
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
