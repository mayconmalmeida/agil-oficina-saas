
import { z } from 'zod';
import { validateCPF, validateLicensePlate } from '@/utils/validationUtils';

// Schema with enhanced validations
export const clientFormSchema = z.object({
  nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  tipo: z.enum(['pf', 'pj']).default('pf'),
  documento: z.string()
    .refine(val => 
      val === '' || 
      (val.length >= 11 && validateCPF(val)), 
      {
        message: 'CPF inválido. Formato: 000.000.000-00'
      }
    ).optional().or(z.literal('')),
  telefone: z.string()
    .min(14, 'Telefone deve ter no mínimo 14 caracteres no formato (XX) XXXXX-XXXX')
    .max(15, 'Telefone deve ter no máximo 15 caracteres')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato inválido. Use (XX) XXXXX-XXXX'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cep: z.string()
    .regex(/^\d{5}-\d{3}$/, 'Formato de CEP inválido. Use XXXXX-XXX')
    .optional().or(z.literal('')),
  endereco: z.string().optional().or(z.literal('')),
  numero: z.string().optional().or(z.literal('')),
  bairro: z.string().optional().or(z.literal('')),
  cidade: z.string().optional().or(z.literal('')),
  estado: z.string().optional().or(z.literal('')),
  veiculo: z.object({
    marca: z.string().min(1, 'Marca do veículo é obrigatória'),
    modelo: z.string().min(1, 'Modelo do veículo é obrigatório'),
    ano: z.string().regex(/^\d{4}$/, 'Ano deve ter exatamente 4 dígitos'),
    placa: z.string()
      .refine(val => validateLicensePlate(val), {
        message: 'Formato de placa inválido. Use ABC-1234 ou ABC1D23'
      }),
    cor: z.string().optional().or(z.literal('')),
    kilometragem: z.string().optional().or(z.literal(''))
  })
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
