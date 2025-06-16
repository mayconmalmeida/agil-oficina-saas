
// Utility functions for formatting data

export const formatLicensePlate = (plate: string): string => {
  if (!plate) return '';
  
  // Remove all non-alphanumeric characters and convert to uppercase
  const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Check if it's the old format (3 letters + 4 numbers)
  if (/^[A-Z]{3}\d{4}$/.test(cleanPlate)) {
    return `${cleanPlate.slice(0, 3)}-${cleanPlate.slice(3)}`;
  }
  
  // Check if it's the new format (3 letters + 1 number + 1 letter + 2 numbers)
  if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(cleanPlate)) {
    return cleanPlate; // New format doesn't use hyphen
  }
  
  // If it doesn't match either format completely, return as typed but uppercase
  return cleanPlate;
};

export const validateLicensePlate = (plate: string): boolean => {
  if (!plate) return false;
  
  const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Old format: ABC1234 (3 letters + 4 numbers)
  const oldFormat = /^[A-Z]{3}\d{4}$/;
  
  // New format: ABC1D23 (3 letters + 1 number + 1 letter + 2 numbers)
  const newFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  return oldFormat.test(cleanPlate) || newFormat.test(cleanPlate);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Apply phone mask: (00) 00000-0000 or (00) 0000-0000
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return cleanPhone;
};

export const formatCPF = (cpf: string): string => {
  if (!cpf) return '';
  
  // Remove all non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Apply CPF mask: 000.000.000-00
  if (cleanCPF.length <= 11) {
    return cleanCPF
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  
  return cleanCPF.slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatCEP = (cep: string): string => {
  if (!cep) return '';
  
  // Remove all non-numeric characters
  const cleanCEP = cep.replace(/\D/g, '');
  
  // Apply CEP mask: 00000-000
  if (cleanCEP.length <= 8) {
    return cleanCEP.replace(/(\d{5})(\d)/, '$1-$2');
  }
  
  return cleanCEP.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
};

export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Apply phone mask: (00) 00000-0000 or (00) 0000-0000
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return cleanPhone;
};
