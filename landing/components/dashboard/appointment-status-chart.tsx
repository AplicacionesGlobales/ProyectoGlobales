'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface AppointmentStatusCount {
  status: string;
  count: number;
  percentage: number;
}

interface AppointmentStatusChartProps {
  statusData: AppointmentStatusCount[];
  total: number;
}

const statusConfig = {
  pending: {
    label: 'Pendientes',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Clock
  },
  confirmed: {
    label: 'Confirmadas',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: CheckCircle
  },
  completed: {
    label: 'Completadas',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Canceladas',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircle
  },
  no_show: {
    label: 'No Show',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: AlertCircle
  }
};

export function AppointmentStatusChart({ statusData, total }: AppointmentStatusChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <CardTitle>Estados de Citas</CardTitle>
        </div>
        <CardDescription>
          Distribución de {total.toLocaleString()} citas totales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusData.map((item) => {
          const config = statusConfig[item.status as keyof typeof statusConfig] || {
            label: item.status,
            color: 'bg-gray-500',
            textColor: 'text-gray-700',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            icon: AlertCircle
          };
          
          const Icon = config.icon;

          return (
            <div key={item.status} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.textColor}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={config.textColor}>
                    {item.count.toLocaleString()}
                  </Badge>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress 
                value={item.percentage} 
                className="h-2"
                style={{
                  background: '#f1f5f9'
                }}
              />
            </div>
          );
        })}
        
        {statusData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay datos de citas disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}