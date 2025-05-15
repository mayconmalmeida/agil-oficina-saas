
import { z } from 'zod';

// Enhanced schema with better validation
export const profileFormSchema = z.object({
  nome_oficina: z.string()
    .min(3, 'Nome da oficina deve ter pelo menos 3 caracteres')
    .max(50, 'Nome da oficina deve ter no máximo 50 caracteres'),
  telefone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos')
    .regex(/^[0-9() -]+$/, 'Telefone deve conter apenas números, parênteses, espaços e hífens')
    .refine((val) => {
      // Count only digits
      const digitCount = val.replace(/\D/g, '').length;
      return digitCount >= 10 && digitCount <= 11;
    }, 'Telefone deve ter entre 10 e 11 dígitos numéricos'),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
