'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function MetricsCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
  variant = 'default'
}: MetricsCardProps) {
  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return <TrendingUp className="h-3 w-3" />;
    if (trendValue < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return 'text-green-600 bg-green-50 border-green-200';
    if (trendValue < 0) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getCardVariant = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'destructive':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', getCardVariant(), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon && (
          <div className={cn(
            'p-2 rounded-full',
            variant === 'success' && 'bg-green-100 text-green-600',
            variant === 'warning' && 'bg-yellow-100 text-yellow-600',
            variant === 'destructive' && 'bg-red-100 text-red-600',
            variant === 'default' && 'bg-blue-100 text-blue-600'
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        <div className="flex items-center justify-between">
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          
          {trend && (
            <Badge 
              variant="outline" 
              className={cn('text-xs', getTrendColor(trend.value))}
            >
              {getTrendIcon(trend.value)}
              <span className="ml-1">
                {trend.value > 0 && '+'}
                {trend.value.toFixed(1)}% {trend.label}
              </span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}