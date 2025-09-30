export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const CATEGORY_COLORS = {
  ESSENTIAL: "bg-green-100 text-green-800 border-green-200",
  BUSINESS: "bg-blue-100 text-blue-800 border-blue-200",
  ADVANCED: "bg-purple-100 text-purple-800 border-purple-200"
} as const;

export const CATEGORY_LABELS = {
  ESSENTIAL: "Esencial",
  BUSINESS: "Negocio", 
  ADVANCED: "Avanzado"
} as const;