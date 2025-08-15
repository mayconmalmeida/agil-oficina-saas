
import { z } from 'zod';

export const budgetSchema = z.object({
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  veiculo: z.string().min(1, 'Veículo é obrigatório'),
  descricao: z.string().min(1, 'Descrição do serviço é obrigatória'),
  data_validade: z.string().optional(),
  valor_total: z.number().min(0, 'Valor total deve ser maior que zero'),
  observacoes: z.string().optional(),
  status: z.string().optional(),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;

export interface SelectedItem {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}
