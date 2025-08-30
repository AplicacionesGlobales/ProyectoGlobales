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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
  History
} from "lucide-react"
import { 
  clientsService, 
  Client, 
  CreateClientData, 
  UpdateClientData,
  ClientFilters
} from "@/services/clients.service"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface BrandData {
  id: number
  name: string
}

interface ClientFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  createAccess: boolean
  tempPassword: string
}

const defaultFormData: ClientFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
  createAccess: false,
  tempPassword: ''
}

export default function ClientesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  })
  
  // Estados del UI
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'createdAt' | 'firstName' | 'email' | 'lastVisit'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Estados de modales
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  
  // Estados del formulario
  const [formData, setFormData] = useState<ClientFormData>(defaultFormData)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadClients()
  }, [pagination.page, searchTerm, activeFilter, sortBy, sortOrder])

  const loadInitialData = async () => {
    try {
      // Obtener datos del brand desde localStorage
      const brandDataStr = localStorage.getItem('brand_data')
      if (!brandDataStr) {
        setError('No se encontraron datos del brand')
        return
      }
      const brand = JSON.parse(brandDataStr)
      setBrandData(brand)
    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Error cargando datos iniciales')
    }
  }

  const loadClients = async () => {
    if (!brandData) return
    
    try {
      setLoading(true)
      setError(null)
      
      const filters: ClientFilters = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        active: activeFilter === 'all' ? undefined : activeFilter,
        sortBy,
        sortOrder
      }
      
      const response = await clientsService.getClients(brandData.id, filters)
      
      if (response.success && response.data) {
        setClients(response.data.clients)
        setPagination(response.data.pagination)
      } else {
        setError(response.errors?.[0]?.description || 'Error cargando clientes')
      }
    } catch (error) {
      console.error('Error loading clients:', error)
      setError('Error cargando clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (field: keyof ClientFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOpenCreateDialog = () => {
    setFormData(defaultFormData)
    setIsCreateDialogOpen(true)
    setError(null)
  }

  const handleOpenEditDialog = (client: Client) => {
    setEditingClient(client)
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone || '',
      notes: client.notes || '',
      createAccess: false,
      tempPassword: ''
    })
    setIsEditDialogOpen(true)
    setError(null)
  }

  const handleOpenDetailView = async (client: Client) => {
    try {
      if (!brandData) return
      
      setLoading(true)
      const response = await clientsService.getClient(brandData.id, client.id)
      
      if (response.success && response.data) {
        setViewingClient(response.data)
        setIsDetailViewOpen(true)
      } else {
        setError('Error cargando detalles del cliente')
      }
    } catch (error) {
      setError('Error cargando detalles del cliente')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'El nombre es obligatorio'
    if (!formData.lastName.trim()) return 'El apellido es obligatorio'
    if (!formData.email.trim()) return 'El email es obligatorio'
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return 'El formato del email no es válido'
    
    if (formData.createAccess && !formData.tempPassword.trim()) {
      return 'La contraseña temporal es obligatoria cuando se crea acceso'
    }
    
    return null
  }

  const handleSave = async () => {
    if (!brandData) return
    
    try {
      setSaving(true)
      setError(null)
      
      const validationError = validateForm()
      if (validationError) {
        setError(validationError)
        return
      }
      
      const clientData: CreateClientData | UpdateClientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      }

      if (!editingClient) {
        // Crear cliente
        const createData = clientData as CreateClientData
        createData.createAccess = formData.createAccess
        if (formData.createAccess) {
          createData.tempPassword = formData.tempPassword
        }
      }
      
      let response
      if (editingClient) {
        response = await clientsService.updateClient(brandData.id, editingClient.id, clientData)
      } else {
        response = await clientsService.createClient(brandData.id, clientData as CreateClientData)
      }
      
      if (response.success) {
        setSuccess(editingClient ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente')
        setIsCreateDialogOpen(false)
        setIsEditDialogOpen(false)
        setEditingClient(null)
        setFormData(defaultFormData)
        loadClients()
      } else {
        setError(response.errors?.[0]?.description || 'Error guardando cliente')
      }
    } catch (error: any) {
      console.error('Error saving client:', error)
      setError('Error guardando cliente')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (client: Client) => {
    if (!brandData) return
    
    if (!confirm(`¿Está seguro de que desea eliminar a ${client.firstName} ${client.lastName}?`)) {
      return
    }
    
    try {
      const response = await clientsService.deleteClient(brandData.id, client.id)
      
      if (response.success) {
        setSuccess('Cliente eliminado exitosamente')
        loadClients()
      } else {
        setError(response.errors?.[0]?.description || 'Error eliminando cliente')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      setError('Error eliminando cliente')
    }
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

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  if (loading && clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando clientes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona tu base de datos de clientes - Total: {pagination.total}
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
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

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Fecha registro</SelectItem>
                <SelectItem value="firstName">Nombre</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="lastVisit">Última visita</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
            <Button variant="outline" onClick={loadClients}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Clientes
          </CardTitle>
          <CardDescription>
            Página {pagination.page} de {pagination.totalPages} - {clients.length} clientes mostrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando...</span>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hay clientes</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || activeFilter !== 'all'
                  ? 'No se encontraron clientes con esos filtros'
                  : 'Comienza agregando tu primer cliente'
                }
              </p>
              <Button onClick={handleOpenCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Cliente
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                        {client.firstName.charAt(0)}{client.lastName.charAt(0)}
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
                        <p className="font-medium">Citas: {client.totalAppointments}</p>
                        <p className="text-muted-foreground">
                          Última: {formatLastVisit(client.lastVisit)}
                        </p>
                      </div>
                      <Badge variant={client.isActive ? "default" : "secondary"}>
                        {client.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetailView(client)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditDialog(client)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(client)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear cliente */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Registra un nuevo cliente en tu base de datos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleFormChange('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleFormChange('lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Notas adicionales sobre el cliente..."
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="createAccess"
                checked={formData.createAccess}
                onCheckedChange={(checked) => handleFormChange('createAccess', !!checked)}
              />
              <Label htmlFor="createAccess" className="text-sm">
                Crear acceso al sistema
              </Label>
            </div>
            {formData.createAccess && (
              <div className="space-y-2">
                <Label htmlFor="tempPassword">Contraseña Temporal *</Label>
                <Input
                  id="tempPassword"
                  type="password"
                  value={formData.tempPassword}
                  onChange={(e) => handleFormChange('tempPassword', e.target.value)}
                  placeholder="Contraseña temporal para el cliente"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
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

      {/* Modal para editar cliente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifica la información del cliente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">Nombre *</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => handleFormChange('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Apellido *</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => handleFormChange('lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email *</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">Teléfono</Label>
              <Input
                id="editPhone"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editNotes">Notas</Label>
              <Textarea
                id="editNotes"
                placeholder="Notas adicionales sobre el cliente..."
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Cliente'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de vista detallada del cliente (ClientDetailView) */}
      <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
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
          
          {viewingClient && (
            <div className="space-y-6">
              {/* Header del cliente */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {viewingClient.firstName.charAt(0)}{viewingClient.lastName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">
                    {viewingClient.firstName} {viewingClient.lastName}
                  </h2>
                  <p className="text-muted-foreground">{viewingClient.email}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant={viewingClient.isActive ? "default" : "secondary"}>
                      {viewingClient.isActive ? 'Cliente Activo' : 'Cliente Inactivo'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Cliente desde {formatDate(viewingClient.createdAt)}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsDetailViewOpen(false)
                    handleOpenEditDialog(viewingClient)
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>

              {/* Tabs del cliente */}
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
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
                          <p className="text-sm">{viewingClient.firstName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Apellido</Label>
                          <p className="text-sm">{viewingClient.lastName}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {viewingClient.email}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                          <p className="text-sm flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {viewingClient.phone || 'No especificado'}
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
                            {viewingClient.totalAppointments}
                          </p>
                          <p className="text-sm text-blue-600">Total Citas</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {viewingClient.lastVisit ? 'Reciente' : 'Nunca'}
                          </p>
                          <p className="text-sm text-green-600">Estado</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">
                            {viewingClient.isActive ? 'Activo' : 'Inactivo'}
                          </p>
                          <p className="text-sm text-purple-600">Cliente</p>
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
                        Historial completo de citas y servicios
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {viewingClient.totalAppointments === 0 ? (
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
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">Última visita</p>
                              <p className="text-sm text-muted-foreground">
                                {formatLastVisit(viewingClient.lastVisit)}
                              </p>
                            </div>
                            <Badge>Completada</Badge>
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
                      {viewingClient.notes ? (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm">{viewingClient.notes}</p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No hay notas registradas para este cliente</p>
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
                        Ajustes y preferencias del cliente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                          <p className="text-sm">{viewingClient.isActive ? 'Cliente Activo' : 'Cliente Inactivo'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Fecha de Registro</Label>
                          <p className="text-sm">{formatDateTime(viewingClient.createdAt)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Última Actualización</Label>
                          <p className="text-sm">{formatDateTime(viewingClient.updatedAt)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">ID del Cliente</Label>
                          <p className="text-sm font-mono">#{viewingClient.id}</p>
                        </div>
                      </div>
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