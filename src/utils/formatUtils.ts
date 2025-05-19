export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPhoneNumber = (phoneNumberString: string): string => {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumberString;
};

/**
 * Formats a document number as CPF or CNPJ
 * @param documentNumber The raw document number
 * @param type 'CPF' or 'CNPJ'
 * @returns Formatted document number
 */
export const formatDocument = (documentNumber: string, type: 'CPF' | 'CNPJ'): string => {
  // Remove non-numeric characters
  const numbers = documentNumber.replace(/\D/g, '');
  
  if (type === 'CPF') {
    // Format as CPF: 123.456.789-01
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  } else {
    // Format as CNPJ: 12.345.678/0001-90
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  }
};

/**
 * Formats a CPF number (Brazilian individual taxpayer registry)
 * @param cpf The raw CPF number
 * @returns Formatted CPF
 */
export const formatCPF = (cpf: string): string => {
  return formatDocument(cpf, 'CPF');
};

/**
 * Formats a Brazilian postal code (CEP)
 * @param cep The raw CEP
 * @returns Formatted CEP (00000-000)
 */
export const formatCEP = (cep: string): string => {
  // Keep only numbers
  const cleanCep = cep.replace(/\D/g, '');
  
  // Apply mask
  if (cleanCep.length <= 5) return cleanCep;
  return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
};

/**
 * Formats a license plate according to its format
 * @param plate License plate to format
 * @returns Formatted license plate
 */
export const formatLicensePlate = (plate: string): string => {
  // Remove spaces and convert to uppercase
  const cleanPlate = plate.replace(/[\s-]/g, '').toUpperCase();
  
  // If it's the old format (or partial), add hyphen
  if (/^[A-Z]{3}\d{0,4}$/.test(cleanPlate) && cleanPlate.length > 3) {
    return `${cleanPlate.slice(0, 3)}-${cleanPlate.slice(3)}`;
  }
  
  return cleanPlate;
};
