'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, Image } from 'lucide-react';
import type { BrandDashboardMetrics } from '@/api/types';
import { formatCurrency, formatDate } from '@/lib/dashboard-utils';

interface ExportButtonProps {
  metrics: BrandDashboardMetrics;
  disabled?: boolean;
}

export function ExportButton({ metrics, disabled = false }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const generateCSVData = () => {
    const data = [
      ['Métrica', 'Valor', 'Descripción'],
      ['Marca', metrics.brandInfo.name, 'Nombre de la marca'],
      ['Tipo de Negocio', metrics.brandInfo.businessType, 'Categoría del negocio'],
      ['Días Activa', metrics.brandInfo.daysSinceCreation.toString(), 'Días desde la creación'],
      ['Total de Citas', metrics.appointments.total.toString(), 'Citas totales registradas'],
      ['Citas Este Mes', metrics.appointments.thisMonth.toString(), 'Citas del mes actual'],
      ['Citas Mes Pasado', metrics.appointments.lastMonth.toString(), 'Citas del mes anterior'],
      ['Crecimiento de Citas (%)', metrics.appointments.growthRate.toFixed(2), 'Porcentaje de crecimiento mensual'],
      ['Duración Promedio (min)', metrics.appointments.avgDuration.toString(), 'Duración promedio por cita'],
      ['Total de Clientes', metrics.clients.totalClients.toString(), 'Clientes registrados'],
      ['Nuevos Clientes Este Mes', metrics.clients.newClientsThisMonth.toString(), 'Clientes nuevos del mes actual'],
      ['Crecimiento de Clientes (%)', metrics.clients.clientGrowthRate.toFixed(2), 'Porcentaje de crecimiento de clientes'],
      ['Ingresos Totales (€)', metrics.revenue.totalRevenue.toFixed(2), 'Ingresos totales generados'],
      ['Ingresos Este Mes (€)', metrics.revenue.thisMonthRevenue.toFixed(2), 'Ingresos del mes actual'],
      ['Crecimiento de Ingresos (%)', metrics.revenue.growthRate.toFixed(2), 'Porcentaje de crecimiento de ingresos'],
      ['Promedio por Cita (€)', metrics.revenue.averagePerAppointment.toFixed(2), 'Ingreso promedio por cita'],
      ['Actividades Totales', metrics.activity.totalActivities.toString(), 'Actividades registradas'],
      ['Actividades Este Mes', metrics.activity.thisMonthActivities.toString(), 'Actividades del mes actual']
    ];

    // Add appointment status data
    metrics.appointments.byStatus.forEach(status => {
      data.push([
        `Citas ${status.status}`,
        status.count.toString(),
        `${status.percentage.toFixed(1)}% del total`
      ]);
    });

    return data;
  };

  const downloadCSV = () => {
    setExporting(true);
    try {
      const csvData = generateCSVData();
      const csvContent = csvData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `metricas-${metrics.brandInfo.name}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  const generateTextReport = () => {
    const report = `
REPORTE DE MÉTRICAS DE NEGOCIO
====================================

Marca: ${metrics.brandInfo.name}
Tipo de Negocio: ${metrics.brandInfo.businessType}
Fecha de Creación: ${formatDate(metrics.brandInfo.createdAt)}
Días Activa: ${metrics.brandInfo.daysSinceCreation}

RESUMEN EJECUTIVO
-----------------
• Total de Citas: ${metrics.appointments.total.toLocaleString()}
• Total de Clientes: ${metrics.clients.totalClients.toLocaleString()}
• Ingresos Totales: ${formatCurrency(metrics.revenue.totalRevenue)}
• Promedio por Cita: ${formatCurrency(metrics.revenue.averagePerAppointment)}

MÉTRICAS DE CITAS
-----------------
• Citas Este Mes: ${metrics.appointments.thisMonth}
• Citas Mes Pasado: ${metrics.appointments.lastMonth}
• Crecimiento: ${metrics.appointments.growthRate.toFixed(2)}%
• Duración Promedio: ${metrics.appointments.avgDuration} minutos

Estados de Citas:
${metrics.appointments.byStatus.map(status => 
  `• ${status.status}: ${status.count} (${status.percentage.toFixed(1)}%)`
).join('\n')}

MÉTRICAS DE CLIENTES
-------------------
• Nuevos Este Mes: ${metrics.clients.newClientsThisMonth}
• Nuevos Mes Pasado: ${metrics.clients.newClientsLastMonth}
• Crecimiento: ${metrics.clients.clientGrowthRate.toFixed(2)}%

MÉTRICAS DE INGRESOS
-------------------
• Ingresos Este Mes: ${formatCurrency(metrics.revenue.thisMonthRevenue)}
• Ingresos Mes Pasado: ${formatCurrency(metrics.revenue.lastMonthRevenue)}
• Crecimiento: ${metrics.revenue.growthRate.toFixed(2)}%

ACTIVIDAD
---------
• Total de Actividades: ${metrics.activity.totalActivities}
• Actividades Este Mes: ${metrics.activity.thisMonthActivities}

Reporte generado el: ${new Date().toLocaleString('es-ES')}
    `.trim();

    return report;
  };

  const downloadTextReport = () => {
    setExporting(true);
    try {
      const report = generateTextReport();
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte-${metrics.brandInfo.name}-${new Date().toISOString().split('T')[0]}.txt`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting text report:', error);
    } finally {
      setExporting(false);
    }
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Métricas - ${metrics.brandInfo.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            h2 { color: #1f2937; margin-top: 30px; }
            .metric { margin: 8px 0; padding: 8px; background: #f8fafc; border-left: 4px solid #3b82f6; }
            .summary { background: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <h1>Dashboard de Métricas - ${metrics.brandInfo.name}</h1>
          
          <div class="summary">
            <h2>Información General</h2>
            <p><strong>Tipo de Negocio:</strong> ${metrics.brandInfo.businessType}</p>
            <p><strong>Fecha de Creación:</strong> ${formatDate(metrics.brandInfo.createdAt)}</p>
            <p><strong>Días Activa:</strong> ${metrics.brandInfo.daysSinceCreation}</p>
          </div>

          <div class="grid">
            <div>
              <h2>Citas</h2>
              <div class="metric">Total: ${metrics.appointments.total.toLocaleString()}</div>
              <div class="metric">Este Mes: ${metrics.appointments.thisMonth}</div>
              <div class="metric">Crecimiento: ${metrics.appointments.growthRate.toFixed(2)}%</div>
            </div>

            <div>
              <h2>Clientes</h2>
              <div class="metric">Total: ${metrics.clients.totalClients.toLocaleString()}</div>
              <div class="metric">Nuevos Este Mes: ${metrics.clients.newClientsThisMonth}</div>
              <div class="metric">Crecimiento: ${metrics.clients.clientGrowthRate.toFixed(2)}%</div>
            </div>
          </div>

          <div class="summary">
            <h2>Resumen Financiero</h2>
            <p><strong>Ingresos Totales:</strong> ${formatCurrency(metrics.revenue.totalRevenue)}</p>
            <p><strong>Ingresos Este Mes:</strong> ${formatCurrency(metrics.revenue.thisMonthRevenue)}</p>
            <p><strong>Promedio por Cita:</strong> ${formatCurrency(metrics.revenue.averagePerAppointment)}</p>
          </div>

          <p style="text-align: center; margin-top: 40px; color: #6b7280; font-size: 12px;">
            Reporte generado el ${new Date().toLocaleString('es-ES')}
          </p>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || exporting}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {exporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Exportar Datos</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={downloadCSV} disabled={exporting}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Descargar CSV
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={downloadTextReport} disabled={exporting}>
          <FileText className="mr-2 h-4 w-4" />
          Reporte de Texto
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={printReport} disabled={exporting}>
          <Image className="mr-2 h-4 w-4" />
          Imprimir Reporte
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}