
/**
 * Utilities for formatting values
 */
export const formatUtils = {
  /**
   * Format a number as currency (BRL)
   */
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  /**
   * Format a date string to local date format
   */
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  },

  /**
   * Format a date string to include time
   */
  formatDateTime: (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  /**
   * Format a phone number to (XX) XXXXX-XXXX
   */
  formatPhoneNumber: (value: string): string => {
    // Remove non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    const limited = cleaned.substring(0, 11);
    
    // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (limited.length <= 10) {
      return limited.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    } else {
      return limited.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
    }
  }
};

export const formatCurrency = formatUtils.formatCurrency;
export const formatPhoneNumber = formatUtils.formatPhoneNumber;
