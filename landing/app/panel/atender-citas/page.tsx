// landing\app\panel\atender-citas\page.tsx
"use client"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Stethoscope, 
  Clock, 
  User, 
  Calendar, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  CalendarDays,
  Timer,
  Users
} from "lucide-react"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Componentes
import { PageHeader } from "@/components/reusable-components/PageHeader"
import { AttendAppointmentModal } from "@/components/modals/attend-appointment/attend-appointment-modal"

// Servicios y tipos
import { 
  attendAppointmentsService,
  TodayAgendaResponse,
  TodayAgendaItem,
  AttendAppointmentData,
  AppointmentStatus
} from "@/services/attend-appointments.service"

export default function AtenderCitasPage() {
  const [agendaData, setAgendaData] = useState<TodayAgendaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [brandId, setBrandId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Modal states
  const [showAttendModal, setShowAttendModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AttendAppointmentData | null>(null)

  // Inicializar brandId
  useEffect(() => {
    const brandData = localStorage.getItem('brand_data')
    if (brandData) {
      const brand = JSON.parse(brandData)
      setBrandId(brand.id)
    }
  }, [])

  // Cargar agenda del día
  useEffect(() => {
    if (brandId) {
      loadTodayAgenda()
    }
  }, [brandId])

  const loadTodayAgenda = async () => {
    if (!brandId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await attendAppointmentsService.getTodayAgenda(brandId, true)
      
      if (response.success && response.data) {
        console.log('🔍 Agenda data received:', response.data)
        console.log('📊 Total booked time:', response.data.totalBookedTime, 'minutes')
        console.log('📋 Agenda items:', response.data.agenda)
        setAgendaData(response.data)
      } else {
        const errorMsg = response.errors?.[0]?.description || 'Error cargando agenda'
        setError(errorMsg)
      }
    } catch (error) {
      console.error('Error loading agenda:', error)
      setError('Error de conexión al cargar la agenda')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadTodayAgenda()
    setRefreshing(false)
    setSuccess('Agenda actualizada')
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleAttendAppointment = (appointment: AttendAppointmentData) => {
    setSelectedAppointment(appointment)
    setShowAttendModal(true)
  }

  const handleStatusUpdated = () => {
    loadTodayAgenda()
    setSuccess('Estado de cita actualizado')
    setTimeout(() => setSuccess(null), 3000)
  }

  const formatTime = (timeString: string): string => {
    try {
      // Si viene en formato HH:mm, usarlo directamente
      if (timeString.includes(':') && timeString.length <= 5) {
        return timeString
      }
      // Si viene como datetime, extraer la hora
      return format(new Date(timeString), 'HH:mm', { locale: es })
    } catch {
      return timeString
    }
  }

  const getAppointmentsByStatus = () => {
    if (!agendaData) {
      return {
        pending: [],
        confirmed: [],
        inProgress: [],
        completed: [],
        cancelled: [],
        noShow: []
      }
    }
    
    const appointments = agendaData.agenda
      .filter(item => item.type === 'appointment' && item.appointment)
      .map(item => item.appointment!)

    return {
      pending: appointments.filter(apt => apt.status === AppointmentStatus.PENDING),
      confirmed: appointments.filter(apt => apt.status === AppointmentStatus.CONFIRMED),
      inProgress: appointments.filter(apt => apt.status === AppointmentStatus.IN_PROGRESS),
      completed: appointments.filter(apt => apt.status === AppointmentStatus.COMPLETED),
      cancelled: appointments.filter(apt => apt.status === AppointmentStatus.CANCELLED),
      noShow: appointments.filter(apt => apt.status === AppointmentStatus.NO_SHOW)
    }
  }

  if (!brandId) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cargando información...</p>
        </div>
      </div>
    )
  }

  const appointmentsByStatus = getAppointmentsByStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Atender Citas"
        subtitle={`Agenda del día - ${agendaData ? format(new Date(agendaData.date), 'dd/MM/yyyy', { locale: es }) : 'Hoy'}`}
        primaryAction={{
          text: refreshing ? "Actualizando..." : "Actualizar",
          icon: RefreshCw,
          onClick: handleRefresh,
          disabled: loading || refreshing
        }}
      />

      {/* Mensajes */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando agenda del día...</p>
          </div>
        </div>
      ) : !agendaData ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Sin datos de agenda</h3>
          <p className="text-muted-foreground">No se pudo cargar la información del día</p>
        </div>
      ) : (
        <>
          {/* Resumen del día */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{agendaData.totalAppointments}</p>
                    <p className="text-sm text-muted-foreground">Total Citas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Timer className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.round(agendaData.totalBookedTime / 60)}h</p>
                    <p className="text-sm text-muted-foreground">Tiempo Ocupado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.round(agendaData.totalAvailableTime / 60)}h</p>
                    <p className="text-sm text-muted-foreground">Tiempo Disponible</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{appointmentsByStatus.pending.length + appointmentsByStatus.confirmed.length}</p>
                    <p className="text-sm text-muted-foreground">Por Atender</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Horario de atención */}
          {agendaData.businessHours && (
            <Card>
              <CardHeader>
                <CardTitle>Horario de Atención</CardTitle>
              </CardHeader>
              <CardContent>
                {agendaData.businessHours.isClosed ? (
                  <p className="text-muted-foreground">Cerrado hoy</p>
                ) : (
                  <p>
                    <strong>{agendaData.businessHours.start}</strong> - <strong>{agendaData.businessHours.end}</strong>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lista de citas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Citas del Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agendaData.agenda.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Sin citas programadas</h3>
                  <p className="text-muted-foreground">No hay citas para hoy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agendaData.agenda.map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      item.type === 'appointment' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="font-medium">{formatTime(item.startTime)}</p>
                            <p className="text-sm text-muted-foreground">{item.duration}min</p>
                          </div>
                          
                          {item.type === 'appointment' && item.appointment ? (
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4" />
                                <span className="font-medium">
                                  {item.appointment.client.firstName} {item.appointment.client.lastName}
                                </span>
                                <Badge className={attendAppointmentsService.getStatusColor(item.appointment.status)}>
                                  {attendAppointmentsService.getStatusText(item.appointment.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {item.appointment.client.email}
                              </p>
                              {item.appointment.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Notas: {item.appointment.notes}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex-1">
                              <span className="text-muted-foreground">Tiempo disponible</span>
                            </div>
                          )}
                        </div>
                        
                        {item.type === 'appointment' && item.appointment && (
                          <Button
                            onClick={() => handleAttendAppointment(item.appointment!)}
                            variant="outline"
                            size="sm"
                          >
                            <Stethoscope className="h-3 w-3 mr-1" />
                            Atender
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal para atender cita */}
      <AttendAppointmentModal
        isOpen={showAttendModal}
        onClose={() => setShowAttendModal(false)}
        appointment={selectedAppointment}
        brandId={brandId}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  )
}