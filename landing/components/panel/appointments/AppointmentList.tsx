import React from "react"
import { Calendar, Clock, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppointmentActions } from "@/components/appointment-actions"
import { Appointment } from "@/services/appointment.service"

interface AppointmentListProps {
  selectedDate: Date
  appointments: Appointment[]
  loading: boolean
  onStatusChange: (appointmentId: number, newStatus: string) => Promise<void>
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  selectedDate,
  appointments,
  loading,
  onStatusChange
}) => {
  return (
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
              <Card key={appointment.id} className="bg-muted/50 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
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
                        <h4 className="font-semibold text-card-foreground">{clientName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Estado: {appointment.status}
                        </p>
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
                    {appointment.client?.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{appointment.client.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <AppointmentActions
                      appointmentId={appointment.id}
                      currentStatus={appointment.status as string}
                      onStatusChange={onStatusChange}
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
  )
}