// landing\app\panel\dashboard\page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  TrendingDown
} from "lucide-react"
import { landingService } from "@/api/endpoints"
import { BrandDashboardMetrics } from "@/api/types"
import { RevenueAnalyticsWidget } from "@/components/panel/dashboard/RevenueAnalyticsWidget"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface BrandData {
  id: number
  name: string
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')
  
  // Estados de datos
  const [metrics, setMetrics] = useState<BrandDashboardMetrics | null>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (brandData) {
      loadDashboardData()
    }
  }, [brandData, selectedPeriod])

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

    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Error cargando datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async () => {
    if (!brandData) return

    try {
      setLoading(true)
      setError(null)

      // Cargar métricas del dashboard
      const response = await landingService.getBrandDashboardMetrics(brandData.id)

      if (response.success && response.data) {
        setMetrics(response.data)
        console.log('✅ Métricas cargadas:', response.data)
      } else {
        setError('No se pudieron cargar las métricas')
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Error cargando datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!brandData || !metrics) return

    try {
      // Generar datos para exportar basados en métricas
      const exportData = {
        brandInfo: metrics.brandInfo,
        appointments: metrics.appointments,
        clients: metrics.clients,
        revenue: metrics.revenue,
        exportDate: new Date().toISOString(),
        format
      }
      
      // Crear y descargar archivo JSON temporal
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-metrics-${brandData.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setSuccess(`Datos exportados en formato ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Error exporting data:', error)
      setError('Error exportando datos')
    }
  }

  const getPeriodLabel = (period: string): string => {
    switch (period) {
      case '7d': return 'Últimos 7 días'
      case '30d': return 'Últimos 30 días'
      case '90d': return 'Últimos 3 meses'
      case '1y': return 'Último año'
      default: return 'Últimos 30 días'
    }
  }

  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Cargando datos del dashboard...</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!brandData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido a tu panel de control. Aquí podrás ver un resumen de tu negocio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 3 meses</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadDashboardData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={() => handleExportData('pdf')}>
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Tab: Resumen General */}
        <TabsContent value="overview" className="space-y-6">
          {/* Métricas principales */}
          {metrics && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.appointments.total}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.appointments.thisMonth} este mes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.revenue.totalRevenue}</div>
                    <p className="text-xs text-muted-foreground">
                      ${metrics.revenue.averagePerAppointment.toFixed(2)} promedio por cita
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.clients.totalClients}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.clients.newClientsThisMonth} nuevos este mes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.appointments.avgDuration}min</div>
                    <p className="text-xs text-muted-foreground">Por cita</p>
                  </CardContent>
                </Card>
              </div>

              {/* Estado de citas */}
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Citas</CardTitle>
                  <CardDescription>Distribución por estado de las citas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.appointments.byStatus.map((status) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status.status === 'COMPLETED' ? 'bg-green-500' :
                            status.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="font-medium">
                            {status.status === 'COMPLETED' ? 'Completadas' :
                             status.status === 'PENDING' ? 'Pendientes' : 'Canceladas'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{status.count}</p>
                          <p className="text-xs text-muted-foreground">{status.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Información del brand */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Negocio</CardTitle>
                <CardDescription>{metrics.brandInfo.name} - {metrics.brandInfo.businessType}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge variant={metrics.brandInfo.isActive ? "default" : "secondary"}>
                      {metrics.brandInfo.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Creado</p>
                    <p className="font-medium">{format(new Date(metrics.brandInfo.createdAt), 'dd MMM yyyy', { locale: es })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Días activo</p>
                    <p className="font-medium">{metrics.brandInfo.daysSinceCreation} días</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Ingresos */}
        <TabsContent value="revenue" className="space-y-6">
          {metrics && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.revenue.totalRevenue}</div>
                    <p className="text-xs text-muted-foreground">Total acumulado</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.revenue.thisMonthRevenue}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.revenue.growthRate >= 0 ? '+' : ''}{metrics.revenue.growthRate}% vs mes anterior
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promedio por Cita</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.revenue.averagePerAppointment.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Valor promedio</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Comparación Mensual</CardTitle>
                  <CardDescription>Evolución de ingresos por mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Este Mes</h4>
                        <p className="text-sm text-muted-foreground">Octubre 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${metrics.revenue.thisMonthRevenue}</p>
                        <p className="text-sm text-muted-foreground">{metrics.appointments.thisMonth} citas</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Mes Anterior</h4>
                        <p className="text-sm text-muted-foreground">Septiembre 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${metrics.revenue.lastMonthRevenue}</p>
                        <p className="text-sm text-muted-foreground">{metrics.appointments.lastMonth} citas</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tab: Clientes */}
        <TabsContent value="clients" className="space-y-6">
          {metrics && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.clients.totalClients}</div>
                    <p className="text-xs text-muted-foreground">Clientes registrados</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nuevos Este Mes</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.clients.newClientsThisMonth}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.clients.clientGrowthRate >= 0 ? '+' : ''}{metrics.clients.clientGrowthRate}% crecimiento
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mes Anterior</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.clients.newClientsLastMonth}</div>
                    <p className="text-xs text-muted-foreground">Clientes nuevos</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Crecimiento de Clientes</CardTitle>
                  <CardDescription>Comparación mes actual vs anterior</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <div>
                          <h4 className="font-medium">Clientes Este Mes</h4>
                          <p className="text-sm text-muted-foreground">Octubre 2024</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{metrics.clients.newClientsThisMonth}</p>
                        <p className="text-sm text-muted-foreground">Nuevos clientes</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <div>
                          <h4 className="font-medium">Clientes Mes Anterior</h4>
                          <p className="text-sm text-muted-foreground">Septiembre 2024</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{metrics.clients.newClientsLastMonth}</p>
                        <p className="text-sm text-muted-foreground">Nuevos clientes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tab: Insights */}
        <TabsContent value="insights" className="space-y-6">
          {metrics && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento General</CardTitle>
                    <CardDescription>Métricas clave del negocio</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tasa de Éxito</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ 
                              width: `${((metrics.appointments.byStatus.find(s => s.status === 'COMPLETED')?.count || 0) / metrics.appointments.total * 100)}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm w-12">
                          {((metrics.appointments.byStatus.find(s => s.status === 'COMPLETED')?.count || 0) / metrics.appointments.total * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tasa de Cancelación</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ 
                              width: `${((metrics.appointments.byStatus.find(s => s.status === 'CANCELLED')?.count || 0) / metrics.appointments.total * 100)}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm w-12">
                          {((metrics.appointments.byStatus.find(s => s.status === 'CANCELLED')?.count || 0) / metrics.appointments.total * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Ingresos por Cita</span>
                      <span className="font-medium">${metrics.revenue.averagePerAppointment.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tendencias</CardTitle>
                    <CardDescription>Cambios mes a mes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Citas</span>
                      <div className="flex items-center gap-2">
                        {metrics.appointments.growthRate >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          metrics.appointments.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metrics.appointments.growthRate >= 0 ? '+' : ''}{metrics.appointments.growthRate}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Ingresos</span>
                      <div className="flex items-center gap-2">
                        {metrics.revenue.growthRate >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          metrics.revenue.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metrics.revenue.growthRate >= 0 ? '+' : ''}{metrics.revenue.growthRate}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Clientes</span>
                      <div className="flex items-center gap-2">
                        {metrics.clients.clientGrowthRate >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          metrics.clients.clientGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metrics.clients.clientGrowthRate >= 0 ? '+' : ''}{metrics.clients.clientGrowthRate}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Actividades</CardTitle>
                  <CardDescription>Estado actual del negocio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-medium">Este Mes</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Citas programadas</span>
                          <span className="font-medium">{metrics.appointments.thisMonth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Ingresos generados</span>
                          <span className="font-medium">${metrics.revenue.thisMonthRevenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Nuevos clientes</span>
                          <span className="font-medium">{metrics.clients.newClientsThisMonth}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Mes Anterior</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Citas programadas</span>
                          <span className="font-medium">{metrics.appointments.lastMonth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Ingresos generados</span>
                          <span className="font-medium">${metrics.revenue.lastMonthRevenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Nuevos clientes</span>
                          <span className="font-medium">{metrics.clients.newClientsLastMonth}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Widget de Analytics Avanzadas */}
      {brandData && (
        <div className="mt-8">
          <RevenueAnalyticsWidget brandId={brandData.id} />
        </div>
      )}
    </div>
  )
}