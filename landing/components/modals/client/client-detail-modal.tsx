import React from "react"
import { BaseModal } from "@/components/reusable-components/BaseModal"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, User, FileText, Settings, History, Clock, Mail, Phone } from "lucide-react"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Types
interface Client {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  isActive: boolean
  brandId: number
  totalAppointments: number
  lastVisit?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface ClientNote {
  id: number
  note: string
  isPrivate: boolean
  createdAt: string
  creator: {
    firstName: string
    lastName: string
  }
}

interface ClientActivity {
  id: number
  type: string
  description: string
  createdAt: string
}

interface ClientDetailModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  notes?: ClientNote[]
  activities?: ClientActivity[]
  loading?: boolean
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  client,
  notes = [],
  activities = [],
  loading = false
}) => {
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
    } catch {
      return dateString
    }
  }

  if (!client) {
    return null
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil del Cliente"
      titleIcon={<Eye className="h-5 w-5" />}
      size="4xl"
      maxHeight="90vh"
      showFooter={false}
      className="overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
            {client.firstName[0]}{client.lastName[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              {client.firstName} {client.lastName}
            </h2>
            <p className="text-muted-foreground">{client.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={client.isActive ? "default" : "secondary"}>
                {client.isActive ? 'Cliente Activo' : 'Cliente Inactivo'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ID: #{client.id}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">
              <User className="h-4 w-4 mr-1" />
              Información
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="h-4 w-4 mr-1" />
              Notas ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-1" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                    <p>{client.firstName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Apellido</Label>
                    <p>{client.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone || 'No especificado'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {client.totalAppointments}
                    </p>
                    <p className="text-sm text-blue-600">Total Citas</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-600">
                      {client.lastVisit ? 'Reciente' : 'Nunca'}
                    </p>
                    <p className="text-sm text-green-600">Última Visita</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {client.isActive ? 'Activo' : 'Inactivo'}
                    </p>
                    <p className="text-sm text-purple-600">Estado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Historial de actividades del cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Sin actividad registrada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{activity.type}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notas del Cliente</CardTitle>
                <CardDescription>
                  Notas e información importante sobre el cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Sin notas registradas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                              {note.creator.firstName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {note.creator.firstName} {note.creator.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(note.createdAt)}
                              </p>
                            </div>
                          </div>
                          {note.isPrivate && (
                            <Badge variant="secondary" className="text-xs">
                              Privada
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{note.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ID Cliente</Label>
                    <p className="font-mono">#{client.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                    <p>{client.isActive ? 'Activo' : 'Inactivo'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Brand ID</Label>
                    <p className="font-mono">#{client.brandId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Citas</Label>
                    <p>{client.totalAppointments}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Registrado</Label>
                    <p>{formatDate(client.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Actualizado</Label>
                    <p>{formatDate(client.updatedAt)}</p>
                  </div>
                </div>
                
                {client.lastVisit && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Label className="text-sm font-medium text-blue-700">Última Visita</Label>
                    <p className="text-blue-600">{formatDate(client.lastVisit)}</p>
                  </div>
                )}
                
                {client.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700">Notas del Sistema</Label>
                    <p className="text-sm text-gray-600 mt-1">{client.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </BaseModal>
  )
}