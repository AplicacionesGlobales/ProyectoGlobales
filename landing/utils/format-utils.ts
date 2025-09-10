/**
 * Utilidades de formato para la aplicación
 */

/**
 * Formatea un precio en colones costarricenses (formato simple)
 */
export const formatPriceSimple = (price: number): string => {
  return `₡${price.toLocaleString('es-CR')}`;
};

/**
 * Formatea un precio con el formato completo de moneda
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Formatea una fecha en formato corto
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CR');
};

/**
 * Formatea una hora en formato 12 horas
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('es-CR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formatea duración en minutos a formato legible
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
};