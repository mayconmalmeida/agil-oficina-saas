
/**
 * Format utilities for forms and data display
 */

/**
 * Formats a Brazilian phone number with proper mask
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export function formatPhone(phone: string): string {
  // Keep only numbers
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Apply mask based on length
  if (cleanPhone.length <= 2) return `(${cleanPhone}`;
  if (cleanPhone.length <= 6) return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2)}`;
  if (cleanPhone.length <= 10) return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7, 11)}`;
}

/**
 * Formats a Brazilian phone number with proper mask (alias for formatPhone)
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  return formatPhone(phone);
}

/**
 * Formats a Brazilian CPF number with proper mask
 * @param cpf CPF to format
 * @returns Formatted CPF (000.000.000-00)
 */
export function formatCPF(cpf: string): string {
  // Keep only numbers
  const cleanCpf = cpf.replace(/\D/g, '');
  
  // Apply mask
  if (cleanCpf.length <= 3) return cleanCpf;
  if (cleanCpf.length <= 6) return `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3)}`;
  if (cleanCpf.length <= 9) return `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6)}`;
  return `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6, 9)}-${cleanCpf.slice(9, 11)}`;
}

/**
 * Formats a CEP with proper mask
 * @param cep CEP to format
 * @returns Formatted CEP (00000-000)
 */
export function formatCEP(cep: string): string {
  // Keep only numbers
  const cleanCep = cep.replace(/\D/g, '');
  
  // Apply mask
  if (cleanCep.length <= 5) return cleanCep;
  return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
}

/**
 * Formats a currency value to Brazilian Real format
 * @param value Number or string value to format
 * @returns Formatted currency string (R$ 0,00)
 */
export function formatCurrency(value: number | string): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

/**
 * Formats a license plate according to Brazilian standards
 * Supports both old format (ABC-1234) and new format (ABC1D23)
 * @param plate License plate to format
 * @returns Formatted license plate
 */
export function formatLicensePlate(plate: string): string {
  // Remove spaces and hyphens, convert to uppercase
  const cleanPlate = plate.replace(/[\s-]/g, '').toUpperCase();
  
  // If it's empty or less than 3 characters, return as is
  if (cleanPlate.length <= 3) return cleanPlate;
  
  // Limit to 7 characters maximum
  const limitedPlate = cleanPlate.slice(0, 7);
  
  // Check if it matches old format pattern (3 letters followed by 4 numbers)
  if (/^[A-Z]{3}\d{4}$/.test(limitedPlate)) {
    // Old format: add hyphen after 3 letters (ABC-1234)
    return `${limitedPlate.slice(0, 3)}-${limitedPlate.slice(3)}`;
  }
  
  // Check if it matches new format pattern (3 letters + 1 number + 1 letter + 2 numbers)
  if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(limitedPlate)) {
    // New format: no hyphen needed (ABC1D23)
    return limitedPlate;
  }
  
  // For incomplete plates, return without formatting until complete
  return limitedPlate;
}

/**
 * Validates a Brazilian license plate in both old (ABC-1234) and new (ABC1D23) formats
 * @param plate License plate to validate
 * @returns true if valid, false otherwise
 */
export function validateLicensePlate(plate: string): boolean {
  // Remove spaces and hyphens, convert to uppercase
  const cleanPlate = plate.replace(/[\s-]/g, '').toUpperCase();
  
  // Old format: ABC1234 (7 characters: 3 letters + 4 numbers)
  const oldFormat = /^[A-Z]{3}\d{4}$/;
  
  // New format: ABC1D23 (7 characters: 3 letters + 1 number + 1 letter + 2 numbers)
  const newFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  return oldFormat.test(cleanPlate) || newFormat.test(cleanPlate);
}
