
import { z } from 'zod';

export const companyFormSchema = z.object({
  nome_oficina: z.string().min(1, 'Nome da oficina é obrigatório'),
  telefone: z.string().min(8, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().nullable(),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  cep: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido'),
  cnpj: z.string().optional().nullable(),
  inscricao_estadual: z.string().optional().nullable(),
  observacoes_orcamento: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
