
/**
 * Funções utilitárias de sanitização e validação para formulários.
 * SEGURANÇA: Adicionadas funções de sanitização para prevenir ataques de injeção
 */

// Remove espaços extras e caracteres não numéricos de telefone
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '').trim();
}

// Sanitiza email para minúsculo e trim
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Validação segura de e-mail
export function validateEmail(email: string): boolean {
  // Regex mais rigorosa para e-mail válido
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

// Sanitiza nome tirando espaços extras e caracteres perigosos
export function sanitizeName(name: string): string {
  return name
    .replace(/[<>]/g, '') // Remove caracteres HTML perigosos
    .replace(/\s{2,}/g, ' ') // Remove espaços múltiplos
    .trim()
    .substring(0, 255); // Limita tamanho
}

// Sanitiza texto removendo caracteres não permitidos e potencialmente perigosos
export function sanitizeText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove todas as tags HTML
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 10000); // Limita tamanho para prevenir DoS
}

// NOVA: Sanitização para dados de XML (crítico para segurança)
export function sanitizeXmlData(data: string): string {
  if (!data || typeof data !== 'string') {
    return '';
  }
  
  return data
    .replace(/&lt;script.*?&lt;\/script&gt;/gi, '') // Remove scripts em XML
    .replace(/&lt;[^&gt;]*&gt;/g, '') // Remove tags HTML em XML
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data: URLs
    .trim()
    .substring(0, 5000); // Limita tamanho
}

// NOVA: Validação de tamanho de arquivo
export function validateFileSize(file: File, maxSizeInMB: number = 10): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

// NOVA: Validação de tipo de arquivo
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

// NOVA: Sanitização de números (previne injeção através de campos numéricos)
export function sanitizeNumber(value: string): number {
  const sanitized = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? 0 : parsed;
}

// NOVA: Validação de força de senha
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }
  
  return {
    isStrong: errors.length === 0,
    errors
  };
}

import { ProductFormValues } from '@/schemas/productSchema';

// Helper function to map service data to form values - SEGURANÇA: Sanitização adicionada
export function mapServiceToFormValues(data: any): ProductFormValues {
  return {
    nome: sanitizeName(data.nome || ''),
    tipo: data.tipo as 'produto' | 'servico',
    preco_venda: sanitizeNumber(data.valor ? data.valor.toString().replace('.', ',') : '0,00').toString().replace('.', ','),
    preco_custo: sanitizeNumber(data.preco_custo ? data.preco_custo.toString().replace('.', ',') : '0,00').toString().replace('.', ','),
    quantidade: sanitizeNumber(data.quantidade_estoque?.toString() || '0').toString(),
    estoque_minimo: '5',
    descricao: sanitizeText(data.descricao || ''),
    codigo: sanitizeText(data.codigo || ''),
    fornecedor: sanitizeName(data.fornecedor || ''),
    categorias: '',
    controlar_estoque: data.tipo === 'produto',
  };
}

// Default form values for new products
export const defaultProductValues: ProductFormValues = {
  nome: '',
  codigo: '',
  tipo: 'produto',
  preco_custo: '0,00',
  preco_venda: '0,00',
  quantidade: '0',
  estoque_minimo: '5',
  descricao: '',
  fornecedor: '',
  categorias: '',
  controlar_estoque: true,
};
