// Utility functions for dashboard components

/**
 * Format currency values in EUR
 */
export const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options
  }).format(amount);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format numbers with locale
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('es-ES');
};

/**
 * Format dates in Spanish locale
 */
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  });
};

/**
 * Get time difference in human readable format
 */
export const getTimeAgo = (days: number): string => {
  if (days === 0) return 'Hoy';
  if (days === 1) return '1 día';
  if (days < 30) return `${days} días`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 mes' : `${months} meses`;
  }
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  let result = years === 1 ? '1 año' : `${years} años`;
  if (remainingMonths > 0) {
    result += ` y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
  }
  return result;
};

/**
 * Get trend direction and color classes
 */
export const getTrendInfo = (value: number) => {
  const isPositive = value >= 0;
  return {
    isPositive,
    textColor: isPositive ? 'text-green-600' : 'text-red-600',
    bgColor: isPositive ? 'bg-green-50' : 'bg-red-50',
    borderColor: isPositive ? 'border-green-200' : 'border-red-200',
    prefix: isPositive ? '+' : ''
  };
};

/**
 * Calculate growth rate between two values
 */
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get status configuration for appointments
 */
export const getAppointmentStatusConfig = (status: string) => {
  const configs = {
    pending: {
      label: 'Pendientes',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    confirmed: {
      label: 'Confirmadas',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    completed: {
      label: 'Completadas',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    cancelled: {
      label: 'Canceladas',
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    no_show: {
      label: 'No Show',
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  };

  return configs[status as keyof typeof configs] || {
    label: status,
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  };
};

/**
 * Generate a color palette for charts
 */
export const getChartColors = (count: number): string[] => {
  const baseColors = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#EC4899', // pink-500
    '#6B7280'  // gray-500
  ];

  return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
};