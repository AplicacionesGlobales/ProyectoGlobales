import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Appointment, AppointmentStatus } from "@/services/appointment.service"

interface AppointmentCalendarProps {
  currentMonth: Date
  selectedDate: Date
  monthAppointments: Appointment[]
  loadingMonth: boolean
  onDateSelect: (date: Date) => void
  onMonthNavigate: (direction: "prev" | "next") => void
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  currentMonth,
  selectedDate,
  monthAppointments,
  loadingMonth,
  onDateSelect,
  onMonthNavigate
}) => {
  // Formatear fecha a YYYY-MM-DD
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
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

  // Obtener cantidad de citas para un día
  const getAppointmentCount = (date: Date) => {
    const dateStr = formatDateForAPI(date)
    return monthAppointments.filter((apt) => {
      const aptDate = formatDateForAPI(new Date(apt.startTime))
      return aptDate === dateStr && apt.status !== AppointmentStatus.CANCELLED
    }).length
  }

  const calendarDays = generateCalendarDays()
  const today = new Date()
  const currentMonthNumber = currentMonth.getMonth()

  return (
    <Card className="bg-card border-border relative">
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
              onClick={() => onMonthNavigate("prev")} 
              className="border-border"
              disabled={loadingMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onMonthNavigate("next")} 
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
                onClick={() => onDateSelect(day)}
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
  )
}