
import { z } from 'zod';

export const companyFormSchema = z.object({
  nome_oficina: z.string().min(1, 'Nome da oficina é obrigatório'),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  cnpj: z.string().optional(),
  inscricao_estadual: z.string().optional(),
  observacoes_orcamento: z.string().optional(),
  website: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
