/**
 * Funções utilitárias de sanitização e validação para formulários.
 */

// Remove espaços extras e caracteres não numéricos de telefone
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '').trim();
}

// Sanitiza email para minúsculo e trim
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Exemplo: Validação simples de e-mail
export function validateEmail(email: string): boolean {
  // Regex simples para e-mail válido
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sanitiza nome tirando espaços extras
export function sanitizeName(name: string): string {
  return name.replace(/\s{2,}/g, ' ').trim();
}

// Sanitiza texto removendo caracteres não permitidos (exemplo simplificado)
export function sanitizeText(text: string): string {
  return text.replace(/[<>]/g, '').trim();
}

import { ProductFormValues } from '@/schemas/productSchema';

// Helper function to map service data to form values
export function mapServiceToFormValues(data: any): ProductFormValues {
  return {
    nome: data.nome || '',
    tipo: data.tipo as 'produto' | 'servico',
    preco_venda: data.valor?.toString() || '',
    preco_custo: data.valor ? (parseFloat(data.valor.toString()) * 0.7).toString() : '',
    quantidade: '0',
    estoque_minimo: '5',
    descricao: data.descricao || '',
    codigo: '',
    fornecedor: '',
    categorias: '',
    controlar_estoque: true,
  };
}

// Default form values for new products
export const defaultProductValues: ProductFormValues = {
  nome: '',
  codigo: '',
  tipo: 'produto',
  preco_custo: '',
  preco_venda: '',
  quantidade: '0',
  estoque_minimo: '5',
  descricao: '',
  fornecedor: '',
  categorias: '',
  controlar_estoque: true,
};
