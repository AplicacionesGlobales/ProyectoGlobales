// landing\components\modals\attend-appointment\attend-appointment-modal.tsx
import React, { useState, useEffect } from "react"
import { BaseModal } from "@/components/reusable-components/BaseModal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Stethoscope, 
  User, 
  Clock, 
  FileText, 
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Mail,
  Phone
} from "lucide-react"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  AttendAppointmentData, 
  AppointmentStatus, 
  ClientNote,
  attendAppointmentsService,
  CreateClientNoteRequest,
  UpdateAppointmentStatusRequest
} from "@/services/attend-appointments.service"

interface AttendAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: AttendAppointmentData | null
  brandId: number
  onStatusUpdated: () => void
  loading?: boolean
}

export const AttendAppointmentModal: React.FC<AttendAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  brandId,
  onStatusUpdated,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState("status")
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [isPrivateNote, setIsPrivateNote] = useState(false)
  const [appointmentNotes, setAppointmentNotes] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notesLoading, setNotesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && appointment) {
      loadClientNotes()
      setAppointmentNotes(appointment.notes || "")
      setSelectedStatus(null)
      setError(null)
      setSuccess(null)
    }
  }, [isOpen, appointment])

  const loadClientNotes = async () => {
    if (!appointment) return
    
    try {
      setNotesLoading(true)
      const response = await attendAppointmentsService.getClientNotes(brandId, appointment.clientId)
      
      if (response.success && response.data) {
        setClientNotes(response.data.notes)
      } else {
        setClientNotes([])
      }
    } catch (error) {
      console.error('Error loading client notes:', error)
      setClientNotes([])
    } finally {
      setNotesLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    if (!appointment) return
    
    try {
      setActionLoading(true)
      setError(null)
      
      const updateData: UpdateAppointmentStatusRequest = {
        status: newStatus,
        notes: appointmentNotes.trim() || undefined
      }
      
      const response = await attendAppointmentsService.updateAppointmentStatus(
        brandId, 
        appointment.id, 
        updateData
      )
      
      if (response.success) {
        setSuccess(`Estado actualizado a ${attendAppointmentsService.getStatusText(newStatus)}`)
        onStatusUpdated()
        
        // Cerrar modal después de un breve delay
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        const errorMsg = response.errors?.[0]?.description || 'Error actualizando estado'
        setError(errorMsg)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error de conexión'
      setError(errorMsg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!appointment || !newNote.trim()) return
    
    try {
      setActionLoading(true)
      setError(null)
      
      const noteData: CreateClientNoteRequest = {
        note: newNote.trim(),
        isPrivate: isPrivateNote
      }
      
      const response = await attendAppointmentsService.createClientNote(
        brandId, 
        appointment.clientId, 
        noteData
      )
      
      if (response.success && response.data) {
        setClientNotes(prev => [response.data!, ...prev])
        setNewNote("")
        setIsPrivateNote(false)
        setSuccess("Nota agregada exitosamente")
      } else {
        const errorMsg = response.errors?.[0]?.description || 'Error agregando nota'
        setError(errorMsg)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error de conexión'
      setError(errorMsg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!appointment) return
    
    try {
      setActionLoading(true)
      setError(null)
      
      const response = await attendAppointmentsService.deleteClientNote(
        brandId, 
        appointment.clientId, 
        noteId
      )
      
      if (response.success) {
        setClientNotes(prev => prev.filter(note => note.id !== noteId))
        setSuccess("Nota eliminada exitosamente")
      } else {
        const errorMsg = response.errors?.[0]?.description || 'Error eliminando nota'
        setError(errorMsg)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error de conexión'
      setError(errorMsg)
    } finally {
      setActionLoading(false)
    }
  }

  const formatTime = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: es })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
    } catch {
      return dateString
    }
  }

  if (!appointment) {
    return null
  }

  const validTransitions = attendAppointmentsService.getValidStatusTransitions(appointment.status)
  const canChangeStatus = validTransitions.length > 0

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Atender Cita"
      titleIcon={<Stethoscope className="h-5 w-5" />}
      size="3xl"
      maxHeight="90vh"
      showFooter={false}
    >
      <div className="space-y-6">
        {/* Mensajes de error y éxito */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Header de la cita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información de la Cita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      {appointment.client.firstName} {appointment.client.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {appointment.client.email}
                  </div>
                  {appointment.client.phone && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {appointment.client.phone}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Horario</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({appointment.duration} min)
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estado Actual</Label>
                  <div className="mt-1">
                    <Badge className={attendAppointmentsService.getStatusColor(appointment.status)}>
                      {attendAppointmentsService.getStatusText(appointment.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">Cambiar Estado</TabsTrigger>
            <TabsTrigger value="notes">Notas del Cliente ({clientNotes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actualizar Estado de la Cita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Notas de la cita */}
                <div className="space-y-2">
                  <Label>Notas de la Cita</Label>
                  <Textarea
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    placeholder="Agregar notas sobre la cita..."
                    rows={3}
                    disabled={actionLoading}
                  />
                </div>

                {/* Acciones de estado */}
                {canChangeStatus ? (
                  <div className="space-y-3">
                    <Label>Cambiar Estado</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {validTransitions.map((status) => (
                        <Button
                          key={status}
                          variant="outline"
                          onClick={() => setSelectedStatus(status)}
                          className="justify-start"
                          disabled={actionLoading}
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            status === AppointmentStatus.CONFIRMED ? 'bg-blue-500' :
                            status === AppointmentStatus.IN_PROGRESS ? 'bg-purple-500' :
                            status === AppointmentStatus.COMPLETED ? 'bg-green-500' :
                            status === AppointmentStatus.CANCELLED ? 'bg-red-500' :
                            status === AppointmentStatus.NO_SHOW ? 'bg-gray-500' : 'bg-yellow-500'
                          }`} />
                          {attendAppointmentsService.getStatusText(status)}
                        </Button>
                      ))}
                    </div>

                    {selectedStatus && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-blue-900">
                              ¿Cambiar estado a "{attendAppointmentsService.getStatusText(selectedStatus)}"?
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              Esta acción actualizará el estado de la cita.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStatus(null)}
                              disabled={actionLoading}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(selectedStatus)}
                              disabled={actionLoading}
                            >
                              {actionLoading ? "Actualizando..." : "Confirmar"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground text-center">
                      No se pueden realizar más cambios de estado para esta cita.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Agregar nueva nota */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <Label>Agregar Nueva Nota</Label>
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Escribir nota sobre el cliente..."
                    rows={3}
                    disabled={actionLoading}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={isPrivateNote}
                        onChange={(e) => setIsPrivateNote(e.target.checked)}
                        disabled={actionLoading}
                        className="rounded"
                      />
                      <Label htmlFor="isPrivate" className="text-sm">
                        Nota privada
                      </Label>
                    </div>
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || actionLoading}
                      size="sm"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar Nota
                    </Button>
                  </div>
                </div>

                {/* Lista de notas */}
                {notesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Cargando notas...</p>
                  </div>
                ) : clientNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Sin notas registradas</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {clientNotes.map((note) => (
                      <div key={note.id} className="p-4 border rounded-lg bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                              {note.creator.firstName[0]}{note.creator.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {note.creator.firstName} {note.creator.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(note.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {note.isPrivate && (
                              <Badge variant="secondary" className="text-xs">
                                Privada
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">{note.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer con acciones rápidas */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            ID Cita: #{appointment.id} • Creada: {formatDateTime(appointment.createdAt)}
          </div>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}