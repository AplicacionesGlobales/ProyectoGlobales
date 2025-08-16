// components/dashboard/DashboardCharts.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { TrendingUp, TrendingDown, Calendar, DollarSign, Users, Zap, Clock } from "lucide-react"

// ==================== REVENUE CHART ====================
interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
    appointments: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Ingresos Mensuales
        </CardTitle>
        <CardDescription>
          Evolución de ingresos y citas en los últimos meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="revenue" orientation="left" />
            <YAxis yAxisId="appointments" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${value}` : value,
                name === 'revenue' ? 'Ingresos' : 'Citas'
              ]}
            />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Bar
              yAxisId="appointments"
              dataKey="appointments"
              fill="#10b981"
              opacity={0.7}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ==================== APPOINTMENTS TREND CHART ====================
interface AppointmentsTrendProps {
  data: Array<{
    date: string;
    appointments: number;
    completed: number;
    cancelled: number;
  }>;
}

export function AppointmentsTrendChart({ data }: AppointmentsTrendProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Tendencia de Citas
        </CardTitle>
        <CardDescription>
          Citas programadas, completadas y canceladas por día
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="appointments"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Programadas"
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10b981"
              strokeWidth={2}
              name="Completadas"
            />
            <Line
              type="monotone"
              dataKey="cancelled"
              stroke="#ef4444"
              strokeWidth={2}
              name="Canceladas"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ==================== SERVICES PERFORMANCE CHART ====================
interface ServicesPerformanceProps {
  data: Array<{
    serviceName: string;
    appointments: number;
    revenue: number;
    percentage: number;
  }>;
}

export function ServicesPerformanceChart({ data }: ServicesPerformanceProps) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Performance por Servicio
        </CardTitle>
        <CardDescription>
          Distribución de ingresos por tipo de servicio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de torta */}
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista de servicios */}
          <div className="space-y-3">
            {data.map((service, index) => (
              <div key={service.serviceName} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium text-sm">{service.serviceName}</p>
                    <p className="text-xs text-muted-foreground">
                      {service.appointments} citas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">${service.revenue}</p>
                  <p className="text-xs text-muted-foreground">
                    {service.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== WEEKLY OVERVIEW CHART ====================
interface WeeklyOverviewProps {
  data: Array<{
    day: string;
    appointments: number;
    revenue: number;
  }>;
}

export function WeeklyOverviewChart({ data }: WeeklyOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Resumen Semanal
        </CardTitle>
        <CardDescription>
          Citas e ingresos por día de la semana
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis yAxisId="appointments" orientation="left" />
            <YAxis yAxisId="revenue" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${value}` : value,
                name === 'revenue' ? 'Ingresos' : 'Citas'
              ]}
            />
            <Legend />
            <Bar
              yAxisId="appointments"
              dataKey="appointments"
              fill="#3b82f6"
              name="Citas"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="revenue"
              dataKey="revenue"
              fill="#10b981"
              name="Ingresos ($)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ==================== GROWTH METRICS CARDS ====================
interface GrowthMetricsProps {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export function GrowthMetricsCards({ todayRevenue, weekRevenue, monthRevenue, growth }: GrowthMetricsProps) {
  const metrics = [
    {
      title: "Ingresos Hoy",
      value: todayRevenue,
      growth: growth.daily,
      period: "vs ayer",
      icon: DollarSign
    },
    {
      title: "Ingresos Semana",
      value: weekRevenue,
      growth: growth.weekly,
      period: "vs semana pasada",
      icon: TrendingUp
    },
    {
      title: "Ingresos Mes",
      value: monthRevenue,
      growth: growth.monthly,
      period: "vs mes pasado",
      icon: DollarSign
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.growth >= 0;

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metric.value.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={isPositive ? "text-green-600" : "text-red-600"}>
                  {isPositive ? '+' : ''}{metric.growth.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">{metric.period}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ==================== CLIENT ANALYTICS CHART ====================
interface ClientAnalyticsProps {
  data: Array<{
    month: string;
    newClients: number;
    totalClients: number;
  }>;
  topClients: Array<{
    name: string;
    totalVisits: number;
    totalSpent: number;
  }>;
}

export function ClientAnalyticsChart({ data, topClients }: ClientAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Analytics de Clientes
        </CardTitle>
        <CardDescription>
          Crecimiento de clientes y top clientes por gastos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de crecimiento */}
          <div>
            <h4 className="text-sm font-medium mb-3">Crecimiento de Clientes</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="newClients"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  name="Nuevos"
                />
                <Area
                  type="monotone"
                  dataKey="totalClients"
                  stackId="2"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  name="Total"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top clientes */}
          <div>
            <h4 className="text-sm font-medium mb-3">Top Clientes</h4>
            <div className="space-y-3">
              {topClients.slice(0, 5).map((client, index) => (
                <div key={client.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {client.totalVisits} visitas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${client.totalSpent}</p>
                    <Badge variant="secondary" className="text-xs">
                      VIP
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== PEAK HOURS CHART ====================
interface PeakHoursProps {
  data: Array<{
    hour: string;
    appointments: number;
    percentage: number;
  }>;
}

export function PeakHoursChart({ data }: PeakHoursProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horas Pico
        </CardTitle>
        <CardDescription>
          Distribución de citas por hora del día
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="hour" type="category" width={60} />
            <Tooltip 
              formatter={(value, name) => [
                `${value} citas (${data.find(d => d.appointments === value)?.percentage.toFixed(1)}%)`,
                'Citas'
              ]}
            />
            <Bar
              dataKey="appointments"
              fill="#3b82f6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ==================== ACTIVITY FEED ====================
interface ActivityFeedProps {
  activities: Array<{
    id: number;
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment_created':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'appointment_completed':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'appointment_cancelled':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'client_created':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'payment_received':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'appointment_created':
        return 'border-blue-200 bg-blue-50';
      case 'appointment_completed':
        return 'border-green-200 bg-green-50';
      case 'appointment_cancelled':
        return 'border-red-200 bg-red-50';
      case 'client_created':
        return 'border-purple-200 bg-purple-50';
      case 'payment_received':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'Ahora';
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
      return `${Math.floor(diffInMinutes / 1440)}d`;
    } catch {
      return timestamp;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>
          Últimos eventos en tu negocio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-3 rounded-lg border ${getActivityColor(activity.type)} transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== COMPARISON METRICS ====================
interface ComparisonMetricsProps {
  current: {
    appointments: number;
    revenue: number;
    clients: number;
  };
  previous: {
    appointments: number;
    revenue: number;
    clients: number;
  };
  growth: {
    appointments: number;
    revenue: number;
    clients: number;
  };
  period: string;
}

export function ComparisonMetricsCards({ current, previous, growth, period }: ComparisonMetricsProps) {
  const metrics = [
    {
      title: "Citas",
      current: current.appointments,
      previous: previous.appointments,
      growth: growth.appointments,
      icon: Calendar,
      format: (value: number) => value.toString()
    },
    {
      title: "Ingresos",
      current: current.revenue,
      previous: previous.revenue,
      growth: growth.revenue,
      icon: DollarSign,
      format: (value: number) => `${value.toLocaleString()}`
    },
    {
      title: "Clientes",
      current: current.clients,
      previous: previous.clients,
      growth: growth.clients,
      icon: Users,
      format: (value: number) => value.toString()
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.growth >= 0;

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title} - {period}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.format(metric.current)}</div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-muted-foreground">
                  Anterior: {metric.format(metric.previous)}
                </span>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={isPositive ? "text-green-600" : "text-red-600"}>
                    {isPositive ? '+' : ''}{metric.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}