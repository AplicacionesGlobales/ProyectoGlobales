// components/dashboard/ComparisonWidget.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Users,
  RefreshCw,
  BarChart3
} from "lucide-react"
import { dashboardService, ComparisonPeriod } from "@/services/dashboardService"
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

interface ComparisonWidgetProps {
  brandId: number
}

type ComparisonType = 'week' | 'month' | 'quarter'

export function ComparisonWidget({ brandId }: ComparisonWidgetProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comparisonType, setComparisonType] = useState<ComparisonType>('week')
  const [comparisonData, setComparisonData] = useState<ComparisonPeriod | null>(null)

  useEffect(() => {
    loadComparisonData()
  }, [brandId, comparisonType])

  const getDateRanges = (type: ComparisonType) => {
    const now = new Date()
    
    switch (type) {
      case 'week':
        const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 })
        const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 })
        const previousWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
        const previousWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
        
        return {
          current: {
            start: format(currentWeekStart, 'yyyy-MM-dd'),
            end: format(currentWeekEnd, 'yyyy-MM-dd')
          },
          previous: {
            start: format(previousWeekStart, 'yyyy-MM-dd'),
            end: format(previousWeekEnd, 'yyyy-MM-dd')
          }
        }
        
      case 'month':
        const currentMonthStart = startOfMonth(now)
        const currentMonthEnd = endOfMonth(now)
        const previousMonthStart = startOfMonth(subMonths(now, 1))
        const previousMonthEnd = endOfMonth(subMonths(now, 1))
        
        return {
          current: {
            start: format(currentMonthStart, 'yyyy-MM-dd'),
            end: format(currentMonthEnd, 'yyyy-MM-dd')
          },
          previous: {
            start: format(previousMonthStart, 'yyyy-MM-dd'),
            end: format(previousMonthEnd, 'yyyy-MM-dd')
          }
        }
        
      case 'quarter':
        const currentQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        const currentQuarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0)
        const previousQuarterStart = new Date(currentQuarterStart)
        previousQuarterStart.setMonth(currentQuarterStart.getMonth() - 3)
        const previousQuarterEnd = new Date(currentQuarterEnd)
        previousQuarterEnd.setMonth(currentQuarterEnd.getMonth() - 3)
        
        return {
          current: {
            start: format(currentQuarterStart, 'yyyy-MM-dd'),
            end: format(currentQuarterEnd, 'yyyy-MM-dd')
          },
          previous: {
            start: format(previousQuarterStart, 'yyyy-MM-dd'),
            end: format(previousQuarterEnd, 'yyyy-MM-dd')
          }
        }
        
      default:
        return {
          current: { start: '', end: '' },
          previous: { start: '', end: '' }
        }
    }
  }

  const loadComparisonData = async () => {
    try {
      setLoading(true)
      setError(null)

      const ranges = getDateRanges(comparisonType)
      
      const response = await dashboardService.getPerformanceComparison(
        brandId,
        ranges.current.start,
        ranges.current.end,
        ranges.previous.start,
        ranges.previous.end
      )

      if (response.success && response.data) {
        setComparisonData(response.data)
      } else {
        setError(response.errors?.[0]?.description || 'Error cargando comparación')
      }

    } catch (error) {
      console.error('Error loading comparison data:', error)
      setError('Error cargando datos de comparación')
    } finally {
      setLoading(false)
    }
  }

  const getComparisonLabel = (type: ComparisonType): string => {
    switch (type) {
      case 'week':
        return 'Esta Semana vs Semana Anterior'
      case 'month':
        return 'Este Mes vs Mes Anterior'
      case 'quarter':
        return 'Este Trimestre vs Trimestre Anterior'
      default:
        return 'Comparación'
    }
  }

  const getPeriodLabel = (type: ComparisonType): string => {
    switch (type) {
      case 'week':
        return 'semana'
      case 'month':
        return 'mes'
      case 'quarter':
        return 'trimestre'
      default:
        return 'período'
    }
  }

  const formatValue = (value: number, type: 'currency' | 'number'): string => {
    if (type === 'currency') {
      return `$${value.toLocaleString()}`
    }
    return value.toString()
  }

  const getGrowthColor = (growth: number): string => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-3 w-3" />
    if (growth < 0) return <TrendingDown className="h-3 w-3" />
    return <div className="h-3 w-3 rounded-full bg-gray-400" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comparación de Períodos
            </CardTitle>
            <CardDescription>
              {getComparisonLabel(comparisonType)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={comparisonType} onValueChange={(value) => setComparisonType(value as ComparisonType)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semanal</SelectItem>
                <SelectItem value="month">Mensual</SelectItem>
                <SelectItem value="quarter">Trimestral</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={loadComparisonData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando comparación...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={loadComparisonData} className="mt-2">
              Reintentar
            </Button>
          </div>
        ) : comparisonData ? (
          <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: 'Citas',
                  current: comparisonData.current.appointments,
                  previous: comparisonData.previous.appointments,
                  growth: comparisonData.growth.appointments,
                  icon: Calendar,
                  type: 'number' as const
                },
                {
                  title: 'Ingresos',
                  current: comparisonData.current.revenue,
                  previous: comparisonData.previous.revenue,
                  growth: comparisonData.growth.revenue,
                  icon: DollarSign,
                  type: 'currency' as const
                },
                {
                  title: 'Clientes',
                  current: comparisonData.current.clients,
                  previous: comparisonData.previous.clients,
                  growth: comparisonData.growth.clients,
                  icon: Users,
                  type: 'number' as const
                }
              ].map((metric, index) => {
                const Icon = metric.icon
                const isPositive = metric.growth >= 0
                
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{metric.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getGrowthIcon(metric.growth)}
                        <span className={`text-xs font-medium ${getGrowthColor(metric.growth)}`}>
                          {isPositive ? '+' : ''}{metric.growth.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Este {getPeriodLabel(comparisonType)}</span>
                        <span className="font-medium">{formatValue(metric.current, metric.type)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{getPeriodLabel(comparisonType)} anterior</span>
                        <span className="text-sm text-muted-foreground">{formatValue(metric.previous, metric.type)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Resumen de tendencias */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Resumen de Tendencias</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="text-center">
                  <div className={`text-lg font-bold ${getGrowthColor(comparisonData.growth.appointments)}`}>
                    {comparisonData.growth.appointments > 0 ? '+' : ''}{comparisonData.growth.appointments.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Citas</p>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getGrowthColor(comparisonData.growth.revenue)}`}>
                    {comparisonData.growth.revenue > 0 ? '+' : ''}{comparisonData.growth.revenue.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Ingresos</p>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getGrowthColor(comparisonData.growth.clients)}`}>
                    {comparisonData.growth.clients > 0 ? '+' : ''}{comparisonData.growth.clients.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Clientes</p>
                </div>
              </div>
            </div>

            {/* Indicadores de performance */}
            <div className="flex flex-wrap gap-2">
              {comparisonData.growth.appointments > 0 && (
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  📈 Más citas que el {getPeriodLabel(comparisonType)} anterior
                </Badge>
              )}
              {comparisonData.growth.revenue > 0 && (
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  💰 Crecimiento en ingresos
                </Badge>
              )}
              {comparisonData.growth.clients > 0 && (
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  👥 Más clientes nuevos
                </Badge>
              )}
              {comparisonData.growth.appointments < 0 && comparisonData.growth.revenue < 0 && (
                <Badge variant="secondary" className="text-orange-700 bg-orange-100">
                  ⚠️ Oportunidad de mejora
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No hay datos de comparación disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}