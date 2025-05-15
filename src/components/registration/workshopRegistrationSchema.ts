
import { z } from 'zod';

export const workshopRegistrationSchema = z.object({
  documentType: z.enum(['CPF', 'CNPJ'], {
    required_error: "Tipo de documento é obrigatório",
  }),
  documentNumber: z.string()
    .min(11, "Número de documento inválido")
    .refine((val) => {
      // Remove non-numeric characters for validation
      const numbers = val.replace(/\D/g, '');
      if (val.includes('CPF')) {
        return numbers.length === 11;
      } else {
        return numbers.length === 14;
      }
    }, "Número de documento inválido"),
  businessName: z.string()
    .min(3, "Razão social ou nome completo deve ter pelo menos 3 caracteres")
    .max(100, "Razão social ou nome completo deve ter no máximo 100 caracteres"),
  tradingName: z.string().optional(),
  stateRegistration: z.string().optional(),
  responsiblePerson: z.string()
    .min(3, "Nome do responsável deve ter pelo menos 3 caracteres"),
  email: z.string()
    .email("E-mail inválido"),
  phone: z.string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(15, "Telefone deve ter no máximo 15 dígitos")
    .refine((val) => {
      // Count only digits
      const digitCount = val.replace(/\D/g, '').length;
      return digitCount >= 10 && digitCount <= 11;
    }, "Telefone deve ter entre 10 e 11 dígitos numéricos"),
  address: z.string()
    .min(5, "Endereço deve ter pelo menos 5 caracteres"),
  city: z.string()
    .min(2, "Cidade deve ter pelo menos 2 caracteres"),
  state: z.string()
    .min(2, "Estado deve ter pelo menos 2 caracteres"),
  zipCode: z.string()
    .min(8, "CEP deve ter pelo menos 8 caracteres")
    .max(9, "CEP deve ter no máximo 9 caracteres"),
  addressComplement: z.string().optional(),
  logo: z.any().optional(), // For file upload
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string()
    .min(6, "Confirme sua senha"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type WorkshopRegistrationFormValues = z.infer<typeof workshopRegistrationSchema>;

// Helper for document number formatting
export const formatDocument = (value: string, type: 'CPF' | 'CNPJ'): string => {
  // Remove non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
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
