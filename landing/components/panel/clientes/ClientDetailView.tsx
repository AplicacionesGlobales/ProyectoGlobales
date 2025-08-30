// components/panel/clientes/ClientDetailView.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Eye,
  Edit,
  FileText,
  Settings,
  History,
  Calendar,
  Phone,
  Mail,
  User,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { Client, clientsService } from "@/services/clients.service"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ClientDetailViewProps {
  client: Client
  brandId: number
  isOpen: boolean
  onClose: () => void
  onEdit: (client: Client) => void
}

interface ClientAppointment {
  id: number
  date: string
  service: string
  status: 'completed' | 'cancelled' | 'pending'
  duration: number
  notes?: string
}

export function ClientDetailView({
  client,
  brandId,
  isOpen,
  onClose,
  onEdit
}: ClientDetailViewProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientData, setClientData] = useState<Client>(client)
  const [appointments, setAppointments] = useState<ClientAppointment[]>([])
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    if (isOpen && client.id) {
      loadClientDetails()
      loadClientAppointments()
    }
  }, [isOpen, client.id])

  const loadClientDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await clientsService.getClient(brandId, client.id)
      
      if (response.success && response.data) {
        setClientData(response.data)
      } else {
        setError('Error cargando detalles del cliente')
      }
    } catch (error) {
      console.error('Error loading client details:', error)
      setError('Error cargando detalles del cliente')
    } finally {
      setLoading(false)
    }
  }

  const loadClientAppointments = async () => {
    // Simulamos las citas por ahora ya que no tenemos el endpoint específico
    // En producción esto vendría del backend
    setAppointments([
      {
        id: 1,
        date: '2025-01-15',
        service: 'Corte de cabello',
        status: 'completed',
        duration: 30,
        notes: 'Cliente satisfecho con el resultado'
      },
      {
        id: 2,
        date: '2025-01-28',
        service: 'Corte + Barba',
        status: 'pending',
        duration: 45
      }
    ])
  }

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es })
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

  const formatLastVisit = (dateString?: string): string => {
    if (!dateString) return 'Nunca'
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Hoy'
      if (diffDays === 1) return 'Ayer'
      if (diffDays < 7) return `Hace ${diffDays} días`
      if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
      return format(date, 'dd/MM/yyyy', { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada'
      case 'pending': return 'Pendiente'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Perfil del Cliente
          </DialogTitle>
          <DialogDescription>
            Vista completa del perfil y historial del cliente
          </DialogDescription>
        </DialogHeader>
        
        {loading && !clientData ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando detalles...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Header del cliente */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                {clientData.firstName.charAt(0)}{clientData.lastName.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">
                  {clientData.firstName} {clientData.lastName}
                </h2>
                <p className="text-muted-foreground">{clientData.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={clientData.isActive ? "default" : "secondary"}>
                    {clientData.isActive ? 'Cliente Activo' : 'Cliente Inactivo'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Cliente desde {formatDate(clientData.createdAt)}
                  </span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onClose()
                  onEdit(clientData)
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>

            {/* Tabs del cliente */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Historial
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notas
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
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
                        <p className="text-sm">{clientData.firstName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Apellido</Label>
                        <p className="text-sm">{clientData.lastName}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="text-sm flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {clientData.email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                        <p className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {clientData.phone || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas del Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {clientData.totalAppointments}
                        </p>
                        <p className="text-sm text-blue-600">Total Citas</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600">
                          {formatLastVisit(clientData.lastVisit)}
                        </p>
                        <p className="text-sm text-green-600">Última Visita</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {clientData.isActive ? 'Activo' : 'Inactivo'}
                        </p>
                        <p className="text-sm text-purple-600">Estado</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Citas</CardTitle>
                    <CardDescription>
                      Historial completo de citas y servicios del cliente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {appointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Sin historial de citas</h3>
                        <p className="text-muted-foreground mb-4">
                          Este cliente aún no tiene citas registradas
                        </p>
                        <Button variant="outline">
                          <Calendar className="h-4 w-4 mr-2" />
                          Crear Primera Cita
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {appointments.map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{appointment.service}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(appointment.date)} • {appointment.duration} min
                                  </p>
                                  {appointment.notes && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {appointment.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusLabel(appointment.status)}
                            </Badge>
                          </div>
                        ))}
                        
                        <div className="text-center pt-4">
                          <Button variant="outline" size="sm">
                            Ver Historial Completo
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notas del Cliente</CardTitle>
                    <CardDescription>
                      Notas e información adicional sobre el cliente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {clientData.notes ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm">{clientData.notes}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar Notas
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Sin notas registradas</h3>
                        <p className="text-muted-foreground mb-4">
                          No hay notas registradas para este cliente
                        </p>
                        <Button variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Agregar Primera Nota
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración del Cliente</CardTitle>
                    <CardDescription>
                      Información del sistema y configuraciones del cliente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Estado del Cliente</Label>
                        <p className="text-sm">{clientData.isActive ? 'Activo' : 'Inactivo'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">ID del Cliente</Label>
                        <p className="text-sm font-mono">#{clientData.id}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Fecha de Registro</Label>
                        <p className="text-sm">{formatDateTime(clientData.createdAt)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Última Actualización</Label>
                        <p className="text-sm">{formatDateTime(clientData.updatedAt)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Brand ID</Label>
                        <p className="text-sm font-mono">#{clientData.brandId}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Total de Citas</Label>
                        <p className="text-sm">{clientData.totalAppointments} citas registradas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Acciones Administrativas</CardTitle>
                    <CardDescription>
                      Operaciones administrativas para este cliente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Estado del Cliente</p>
                        <p className="text-sm text-muted-foreground">
                          Cambiar el estado activo/inactivo del cliente
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        {clientData.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Exportar Datos</p>
                        <p className="text-sm text-muted-foreground">
                          Descargar información completa del cliente
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Exportar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg border-red-200">
                      <div>
                        <p className="font-medium text-red-600">Eliminar Cliente</p>
                        <p className="text-sm text-red-500">
                          Esta acción no se puede deshacer
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Footer con acciones rápidas */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    onClose()
                    onEdit(clientData)
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar Cliente
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  Nueva Cita
                </Button>
              </div>
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}