
import { ProductFormValues } from '@/schemas/productSchema';

// Helper function to map service data to form values
export function mapServiceToFormValues(data: any): ProductFormValues {
  return {
    nome: data.nome || '',
    tipo: data.tipo as 'produto' | 'servico',
    preco_venda: data.valor?.toString() || '',
    preco_custo: data.valor ? (parseFloat(data.valor.toString()) * 0.7).toString() : '',
    quantidade: '0',
    estoque_minimo: '5',
    descricao: data.descricao || '',
    codigo: '',
    fornecedor: '',
    controlar_estoque: true,
  };
}

// Default form values for new products
export const defaultProductValues: ProductFormValues = {
  nome: '',
  codigo: '',
  tipo: 'produto',
  preco_custo: '',
  preco_venda: '',
  quantidade: '0',
  estoque_minimo: '5',
  descricao: '',
  fornecedor: '',
  controlar_estoque: true,
};
