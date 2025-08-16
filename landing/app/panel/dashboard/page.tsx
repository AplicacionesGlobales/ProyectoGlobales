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
  BarChart3
} from "lucide-react"
import { 
  dashboardService, 
  DashboardStats, 
  TodayStats, 
  RevenueStats,
  ClientDashboardStats,
  BusinessInsights
} from "@/services/dashboardService"
import {
  RevenueChart,
  AppointmentsTrendChart,
  ServicesPerformanceChart,
  WeeklyOverviewChart,
  GrowthMetricsCards,
  ClientAnalyticsChart,
  PeakHoursChart,
  ActivityFeed,
  ComparisonMetricsCards
} from "@/components/dashboard/DashboardCharts"
import { format, subDays, subMonths } from 'date-fns'
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
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null)
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null)
  const [clientStats, setClientStats] = useState<ClientDashboardStats | null>(null)
  const [businessInsights, setBusinessInsights] = useState<BusinessInsights | null>(null)

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

      // Cargar todas las estadísticas en paralelo
      const [
        dashboardResponse,
        todayResponse,
        revenueResponse,
        clientResponse,
        insightsResponse
      ] = await Promise.all([
        dashboardService.getDashboardStats(brandData.id, selectedPeriod),
        dashboardService.getTodayStats(brandData.id),
        dashboardService.getRevenueReport(brandData.id, 
          format(subDays(new Date(), 30), 'yyyy-MM-dd'),
          format(new Date(), 'yyyy-MM-dd')
        ),
        dashboardService.getClientAnalytics(brandData.id),
        dashboardService.getBusinessInsights(brandData.id)
      ])

      // Procesar respuestas
      if (dashboardResponse.success && dashboardResponse.data) {
        setDashboardStats(dashboardResponse.data)
      }

      if (todayResponse.success && todayResponse.data) {
        setTodayStats(todayResponse.data)
      }

      if (revenueResponse.success && revenueResponse.data) {
        setRevenueStats(revenueResponse.data)
      }

      if (clientResponse.success && clientResponse.data) {
        setClientStats(clientResponse.data)
      }

      if (insightsResponse.success && insightsResponse.data) {
        setBusinessInsights(insightsResponse.data)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Error cargando datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!brandData) return

    try {
      const response = await dashboardService.exportDashboardData(brandData.id, format, selectedPeriod)
      
      if (response.success && response.data?.downloadUrl) {
        // Abrir enlace de descarga
        window.open(response.data.downloadUrl, '_blank')
        setSuccess(`Exportando datos en formato ${format.toUpperCase()}...`)
      } else {
        setError(response.errors?.[0]?.description || 'Error exportando datos')
      }
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

  if (loading && !dashboardStats) {
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
          {/* Métricas de hoy */}
          {todayStats && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.totalAppointments}</div>
                  <p className="text-xs text-muted-foreground">
                    {todayStats.completedAppointments} completadas, {todayStats.pendingAppointments} pendientes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${todayStats.totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">
                    {todayStats.completedAppointments > 0 
                      ? `$${Math.round(todayStats.totalRevenue / todayStats.completedAppointments)} promedio`
                      : 'Sin ingresos aún'
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Cita</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {todayStats.nextAppointment ? (
                    <>
                      <div className="text-2xl font-bold">{todayStats.nextAppointment.startTime}</div>
                      <p className="text-xs text-muted-foreground truncate">
                        {todayStats.nextAppointment.clientName}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">--:--</div>
                      <p className="text-xs text-muted-foreground">Sin citas programadas</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.averageServiceTime}min</div>
                  <p className="text-xs text-muted-foreground">Por servicio</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gráficos principales */}
          <div className="grid gap-6 md:grid-cols-2">
            {dashboardStats?.weeklyStats && (
              <WeeklyOverviewChart data={dashboardStats.weeklyStats.appointmentsByDay} />
            )}
            {dashboardStats?.appointmentTrends && (
              <AppointmentsTrendChart data={dashboardStats.appointmentTrends} />
            )}
          </div>

          {/* Servicios y actividad */}
          <div className="grid gap-6 md:grid-cols-3">
            {dashboardStats?.topServices && (
              <div className="md:col-span-2">
                <ServicesPerformanceChart 
                  data={dashboardStats.topServices.map(service => ({
                    serviceName: service.serviceName,
                    appointments: service.totalAppointments,
                    revenue: service.totalRevenue,
                    percentage: service.popularity
                  }))}
                />
              </div>
            )}
            {dashboardStats?.recentActivity && (
              <ActivityFeed activities={dashboardStats.recentActivity} />
            )}
          </div>
        </TabsContent>

        {/* Tab: Ingresos */}
        <TabsContent value="revenue" className="space-y-6">
          {revenueStats && (
            <>
              <GrowthMetricsCards
                todayRevenue={revenueStats.todayRevenue}
                weekRevenue={revenueStats.weekRevenue}
                monthRevenue={revenueStats.monthRevenue}
                growth={revenueStats.revenueGrowth}
              />
              
              <div className="grid gap-6 md:grid-cols-2">
                <RevenueChart data={revenueStats.monthlyRevenueChart} />
                <Card>
                  <CardHeader>
                    <CardTitle>Ingresos por Servicio</CardTitle>
                    <CardDescription>Distribución de ingresos por tipo de servicio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {revenueStats.revenueByService.map((service, index) => (
                        <div key={service.serviceName} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="font-medium">{service.serviceName}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${service.revenue}</p>
                            <p className="text-xs text-muted-foreground">{service.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Tab: Clientes */}
        <TabsContent value="clients" className="space-y-6">
          {clientStats && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientStats.totalClients}</div>
                    <p className="text-xs text-muted-foreground">
                      {clientStats.activeClients} activos
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nuevos Este Mes</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientStats.newClientsThisMonth}</div>
                    <p className="text-xs text-muted-foreground">Clientes nuevos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Retención</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientStats.clientRetentionRate}%</div>
                    <p className="text-xs text-muted-foreground">Tasa de retención</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Visitas Promedio</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientStats.averageVisitsPerClient}</div>
                    <p className="text-xs text-muted-foreground">Por cliente</p>
                  </CardContent>
                </Card>
              </div>

              <ClientAnalyticsChart 
                data={clientStats.clientGrowth}
                topClients={clientStats.topClients}
              />
            </>
          )}
        </TabsContent>

        {/* Tab: Insights */}
        <TabsContent value="insights" className="space-y-6">
          {businessInsights && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <PeakHoursChart data={businessInsights.peakHours} />
                <Card>
                  <CardHeader>
                    <CardTitle>Días Más Ocupados</CardTitle>
                    <CardDescription>Distribución de citas por día de la semana</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {businessInsights.peakDays.map((day, index) => (
                        <div key={day.day} className="flex items-center justify-between">
                          <span className="font-medium">{day.day}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${day.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-12">
                              {day.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance de Servicios</CardTitle>
                  <CardDescription>Análisis detallado del rendimiento por servicio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessInsights.servicePerformance.map((service, index) => (
                      <div key={service.serviceName} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{service.serviceName}</h4>
                          <Badge variant="secondary">{service.appointments} citas</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Ingresos</p>
                            <p className="font-medium">${service.revenue}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rentabilidad</p>
                            <p className="font-medium">{service.profitability}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Satisfacción</p>
                            <p className="font-medium">{service.satisfaction}/5</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tendencias Estacionales</CardTitle>
                  <CardDescription>Análisis de patrones por temporada</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {businessInsights.seasonalTrends.map((trend, index) => (
                      <div key={trend.period} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{trend.period}</h4>
                          <div className="flex items-center gap-1">
                            {trend.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : trend.trend === 'down' ? (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full bg-gray-400" />
                            )}
                            <span className={`text-xs ${
                              trend.trend === 'up' ? 'text-green-600' : 
                              trend.trend === 'down' ? 'text-red-600' : 
                              'text-gray-600'
                            }`}>
                              {trend.trend === 'up' ? 'Crecimiento' : 
                               trend.trend === 'down' ? 'Descenso' : 
                               'Estable'}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Citas</p>
                            <p className="font-medium">{trend.appointments}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Ingresos</p>
                            <p className="font-medium">${trend.revenue}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}