/**
 * Validation utilities for forms
 */

/**
 * Validates a Brazilian CPF number
 * @param cpf CPF to validate (with or without formatting)
 * @returns true if valid, false otherwise
 */
export function validateCPF(cpf: string): boolean {
  // Remove non-numeric characters
  const cleanCpf = cpf.replace(/\D/g, '');
  
  // Check if has 11 digits
  if (cleanCpf.length !== 11) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  // Validate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
  
  // Validate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCpf.charAt(10));
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
 * Validates a Brazilian license plate in both old (ABC-1234) and new (ABC1D23) formats
 * @param plate License plate to validate
 * @returns true if valid, false otherwise
 */
export function validateLicensePlate(plate: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanPlate = plate.replace(/\s/g, '').toUpperCase();
  
  // Old format: ABC-1234
  const oldFormat = /^[A-Z]{3}-?\d{4}$/;
  
  // New format: ABC1D23
  const newFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  return oldFormat.test(cleanPlate) || newFormat.test(cleanPlate);
}

/**
 * Formats a license plate according to its format
 * @param plate License plate to format
 * @returns Formatted license plate
 */
export function formatLicensePlate(plate: string): string {
  // Remove spaces and convert to uppercase
  const cleanPlate = plate.replace(/[\s-]/g, '').toUpperCase();
  
  // If it's the old format (or partial), add hyphen
  if (/^[A-Z]{3}\d{0,4}$/.test(cleanPlate) && cleanPlate.length > 3) {
    return `${cleanPlate.slice(0, 3)}-${cleanPlate.slice(3)}`;
  }
  
  return cleanPlate;
}

/**
 * Structure for address data returned from ViaCEP API
 */
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Fetches address information from ViaCEP API
 * @param cep CEP to look up
 * @returns Address information or null if not found
 */
export async function fetchAddressByCEP(cep: string): Promise<ViaCEPResponse | null> {
  // Remove non-numeric characters
  const cleanCep = cep.replace(/\D/g, '');
  
  if (cleanCep.length !== 8) return null;
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    
    if (data.erro) return null;
    
    return data;
  } catch (error) {
    console.error('Error fetching address:', error);
    return null;
  }
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
