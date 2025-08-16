// landing\app\panel\clientes\page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
  TrendingUp
} from "lucide-react"
import { 
  clientsService, 
  Client, 
  CreateClientData, 
  UpdateClientData, 
  ClientType,
  CLIENT_TYPE_LABELS,
  CLIENT_TYPE_COLORS,
  ClientStats
} from "@/services/client.service"
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
  dateOfBirth: string
  address: string
  notes: string
}

const defaultFormData: ClientFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  notes: ''
}

export default function ClientesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<ClientStats | null>(null)
  
  // Estados del UI
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<ClientType | 'all'>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  
  // Estados del formulario
  const [formData, setFormData] = useState<ClientFormData>(defaultFormData)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadClients()
  }, [currentPage, searchTerm, selectedType])

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

      // Cargar estadísticas
      const statsResponse = await clientsService.getClientStats(brand.id)
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      }

    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Error cargando datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  const loadClients = async () => {
    if (!brandData) return

    try {
      setLoading(true)
      setError(null)

      const filters = {
        search: searchTerm || undefined,
        clientType: selectedType !== 'all' ? selectedType : undefined,
        isActive: true
      }

      const response = await clientsService.getClients(brandData.id, currentPage, itemsPerPage, filters)

      if (response.success && response.data) {
        setClients(response.data)
        // Calcular páginas totales (esto debería venir del backend)
        setTotalPages(Math.ceil(response.data.length / itemsPerPage))
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

  // Filtrar clientes localmente (complemento al filtro del servidor)
  const filteredClients = useMemo(() => {
    let filtered = clients

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(client =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        (client.phone && client.phone.includes(term))
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(client => client.clientType === selectedType)
    }

    return filtered
  }, [clients, searchTerm, selectedType])

  const handleFormChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone || '',
        dateOfBirth: client.dateOfBirth || '',
        address: client.address || '',
        notes: client.notes || ''
      })
    } else {
      setEditingClient(null)
      setFormData(defaultFormData)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingClient(null)
    setFormData(defaultFormData)
    setError(null)
  }

  const handleViewClient = (client: Client) => {
    setViewingClient(client)
    setIsViewDialogOpen(true)
  }

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) {
      return 'El nombre es obligatorio'
    }
    if (!formData.lastName.trim()) {
      return 'El apellido es obligatorio'
    }
    if (!formData.email.trim()) {
      return 'El email es obligatorio'
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'El formato del email no es válido'
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
        dateOfBirth: formData.dateOfBirth || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined
      }

      let response
      if (editingClient) {
        response = await clientsService.updateClient(brandData.id, editingClient.id, clientData)
      } else {
        response = await clientsService.createClient(brandData.id, clientData as CreateClientData)
      }

      if (response.success) {
        setSuccess(editingClient ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente')
        handleCloseDialog()
        loadClients()
        
        // Actualizar estadísticas
        if (!editingClient) {
          loadInitialData()
        }
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

  const handleDelete = async (clientId: number) => {
    if (!brandData) return
    
    if (!confirm('¿Está seguro de que desea eliminar este cliente?')) {
      return
    }

    try {
      const response = await clientsService.deleteClient(brandData.id, clientId)
      
      if (response.success) {
        setSuccess('Cliente eliminado exitosamente')
        loadClients()
        loadInitialData() // Actualizar estadísticas
      } else {
        setError(response.errors?.[0]?.description || 'Error eliminando cliente')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      setError('Error eliminando cliente')
    }
  }

  const getTypeColor = (type: ClientType): string => {
    return CLIENT_TYPE_COLORS[type]
  }

  const getTypeLabel = (type: ClientType): string => {
    return CLIENT_TYPE_LABELS[type]
  }

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es })
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

  if (loading && !clients.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Cargando clientes...</p>
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
            Gestiona tu base de datos de clientes y su historial.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
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

      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeClients || 0} activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Este Mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.newClientsThisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">
                Clientes registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.clientTypes?.client || 0}</div>
              <p className="text-xs text-muted-foreground">
                Clientes registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.clientTypes?.root || 0}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios admin
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
              <Input
                placeholder="Buscar clientes por nombre, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ClientType | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value={ClientType.CLIENT}>Clientes</SelectItem>
                <SelectItem value={ClientType.ROOT}>Administradores</SelectItem>
              </SelectContent>
            </Select>
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
            {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''} {searchTerm || selectedType !== 'all' ? 'encontrado' + (filteredClients.length !== 1 ? 's' : '') : 'registrado' + (filteredClients.length !== 1 ? 's' : '')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando clientes...</span>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || selectedType !== 'all' 
                  ? 'No se encontraron clientes' 
                  : 'No hay clientes registrados'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedType !== 'all'
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza agregando tu primer cliente'
                }
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primer Cliente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
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
                    <div className="text-right">
                      <p className="text-sm font-medium">Última visita</p>
                      <p className="text-sm text-muted-foreground">
                        {formatLastVisit(client.lastVisit)}
                      </p>
                    </div>
                    <Badge variant={getTypeColor(client.clientType) as any}>
                      {getTypeLabel(client.clientType)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClient(client)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(client)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(client.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear/editar cliente */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingClient ? 'Modifica la información del cliente' : 'Agrega un nuevo cliente a tu base de datos'}
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
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {editingClient ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                editingClient ? 'Actualizar Cliente' : 'Crear Cliente'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para ver detalles del cliente */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
            <DialogDescription>
              Información completa del cliente
            </DialogDescription>
          </DialogHeader>

          {viewingClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-medium">
                  {viewingClient.firstName.charAt(0)}{viewingClient.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    {viewingClient.firstName} {viewingClient.lastName}
                  </h3>
                  <Badge variant={getTypeColor(viewingClient.clientType) as any}>
                    {getTypeLabel(viewingClient.clientType)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{viewingClient.email}</span>
                </div>

                {viewingClient.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{viewingClient.phone}</span>
                  </div>
                )}

                {viewingClient.dateOfBirth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Nació el {formatDate(viewingClient.dateOfBirth)}</span>
                  </div>
                )}

                {viewingClient.address && (
                  <div className="flex items-start gap-2">
                    <div className="h-4 w-4 text-muted-foreground mt-0.5">📍</div>
                    <span>{viewingClient.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Total Visitas</p>
                  <p className="text-lg font-bold">{viewingClient.totalVisits}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Gastado</p>
                  <p className="text-lg font-bold">${viewingClient.totalSpent}</p>
                </div>
              </div>

              {viewingClient.lastVisit && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">Última Visita</p>
                  <p className="text-blue-600">{formatLastVisit(viewingClient.lastVisit)}</p>
                </div>
              )}

              {viewingClient.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Notas</p>
                  <p className="text-sm text-gray-600">{viewingClient.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleOpenDialog(viewingClient)
                  }}
                >
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // TODO: Abrir modal de crear cita con este cliente preseleccionado
                  }}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Agendar Cita
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsViewDialogOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}