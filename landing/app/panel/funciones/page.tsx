// landing\app\panel\funciones\page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Zap, 
  Plus, 
  Clock, 
  DollarSign, 
  Edit, 
  Trash2, 
  Search,
  TrendingUp,
  Briefcase,
  Crown,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react"
import { functionsService, BrandFunction, AvailableFeature, FunctionStats } from "@/services/functionsService"
import { 
  FunctionCategory, 
  CATEGORY_LABELS, 
  CATEGORY_COLORS,
  FUNCTION_TEMPLATES,
  functionUtils,
  FunctionFormData,
  COMMON_DURATIONS,
  PRICE_RANGES
} from "@/types/functions.types"

interface BrandData {
  id: number
  name: string
  businessType?: string
}

export default function FuncionesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [functions, setFunctions] = useState<BrandFunction[]>([])
  const [availableFeatures, setAvailableFeatures] = useState<AvailableFeature[]>([])
  const [stats, setStats] = useState<FunctionStats | null>(null)
  
  // Estados del UI
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FunctionCategory | 'all'>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFunction, setEditingFunction] = useState<BrandFunction | null>(null)
  
  // Estados del formulario
  const [formData, setFormData] = useState<FunctionFormData>({
    title: '',
    description: '',
    currentPrice: 0,
    duration: 30,
    isActive: true,
    category: FunctionCategory.ESSENTIAL
  })
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null)

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

      // Cargar funciones, features disponibles y estadísticas en paralelo
      const [functionsResponse, featuresResponse, statsResponse] = await Promise.all([
        functionsService.getBrandFunctions(brand.id),
        functionsService.getAvailableFeatures(brand.businessType),
        functionsService.getFunctionStats(brand.id)
      ])

      // Procesar funciones
      if (functionsResponse.success && functionsResponse.data) {
        setFunctions(functionUtils.sortFunctions(functionsResponse.data))
      } else {
        console.warn('No functions found or error:', functionsResponse.errors)
        setFunctions([])
      }

      // Procesar features disponibles
      if (featuresResponse.success && featuresResponse.data) {
        setAvailableFeatures(featuresResponse.data)
      } else {
        console.warn('No available features found:', featuresResponse.errors)
        setAvailableFeatures([])
      }

      // Procesar estadísticas
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

  const handleSaveFunction = async () => {
    if (!brandData) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const functionData = {
        ...formData,
        featureId: selectedFeatureId
      }

      let response
      if (editingFunction) {
        response = await functionsService.updateFunction(brandData.id, editingFunction.id, functionData)
      } else {
        response = await functionsService.createFunction(brandData.id, functionData)
      }

      if (response.success) {
        setSuccess(editingFunction ? 'Función actualizada exitosamente' : 'Función creada exitosamente')
        setIsDialogOpen(false)
        resetForm()
        await loadInitialData() // Recargar datos
      } else {
        setError(response.errors?.join(', ') || 'Error al guardar la función')
      }
    } catch (error) {
      console.error('Error saving function:', error)
      setError('Error al guardar la función')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteFunction = async (functionId: number) => {
    if (!brandData) return

    try {
      setSaving(true)
      setError(null)

      const response = await functionsService.deleteFunction(brandData.id, functionId)

      if (response.success) {
        setSuccess('Función eliminada exitosamente')
        await loadInitialData() // Recargar datos
      } else {
        setError(response.errors?.join(', ') || 'Error al eliminar la función')
      }
    } catch (error) {
      console.error('Error deleting function:', error)
      setError('Error al eliminar la función')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      currentPrice: 0,
      duration: 30,
      isActive: true,
      category: FunctionCategory.ESSENTIAL
    })
    setSelectedFeatureId(null)
    setEditingFunction(null)
  }

  const openEditDialog = (func: BrandFunction) => {
    setEditingFunction(func)
    setFormData({
      title: func.title,
      description: func.description || '',
      currentPrice: func.currentPrice,
      duration: func.duration,
      isActive: func.isActive,
      category: func.category
    })
    setSelectedFeatureId(func.featureId)
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // Filtrar funciones
  const filteredFunctions = functions.filter(func => {
    const matchesSearch = func.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         func.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || func.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Funciones del Negocio</h1>
          <p className="text-muted-foreground">
            Gestiona los servicios y funciones disponibles para {brandData?.name}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Función
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funciones</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFunctions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeFunctions} activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.averagePrice}</div>
              <p className="text-xs text-muted-foreground">
                Precio medio por servicio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageDuration}min</div>
              <p className="text-xs text-muted-foreground">
                Tiempo medio por servicio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Este Mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyBookings}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.bookingGrowth}% vs mes anterior
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar funciones</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as FunctionCategory | 'all')}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Functions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFunctions.map((func) => (
          <Card key={func.id} className={`${!func.isActive ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{func.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {func.description}
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className={`bg-${CATEGORY_COLORS[func.category as FunctionCategory]}-500 text-white`}
                >
                  {CATEGORY_LABELS[func.category as FunctionCategory]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Precio:</span>
                  <span className="font-medium">${func.currentPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duración:</span>
                  <span className="font-medium">{func.duration} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Badge variant={func.isActive ? "default" : "secondary"}>
                    {func.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(func)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteFunction(func.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFunctions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay funciones</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all'
                ? 'No se encontraron funciones con los filtros aplicados.'
                : 'Aún no has creado ninguna función para tu negocio.'}
            </p>
            {(!searchTerm && selectedCategory === 'all') && (
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Función
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFunction ? 'Editar Función' : 'Nueva Función'}
            </DialogTitle>
            <DialogDescription>
              {editingFunction 
                ? 'Modifica los detalles de esta función existente.'
                : 'Crea una nueva función para tu negocio.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: Corte de cabello"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value as FunctionCategory})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe qué incluye este servicio..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({...formData, currentPrice: Number(e.target.value)})}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duración (min) *</Label>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(value) => setFormData({...formData, duration: Number(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[15, 30, 45, 60, 90, 120, 180].map((duration: number) => (
                      <SelectItem key={duration} value={duration.toString()}>
                        {duration} minutos
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
              <Label htmlFor="active">Función activa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFunction} disabled={saving}>
              {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              {editingFunction ? 'Actualizar' : 'Crear'} Función
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}