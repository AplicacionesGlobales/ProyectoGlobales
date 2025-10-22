// components/panel/dashboard/RevenueAnalyticsWidget.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  BarChart3,
  RefreshCw,
  Zap,
  Target,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react"
import { analyticsService } from "@/api/endpoints"
import { RevenueAnalyticsResponse } from "@/api/types"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface RevenueAnalyticsWidgetProps {
  brandId: number
}

export function RevenueAnalyticsWidget({ brandId }: RevenueAnalyticsWidgetProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<RevenueAnalyticsResponse | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAnalytics()
  }, [brandId])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await analyticsService.getRevenueAnalytics(brandId)

      if (response.success && response.data) {
        console.log('✅ Analytics response completa:', response)
        console.log('✅ Analytics data:', response.data)
        console.log('✅ Estructura de datos:', {
          daily: !!response.data.daily,
          weekly: !!response.data.weekly,
          monthly: !!response.data.monthly,
          annual: !!response.data.annual,
          financialMetrics: !!response.data.financialMetrics
        })
        setAnalytics(response.data)
      } else {
        console.error('❌ Error en respuesta analytics:', response)
        setError('No se pudieron cargar las analytics')
      }

    } catch (error) {
      console.error('Error loading analytics:', error)
      setError('Error cargando datos de analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number): string => {
    const abs = Math.abs(value)
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getTrendColor = (change: number): string => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />
    if (change < 0) return <TrendingDown className="h-3 w-3" />
    return <div className="w-3 h-3 rounded-full bg-gray-400" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Avanzadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando analytics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Avanzadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 text-sm mb-2">{error || 'No hay datos disponibles'}</p>
            <Button variant="outline" size="sm" onClick={loadAnalytics}>
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Verificar que tenemos todos los datos necesarios (usando la estructura real del backend)
  const analyticsData = analytics as any // Usar any para acceder a breakdown
  if (!analytics.daily || !analytics.weekly || !analytics.monthly || !analytics.annual || !analyticsData.breakdown) {
    const missingData = []
    if (!analytics.daily) missingData.push('daily')
    if (!analytics.weekly) missingData.push('weekly')
    if (!analytics.monthly) missingData.push('monthly')
    if (!analytics.annual) missingData.push('annual')
    if (!analyticsData.breakdown) missingData.push('breakdown')
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Avanzadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-yellow-600 text-sm mb-2">Faltan datos: {missingData.join(', ')}</p>
            <Button variant="outline" size="sm" onClick={loadAnalytics} className="mt-2">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Avanzadas de Ingresos
            </CardTitle>
            <CardDescription>
              Análisis profundo de métricas financieras • {analytics?.brandName || 'Cargando...'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="periods">Períodos</TabsTrigger>
            <TabsTrigger value="breakdown">Desglose</TabsTrigger>
            <TabsTrigger value="financial">Financiero</TabsTrigger>
          </TabsList>

          {/* Tab: Resumen General */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-green-800">Hoy</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(analytics.daily.today)}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(analytics.daily.comparison.percentageChange)}
                    <span className={`text-xs font-medium ${getTrendColor(analytics.daily.comparison.percentageChange)}`}>
                      {formatPercentage(analytics.daily.comparison.percentageChange)}
                    </span>
                    <span className="text-xs text-muted-foreground">vs ayer</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-blue-800">Esta Semana</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(analytics.weekly.currentWeek)}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(analytics.weekly.comparison.percentageChange)}
                    <span className={`text-xs font-medium ${getTrendColor(analytics.weekly.comparison.percentageChange)}`}>
                      {formatPercentage(analytics.weekly.comparison.percentageChange)}
                    </span>
                    <span className="text-xs text-muted-foreground">vs sem. ant.</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-purple-800">Este Mes</CardTitle>
                    <Target className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {formatCurrency(analytics.monthly.currentMonth)}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(analytics.monthly.comparison.percentageChange)}
                    <span className={`text-xs font-medium ${getTrendColor(analytics.monthly.comparison.percentageChange)}`}>
                      {formatPercentage(analytics.monthly.comparison.percentageChange)}
                    </span>
                    <span className="text-xs text-muted-foreground">vs mes ant.</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-orange-800">Este Año</CardTitle>
                    <Zap className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">
                    {formatCurrency(analytics.annual.currentYear)}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {getTrendIcon(analytics.annual.comparison.percentageChange)}
                    <span className={`text-xs font-medium ${getTrendColor(analytics.annual.comparison.percentageChange)}`}>
                      {formatPercentage(analytics.annual.comparison.percentageChange)}
                    </span>
                    <span className="text-xs text-muted-foreground">vs año ant.</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas principales */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rendimiento Financiero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Ingresos Totales</span>
                    <span className="text-lg font-bold">
                      {analyticsData?.breakdown?.annual?.revenue?.total ? 
                        formatCurrency(analyticsData.breakdown.annual.revenue.total) : 
                        formatCurrency(0)
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Costos Operativos</span>
                    <span className="text-sm text-red-600">
                      -{analyticsData?.breakdown?.annual?.costs?.subscription ? 
                        formatCurrency(analyticsData.breakdown.annual.costs.subscription) : 
                        formatCurrency(0)
                      }
                    </span>
                  </div>
                  <hr />
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-800">Ganancia Neta</span>
                    <span className="text-lg font-bold text-green-600">
                      {analyticsData?.breakdown?.annual?.netRevenue !== undefined ? 
                        formatCurrency(analyticsData.breakdown.annual.netRevenue) : 
                        formatCurrency(0)
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Indicadores de Tendencia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Crecimiento Diario', value: analytics.daily.comparison.percentageChange },
                      { label: 'Crecimiento Semanal', value: analytics.weekly.comparison.percentageChange },
                      { label: 'Crecimiento Mensual', value: analytics.monthly.comparison.percentageChange },
                      { label: 'Crecimiento Anual', value: analytics.annual.comparison.percentageChange }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        <div className="flex items-center gap-2">
                          {getChangeIcon(item.value)}
                          <Badge variant={item.value >= 0 ? "default" : "destructive"} className="text-xs">
                            {formatPercentage(item.value)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Períodos */}
          <TabsContent value="periods" className="space-y-4">
            <div className="grid gap-4">
              {[
                {
                  title: 'Análisis Diario',
                  current: analytics.daily.today,
                  previous: analytics.daily.yesterday,
                  comparison: analytics.daily.comparison,
                  color: 'green'
                },
                {
                  title: 'Análisis Semanal',
                  current: analytics.weekly.currentWeek,
                  previous: analytics.weekly.previousWeek,
                  comparison: analytics.weekly.comparison,
                  color: 'blue'
                },
                {
                  title: 'Análisis Mensual',
                  current: analytics.monthly.currentMonth,
                  previous: analytics.monthly.previousMonth,
                  comparison: analytics.monthly.comparison,
                  color: 'purple'
                },
                {
                  title: 'Análisis Anual',
                  current: analytics.annual.currentYear,
                  previous: analytics.annual.previousYear,
                  comparison: analytics.annual.comparison,
                  color: 'orange'
                }
              ].map((period, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{period.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Período Actual</p>
                        <p className="text-xl font-bold">{formatCurrency(period.current)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Período Anterior</p>
                        <p className="text-xl font-bold text-muted-foreground">{formatCurrency(period.previous)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Cambio</p>
                        <div className="flex items-center justify-center gap-2">
                          {getTrendIcon(period.comparison.percentageChange)}
                          <span className={`text-lg font-bold ${getTrendColor(period.comparison.percentageChange)}`}>
                            {formatPercentage(period.comparison.percentageChange)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(Math.abs(period.comparison.difference))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Desglose */}
          <TabsContent value="breakdown" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Desglose de Ingresos por Fuente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg border-blue-200 bg-blue-50">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Citas</h4>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(analyticsData?.breakdown?.annual?.revenue?.appointments || 0)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {analyticsData?.breakdown?.annual?.revenue?.total ? 
                        (((analyticsData.breakdown.annual.revenue.appointments || 0) / analyticsData.breakdown.annual.revenue.total) * 100).toFixed(1) : 
                        '0'
                      }% del total
                    </p>
                  </div>

                  <div className="text-center p-4 border rounded-lg border-green-200 bg-green-50">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium text-green-800">Servicios</h4>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(analyticsData?.breakdown?.annual?.revenue?.services || 0)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {analyticsData?.breakdown?.annual?.revenue?.total ? 
                        (((analyticsData.breakdown.annual.revenue.services || 0) / analyticsData.breakdown.annual.revenue.total) * 100).toFixed(1) : 
                        '0'
                      }% del total
                    </p>
                  </div>

                  <div className="text-center p-4 border rounded-lg border-purple-200 bg-purple-50">
                    <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-medium text-purple-800">Productos</h4>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatCurrency(analyticsData?.breakdown?.annual?.revenue?.products || 0)}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      {analyticsData?.breakdown?.annual?.revenue?.total ? 
                        (((analyticsData.breakdown.annual.revenue.products || 0) / analyticsData.breakdown.annual.revenue.total) * 100).toFixed(1) : 
                        '0'
                      }% del total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Financiero */}
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estado Financiero Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">Ingresos</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Citas:</span>
                          <span className="font-medium">{formatCurrency(analyticsData?.breakdown?.annual?.revenue?.appointments || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Servicios:</span>
                          <span className="font-medium">{formatCurrency(analyticsData?.breakdown?.annual?.revenue?.services || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Productos:</span>
                          <span className="font-medium">{formatCurrency(analyticsData?.breakdown?.annual?.revenue?.products || 0)}</span>
                        </div>
                        <hr className="border-green-300" />
                        <div className="flex justify-between font-bold text-green-800">
                          <span>Total:</span>
                          <span>{formatCurrency(analyticsData?.breakdown?.annual?.revenue?.total || 0)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-800 mb-2">costos</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Suscripción:</span>
                          <span className="font-medium">{formatCurrency(analyticsData?.breakdown?.annual?.costs?.subscription || 0)}</span>
                        </div>
                        <hr className="border-red-300" />
                        <div className="flex justify-between font-bold text-red-800">
                          <span>Total Costos:</span>
                          <span>{formatCurrency(analyticsData?.breakdown?.annual?.costs?.subscription || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Ganancia Neta</h3>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatCurrency(analyticsData?.breakdown?.annual?.netRevenue || 0)}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Margen: {analyticsData?.breakdown?.annual?.revenue?.total ? 
                          (((analyticsData.breakdown.annual.netRevenue || 0) / analyticsData.breakdown.annual.revenue.total) * 100).toFixed(1) : 
                          '0'
                        }%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}