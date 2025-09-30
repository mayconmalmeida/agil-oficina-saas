export interface OrcamentoItem {
  id: string;
  orcamento_id: string;
  user_id: string;
  item_id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  created_at?: string;
  updated_at?: string;
}

export interface Orcamento {
  id: string;
  user_id: string;
  cliente: string;
  veiculo: string;
  descricao: string;
  valor_total: number;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface OrcamentoWithItems extends Orcamento {
  itens?: OrcamentoItem[];
}
