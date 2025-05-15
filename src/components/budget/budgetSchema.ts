
import { z } from 'zod';

export const budgetFormSchema = z.object({
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  veiculo: z.string().min(1, 'Veículo é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor_total: z.string().refine((val) => !isNaN(Number(val.replace(',', '.'))), {
    message: 'Valor deve ser um número válido'
  }),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
