"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar,
  Eye,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  User,
  FileText,
  Settings,
  History,
  Clock
} from "lucide-react"
import { 
  clientsService, 
  Client, 
  CreateClientData, 
  ClientNote, 
  ClientActivity 
} from "@/services/client.service"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  createAccess: boolean
  tempPassword: string
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [brandId, setBrandId] = useState<number | null>(null)
  
  // Estados UI
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([])
  const [clientActivity, setClientActivity] = useState<ClientActivity[]>([])
  
  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    createAccess: false,
    tempPassword: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    if (brandId) {
      loadClients()
    }
  }, [brandId])

  const initializeData = () => {
    const brandData = localStorage.getItem('brand_data')
    if (brandData) {
      const brand = JSON.parse(brandData)
      setBrandId(brand.id)
    }
  }

  const loadClients = async () => {
    if (!brandId) return
    
    try {
      setLoading(true)
      const response = await clientsService.getClients(brandId, { 
        page: 1, 
        limit: 50 
      })
      
      if (response.success && response.data) {
        setClients(response.data.clients)
      } else {
        setError('Error cargando clientes')
      }
    } catch (error) {
      console.error('Error loading clients:', error)
      setError('Error cargando clientes')
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: '',
      createAccess: false,
      tempPassword: ''
    })
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    clearMessages()
  }

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'Nombre es requerido'
    if (!formData.lastName.trim()) return 'Apellido es requerido'
    if (!formData.email.trim()) return 'Email es requerido'
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return 'Email inválido'
    
    if (formData.createAccess && !formData.tempPassword.trim()) {
      return 'Contraseña temporal requerida'
    }
    
    return null
  }

  const handleCreateClient = async () => {
    if (!brandId) return
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    try {
      setSaving(true)
      clearMessages()
      
      const clientData: CreateClientData = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        createAccess: formData.createAccess,
        tempPassword: formData.createAccess ? formData.tempPassword.trim() : undefined
      }
      
      const response = await clientsService.createClient(brandId, clientData)
      
      if (response.success) {
        setSuccess('Cliente creado exitosamente')
        resetForm()
        setShowCreateModal(false)
        loadClients()
      } else {
        const errorMsg = response.errors?.[0]?.description || 'Error creando cliente'
        setError(errorMsg)
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleViewClient = async (client: Client) => {
    if (!brandId) return
    
    try {
      setLoading(true)
      
      // Cargar detalles del cliente
      const [clientResponse, notesResponse, activityResponse] = await Promise.all([
        clientsService.getClient(brandId, client.id),
        clientsService.getClientNotes(brandId, client.id),
        clientsService.getClientActivity(brandId, client.id)
      ])
      
      if (clientResponse.success && clientResponse.data) {
        setSelectedClient(clientResponse.data)
      }
      
      if (notesResponse.success && notesResponse.data) {
        setClientNotes(notesResponse.data.notes)
      } else {
        setClientNotes([])
      }
      
      if (activityResponse.success && activityResponse.data) {
        setClientActivity(activityResponse.data.activities)
      } else {
        setClientActivity([])
      }
      
      setShowDetailModal(true)
    } catch (error) {
      setError('Error cargando detalles del cliente')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
    } catch {
      return dateString
    }
  }

  const formatDateOnly = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es })
    } catch {
      return dateString
    }
  }

  const filteredClients = clients.filter(client =>
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        <Button onClick={() => {
          resetForm()
          clearMessages()
          setShowCreateModal(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

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

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Clientes ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando...</span>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No hay clientes registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {client.firstName[0]}{client.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-medium">{client.firstName} {client.lastName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </span>
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p>Citas: {client.totalAppointments}</p>
                    </div>
                    <Badge variant={client.isActive ? "default" : "secondary"}>
                      {client.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewClient(client)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear Cliente */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>Registra un nuevo cliente</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Nombre"
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Apellido"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+506 8888 8888"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Notas sobre el cliente..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.createAccess}
                  onCheckedChange={(checked) => handleInputChange('createAccess', !!checked)}
                />
                <Label className="text-sm">Crear acceso al sistema</Label>
              </div>
              
              {formData.createAccess && (
                <div className="space-y-2">
                  <Label>Contraseña Temporal *</Label>
                  <Input
                    type="password"
                    value={formData.tempPassword}
                    onChange={(e) => handleInputChange('tempPassword', e.target.value)}
                    placeholder="Contraseña temporal"
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClient} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Cliente'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Vista Detallada del Cliente */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Perfil del Cliente
            </DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </h2>
                  <p className="text-muted-foreground">{selectedClient.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={selectedClient.isActive ? "default" : "secondary"}>
                      {selectedClient.isActive ? 'Cliente Activo' : 'Cliente Inactivo'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ID: #{selectedClient.id}
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
                    Notas ({clientNotes.length})
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
                          <p>{selectedClient.firstName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Apellido</Label>
                          <p>{selectedClient.lastName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                          <p className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {selectedClient.email}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                          <p className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {selectedClient.phone || 'No especificado'}
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
                            {selectedClient.totalAppointments}
                          </p>
                          <p className="text-sm text-blue-600">Total Citas</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-xl font-bold text-green-600">
                            {selectedClient.lastVisit ? 'Reciente' : 'Nunca'}
                          </p>
                          <p className="text-sm text-green-600">Última Visita</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">
                            {selectedClient.isActive ? 'Activo' : 'Inactivo'}
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
                      {clientActivity.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Sin actividad registrada</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {clientActivity.map((activity) => (
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
                      {clientNotes.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Sin notas registradas</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {clientNotes.map((note) => (
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
                          <p className="font-mono">#{selectedClient.id}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                          <p>{selectedClient.isActive ? 'Activo' : 'Inactivo'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Brand ID</Label>
                          <p className="font-mono">#{selectedClient.brandId}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Total Citas</Label>
                          <p>{selectedClient.totalAppointments}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Registrado</Label>
                          <p>{formatDate(selectedClient.createdAt)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Actualizado</Label>
                          <p>{formatDate(selectedClient.updatedAt)}</p>
                        </div>
                      </div>
                      
                      {selectedClient.lastVisit && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Label className="text-sm font-medium text-blue-700">Última Visita</Label>
                          <p className="text-blue-600">{formatDate(selectedClient.lastVisit)}</p>
                        </div>
                      )}
                      
                      {selectedClient.notes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Label className="text-sm font-medium text-gray-700">Notas del Sistema</Label>
                          <p className="text-sm text-gray-600 mt-1">{selectedClient.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}