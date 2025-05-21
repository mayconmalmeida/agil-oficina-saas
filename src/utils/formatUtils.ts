
// Format license plate either ABC-1234 (old style) or ABC1D23 (new style)
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

// Format CPF: 000.000.000-00
export const formatCPF = (cpf: string): string => {
  const digits = cpf.replace(/\D/g, '');
  
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return digits.substring(0, 3) + '.' + digits.substring(3);
  } else if (digits.length <= 9) {
    return digits.substring(0, 3) + '.' + digits.substring(3, 6) + '.' + digits.substring(6);
  } else {
    return digits.substring(0, 3) + '.' + digits.substring(3, 6) + '.' + 
           digits.substring(6, 9) + '-' + digits.substring(9, 11);
  }
};

// Format CEP: 00000-000
export const formatCEP = (cep: string): string => {
  const digits = cep.replace(/\D/g, '');
  
  if (digits.length <= 5) {
    return digits;
  } else {
    return digits.substring(0, 5) + '-' + digits.substring(5, 8);
  }
};

// Format Phone: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : '';
  } else if (digits.length <= 6) {
    return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
  } else if (digits.length <= 10) {
    // Format for 8-digit numbers (landlines): (XX) XXXX-XXXX
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
  } else {
    // Format for 9-digit numbers (mobile): (XX) XXXXX-XXXX
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  }
};

// Alias for formatPhone for legacy compatibility
export const formatPhoneNumber = formatPhone;
