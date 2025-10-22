// components/panel/config/reports-tab.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Download, Eye, Calendar, TrendingUp, Users, DollarSign } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface ReportsTabProps {
  brandId?: number
}

type ReportPeriod = 'weekly' | 'monthly' | 'all'

interface ReportData {
  marca: {
    id: number
    nombre: string
    descripcion: string | null
  }
  periodo: {
    tipo: ReportPeriod
    etiqueta: string
  }
  fechaGeneracion: string
  citas: {
    datos: any[]
    resumen: {
      total: number
      porEstado: {
        completadas: number
        confirmadas: number
        enProgreso: number
        pendientes: number
        canceladas: number
        noAsistieron: number
      }
      tasaCompletitud: number
      ingresos: number
    }
  }
  pagos: {
    suscripciones: {
      total: number
      completados: number
      ingresos: number
    }
  }
  totales: {
    ingresosTotal: number
    ingresosCitas: number
    ingresosSuscripciones: number
  }
}

export const ReportsTab = ({ brandId }: ReportsTabProps) => {
  const [period, setPeriod] = useState<ReportPeriod>('monthly')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  const periodLabels = {
    weekly: 'Última Semana',
    monthly: 'Último Mes',
    all: 'Todo el Histórico'
  }

  const handlePreviewReport = async () => {
    if (!brandId) {
      toast.error('No se encontró el ID de la marca')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/reports/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_brand: brandId,
          period: period
        })
      })

      if (!response.ok) {
        throw new Error('Error al generar el reporte')
      }

      const result = await response.json()
      setReportData(result.data)
      setShowPreview(true)
      toast.success('Reporte generado exitosamente')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadExcel = async () => {
    if (!brandId) {
      toast.error('No se encontró el ID de la marca')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/reports/${brandId}/download?period=${period}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Error al descargar el reporte')
      }

      // Convertir la respuesta a blob
      const blob = await response.blob()
      
      // Crear URL temporal para el blob
      const url = window.URL.createObjectURL(blob)
      
      // Crear elemento <a> temporal para descargar
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-ventas-${brandId}-${period}.xlsx`
      document.body.appendChild(a)
      a.click()
      
      // Limpiar
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Reporte descargado exitosamente')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al descargar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (estado: string) => {
    const badges = {
      'Completada': <Badge className="bg-green-500">Completada</Badge>,
      'Confirmada': <Badge className="bg-blue-500">Confirmada</Badge>,
      'En Progreso': <Badge className="bg-yellow-500">En Progreso</Badge>,
      'Pendiente': <Badge className="bg-orange-500">Pendiente</Badge>,
      'Cancelada': <Badge variant="destructive">Cancelada</Badge>,
      'No Asistió': <Badge variant="destructive">No Asistió</Badge>,
    }
    return badges[estado as keyof typeof badges] || <Badge>{estado}</Badge>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reportes de Ventas y Citas
          </CardTitle>
          <CardDescription>
            Genera reportes detallados de tus citas, ventas e ingresos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de período */}
          <div className="space-y-2">
            <Label htmlFor="period">Período del Reporte</Label>
            <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
              <SelectTrigger id="period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Última Semana (7 días)
                  </div>
                </SelectItem>
                <SelectItem value="monthly">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Último Mes (30 días)
                  </div>
                </SelectItem>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Todo el Histórico
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Selecciona el período de tiempo para el reporte
            </p>
          </div>

          {/* Información sobre el reporte */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <h4 className="font-semibold text-sm">El reporte incluye:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Información completa de citas (cliente, servicio, estado, precio)</span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Datos de pagos relacionados con citas y suscripciones</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Métricas: total de citas por estado, tasa de completitud, ingresos totales</span>
              </li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handlePreviewReport}
              disabled={loading || !brandId}
              className="flex-1"
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              {loading ? 'Generando...' : 'Previsualizar Reporte'}
            </Button>
            <Button 
              onClick={handleDownloadExcel}
              disabled={loading || !brandId}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Descargando...' : 'Descargar Excel'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de previsualización */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Reporte de Ventas - {reportData?.periodo.etiqueta}</DialogTitle>
            <DialogDescription>
              {reportData?.marca.nombre} • Generado el {reportData && new Date(reportData.fechaGeneracion).toLocaleString('es-ES')}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            {reportData && (
              <div className="space-y-6">
                {/* Resumen general */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total de Citas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reportData.citas.resumen.total}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {reportData.citas.resumen.tasaCompletitud.toFixed(1)}% completadas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Ingresos por Citas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(reportData.citas.resumen.ingresos)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        De {reportData.citas.resumen.porEstado.completadas} citas completadas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(reportData.totales.ingresosTotal)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Citas + Suscripciones
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Estado de citas */}
                <div>
                  <h4 className="font-semibold mb-3">Resumen por Estado</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm">Completadas</span>
                      <Badge className="bg-green-500">{reportData.citas.resumen.porEstado.completadas}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm">Confirmadas</span>
                      <Badge className="bg-blue-500">{reportData.citas.resumen.porEstado.confirmadas}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm">En Progreso</span>
                      <Badge className="bg-yellow-500">{reportData.citas.resumen.porEstado.enProgreso}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm">Pendientes</span>
                      <Badge className="bg-orange-500">{reportData.citas.resumen.porEstado.pendientes}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm">Canceladas</span>
                      <Badge variant="destructive">{reportData.citas.resumen.porEstado.canceladas}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm">No Asistieron</span>
                      <Badge variant="destructive">{reportData.citas.resumen.porEstado.noAsistieron}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Detalles de citas */}
                <div>
                  <h4 className="font-semibold mb-3">Últimas Citas ({reportData.citas.datos.length})</h4>
                  <div className="space-y-3">
                    {reportData.citas.datos.slice(0, 10).map((cita: any) => (
                      <div key={cita.id} className="p-4 rounded-lg border space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">#{cita.id}</span>
                              {getStatusBadge(cita.estado.etiqueta)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(cita.fecha).toLocaleString('es-ES')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(cita.servicio.precio)}</p>
                            <p className="text-xs text-muted-foreground">{cita.servicio.nombre}</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <p><strong>Cliente:</strong> {cita.cliente.nombre}</p>
                          <p className="text-muted-foreground">{cita.cliente.email}</p>
                        </div>
                      </div>
                    ))}
                    {reportData.citas.datos.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Y {reportData.citas.datos.length - 10} citas más... Descarga el Excel para ver el reporte completo
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cerrar
            </Button>
            <Button onClick={handleDownloadExcel} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Descargar Excel Completo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
