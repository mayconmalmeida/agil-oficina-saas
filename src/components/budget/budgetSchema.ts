
import { z } from 'zod';

export const budgetFormSchema = z.object({
  cliente: z.string().optional(),
  veiculo: z.string().optional(),
  descricao: z.string().optional(),
  valor_total: z.string().min(1, 'Valor total é obrigatório'),
  status: z.string().optional().default('Pendente')
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export interface SelectedItem {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}
