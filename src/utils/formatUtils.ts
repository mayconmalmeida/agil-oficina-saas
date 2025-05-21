
export const formatLicensePlate = (plate: string): string => {
  // Remove any non-alphanumeric characters
  const clean = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Format old style: ABC1234
  if (clean.length === 7 && /^[A-Z]{3}\d{4}$/.test(clean)) {
    return clean.substring(0, 3) + '-' + clean.substring(3, 7);
  }
  
  // Format new style: ABC1D23
  if (clean.length === 7 && /^[A-Z]{3}\d[A-Z]\d{2}$/.test(clean)) {
    return clean;
  }
  
  // Return cleaned input if it doesn't match expected formats
  return clean;
};

// Format currency to BRL
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
};

// Format date to Brazilian format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};
