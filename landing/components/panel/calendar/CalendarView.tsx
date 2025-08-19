// components/panel/calendar/CalendarView.tsx
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { CalendarEvent } from "@/services/appointment.service"

interface CalendarViewProps {
  appointments?: CalendarEvent[]
  onDateSelect?: (date: Date) => void
  onAppointmentClick?: (appointment: CalendarEvent) => void
  onCreateAppointment?: (date: Date, time: string) => void
}

export function CalendarView({ 
  appointments = [], 
  onDateSelect, 
  onAppointmentClick, 
  onCreateAppointment 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentYear, currentMonth, day))
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1))
  }

  const getAppointmentsForDate = (date: Date) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime).toISOString().split('T')[0]
      return aptDate === dateStr
    })
  }

  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date)
    }
  }

  const handleCreateAppointment = (date: Date) => {
    if (onCreateAppointment) {
      onCreateAppointment(date, "09:00")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Calendario</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setView(view === 'month' ? 'week' : 'month')}
            >
              {view === 'month' ? 'Vista Semanal' : 'Vista Mensual'}
            </Button>
          </div>
        </div>
        <CardDescription>
          Gestiona las citas y horarios de tu negocio
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={index} className="p-2 h-24"></div>
            }

            const dayAppointments = getAppointmentsForDate(date)
            const isToday = date.toDateString() === today.toDateString()
            const isPast = date < today && !isToday

            return (
              <div
                key={index}
                className={`
                  p-2 h-24 border rounded-lg cursor-pointer transition-colors
                  ${isToday ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}
                  ${isPast ? 'opacity-50' : ''}
                `}
                onClick={() => handleDateClick(date)}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                    {date.getDate()}
                  </span>
                  {!isPast && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCreateAppointment(date)
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Appointments for this day */}
                <div className="mt-1 space-y-1">
                  {dayAppointments.slice(0, 2).map(appointment => {
                    const appointmentTime = format(new Date(appointment.startTime), 'HH:mm')
                    const clientName = appointment.client 
                      ? `${appointment.client.firstName || ''} ${appointment.client.lastName || ''}`.trim() || appointment.client.email
                      : 'Cliente'
                    
                    return (
                      <div
                        key={appointment.id}
                        className="text-xs p-1 bg-primary/20 rounded truncate cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onAppointmentClick) {
                            onAppointmentClick(appointment)
                          }
                        }}
                      >
                        {appointmentTime} - {clientName}
                      </div>
                    )
                  })}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayAppointments.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
