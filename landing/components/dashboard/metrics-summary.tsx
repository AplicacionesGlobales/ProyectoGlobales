'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar } from 'lucide-react';

interface MetricsSummaryProps {
  appointments: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
  };
  clients: {
    totalClients: number;
    newClientsThisMonth: number;
    clientGrowthRate: number;
  };
  revenue: {
    totalRevenue: number;
    thisMonthRevenue: number;
    growthRate: number;
    averagePerAppointment: number;
  };
}

export function MetricsSummary({ appointments, clients, revenue }: MetricsSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendBadge = (rate: number, label: string) => {
    const isPositive = rate >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${
          isPositive 
            ? 'text-green-600 bg-green-50 border-green-200' 
            : 'text-red-600 bg-red-50 border-red-200'
        }`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {isPositive && '+'}{rate.toFixed(1)}% {label}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Appointments Summary */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-blue-800">
              Citas Totales
            </CardTitle>
            <CardDescription className="text-blue-600">
              {appointments.thisMonth} este mes
            </CardDescription>
          </div>
          <div className="p-2 bg-blue-200 rounded-full">
            <Calendar className="h-4 w-4 text-blue-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 mb-2">
            {appointments.total.toLocaleString()}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-600">
              {appointments.lastMonth} el mes pasado
            </span>
            {getTrendBadge(appointments.growthRate, 'vs mes anterior')}
          </div>
        </CardContent>
      </Card>

      {/* Clients Summary */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-purple-800">
              Clientes Totales
            </CardTitle>
            <CardDescription className="text-purple-600">
              {clients.newClientsThisMonth} nuevos este mes
            </CardDescription>
          </div>
          <div className="p-2 bg-purple-200 rounded-full">
            <Users className="h-4 w-4 text-purple-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 mb-2">
            {clients.totalClients.toLocaleString()}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-600">
              Base de clientes
            </span>
            {getTrendBadge(clients.clientGrowthRate, 'crecimiento')}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Summary */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-green-800">
              Ingresos Totales
            </CardTitle>
            <CardDescription className="text-green-600">
              {formatCurrency(revenue.averagePerAppointment)} promedio por cita
            </CardDescription>
          </div>
          <div className="p-2 bg-green-200 rounded-full">
            <DollarSign className="h-4 w-4 text-green-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900 mb-2">
            {formatCurrency(revenue.totalRevenue)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-600">
              {formatCurrency(revenue.thisMonthRevenue)} este mes
            </span>
            {getTrendBadge(revenue.growthRate, 'vs mes anterior')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}