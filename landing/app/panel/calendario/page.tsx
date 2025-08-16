// landing\app\panel\calendario\page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Plus, Users, Clock, TrendingUp, AlertCircle, Zap } from "lucide-react"
import { CalendarView } from "@/components/panel/calendar/CalendarView"
import { appointmentsService, Appointment, AppointmentStatus } from "@/services/appointment.service"
import { format, isToday, isTomorrow, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

interface BrandData {
  id: number
  name: string
}

interface TodayStats {
  totalAppointments: number
  completedAppointments: number
  pendingAppointments: number
  totalRevenue: number
  nextAppointment?: Appointment
}

export default function CalendarioPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    totalRevenue: 0
  })
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener datos del brand
      const brandDataStr = localStorage.getItem('brand_data')
      if (!brandDataStr) {
        setError('No se encontraron datos del brand')
        return
      }

      const brand = JSON.parse(brandDataStr)
      setBrandData(brand)

      // Cargar citas de hoy y próximos días
      await loadTodayData(brand.id)

    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Error cargando datos del calendario')
    } finally {
      setLoading(false)
    }
  }

  const loadTodayData = async (brandId: number) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
      const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd')

      // Cargar citas de hoy y próximos días
      const [todayResponse, upcomingResponse] = await Promise.all([
        appointmentsService.getDayAppointments(brandId, today),
        appointmentsService.getAppointments(brandId, 1, 10, {
          startDate: tomorrow,
          endDate: nextWeek
        })
      ])

      // Procesar citas de hoy
      if (todayResponse.success && todayResponse.data) {
        const appointments = todayResponse.data
        setTodayAppointments(appointments)

        // Calcular estadísticas
        const stats: TodayStats = {
          totalAppointments: appointments.length,
          completedAppointments: appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length,
          pendingAppointments: appointments.filter(a => 
            a.status === AppointmentStatus.PENDING || a.status === AppointmentStatus.CONFIRMED
          ).length,
          totalRevenue: appointments
            .filter(a => a.status === AppointmentStatus.COMPLETED)
            .reduce((sum, a) => sum + a.price, 0),
          nextAppointment: appointments
            .filter(a => a.status !== AppointmentStatus.CANCELLED)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))[0]
        }

        setTodayStats(stats)
      }

      // Procesar próximas citas
      if (upcomingResponse.success && upcomingResponse.data) {
        setUpcomingAppointments(upcomingResponse.data.slice(0, 5))
      }

    } catch (error) {
      console.error('Error loading today data:', error)
    }
  }

  const getStatusColor = (status: AppointmentStatus): string => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'border-orange-200 bg-orange-50 text-orange-700'
      case AppointmentStatus.CONFIRMED:
        return 'border-blue-200 bg-blue-50 text-blue-700'
      case AppointmentStatus.IN_PROGRESS:
        return 'border-green-200 bg-green-50 text-green-700'
      case AppointmentStatus.COMPLETED:
        return 'border-gray-200 bg-gray-50 text-gray-700'
      case AppointmentStatus.CANCELLED:
        return 'border-red-200 bg-red-50 text-red-700'
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700'
    }
  }

  const getStatusText = (status: AppointmentStatus): string => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'Pendiente'
      case AppointmentStatus.CONFIRMED:
        return 'Confirmada'
      case AppointmentStatus.IN_PROGRESS:
        return 'En Progreso'
      case AppointmentStatus.COMPLETED:
        return 'Completada'
      case AppointmentStatus.CANCELLED:
        return 'Cancelada'
      default:
        return 'Desconocido'
    }
  }

  const formatAppointmentTime = (date: string, startTime: string, endTime: string): string => {
    try {
      const appointmentDate = new Date(date)
      if (isToday(appointmentDate)) {
        return `Hoy ${startTime} - ${endTime}`
      } else if (isTomorrow(appointmentDate)) {
        return `Mañana ${startTime} - ${endTime}`
      } else {
        return `${format(appointmentDate, 'dd/MM', { locale: es })} ${startTime} - ${endTime}`
      }
    } catch {
      return `${startTime} - ${endTime}`
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">Cargando calendario...</p>
        </div>
      </div>
    )
  }

  if (!brandData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudo cargar la información del brand. Por favor, recarga la página.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Gestiona tus citas y horarios disponibles.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas del día */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Citas Hoy
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.pendingAppointments} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completadas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.completedAppointments}</div>
            <p className="text-xs text-muted-foreground">
              de {todayStats.totalAppointments} programadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Hoy
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayStats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.completedAppointments > 0 
                ? `$${Math.round(todayStats.totalRevenue / todayStats.completedAppointments)} promedio`
                : 'Sin ventas aún'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próxima Cita
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {todayStats.nextAppointment ? (
              <>
                <div className="text-2xl font-bold">
                  {todayStats.nextAppointment.startTime}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {todayStats.nextAppointment.client.firstName} {todayStats.nextAppointment.client.lastName}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">--:--</div>
                <p className="text-xs text-muted-foreground">Sin citas</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Componente principal del calendario */}
      <CalendarView />

      {/* Panel lateral con citas del día y próximas */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Citas de Hoy */}
        <Card>
          <CardHeader>
            <CardTitle>Citas de Hoy</CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-3 rounded-lg border ${getStatusColor(appointment.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {appointment.client.firstName} {appointment.client.lastName}
                      </span>
                      <span className="text-sm font-medium">
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3" />
                        {appointment.service.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {appointment.startTime} - {appointment.endTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay citas hoy</h3>
                <p className="text-muted-foreground mb-4">
                  ¡Perfecto momento para relajarse o planificar!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas Citas */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Citas</CardTitle>
            <CardDescription>
              Citas programadas para los próximos días
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {appointment.client.firstName} {appointment.client.lastName}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-muted-foreground" />
                        {appointment.service.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatAppointmentTime(appointment.date, appointment.startTime, appointment.endTime)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay próximas citas</h3>
                <p className="text-muted-foreground mb-4">
                  Las nuevas citas aparecerán aquí
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}