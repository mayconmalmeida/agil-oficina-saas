
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
    preco_venda: data.valor ? data.valor.toString().replace('.', ',') : '0,00',
    preco_custo: data.preco_custo ? data.preco_custo.toString().replace('.', ',') : '0,00',
    quantidade: data.quantidade_estoque?.toString() || '0',
    estoque_minimo: '5',
    descricao: data.descricao || '',
    codigo: data.codigo || '',
    fornecedor: data.fornecedor || '',
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
