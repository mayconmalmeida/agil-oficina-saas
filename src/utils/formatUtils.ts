
/**
 * Utility functions for formatting data
 */

/**
 * Format a currency value to Brazilian Real (BRL)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Format a date to Brazilian format (DD/MM/YYYY)
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
};

/**
 * Format a date with time (DD/MM/YYYY HH:MM)
 */
export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

export const formatUtils = {
  formatCurrency,
  formatDate,
  formatDateTime
};
