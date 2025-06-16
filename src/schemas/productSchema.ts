
import { z } from 'zod';

// Define the product schema
export const productSchema = z.object({
  nome: z.string().min(1, 'Nome do produto é obrigatório'),
  codigo: z.string().optional(),
  tipo: z.enum(['produto', 'servico']),
  preco_custo: z.string().min(1, 'Preço de custo é obrigatório')
    .refine((val) => /^\d+([,.]\d{1,2})?$/.test(val), {
      message: 'Formato inválido. Use apenas números com até 2 casas decimais'
    }),
  preco_venda: z.string().min(1, 'Preço de venda é obrigatório')
    .refine((val) => /^\d+([,.]\d{1,2})?$/.test(val), {
      message: 'Formato inválido. Use apenas números com até 2 casas decimais'
    }),
  quantidade: z.string()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: 'Apenas números inteiros são permitidos'
    }),
  estoque_minimo: z.string().optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: 'Apenas números inteiros são permitidos'
    }),
  descricao: z.string().optional(),
  fornecedor: z.string().optional(),
  categorias: z.string().optional(),
  controlar_estoque: z.boolean().default(true),
});

// Define the type for form values
export type ProductFormValues = z.infer<typeof productSchema>;
