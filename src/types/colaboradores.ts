
export interface Colaborador {
  id: string;
  user_id: string;
  oficina_id: string;
  nome: string;
  email: string;
  telefone?: string;
  funcao: 'administrador' | 'recepcionista' | 'mecanico' | 'financeiro' | 'colaborador';
  permissoes: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MovimentacaoEstoque {
  id: string;
  user_id: string;
  produto_id: string;
  tipo_movimentacao: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_atual: number;
  motivo?: string;
  ordem_servico_id?: string;
  nota_fiscal_id?: string;
  created_at: string;
  created_by?: string;
  produto?: {
    nome: string;
    codigo?: string;
  };
}

export interface AlertaEstoque {
  id: string;
  user_id: string;
  produto_id: string;
  tipo_alerta: string;
  visualizado: boolean;
  created_at: string;
  produto?: {
    nome: string;
    codigo?: string;
    quantidade_estoque: number;
    estoque_minimo: number;
  };
}

export interface CotacaoFornecedor {
  id: string;
  user_id: string;
  fornecedor_id: string;
  produtos: Array<{
    nome: string;
    quantidade: number;
    observacao?: string;
  }>;
  status: 'enviado' | 'respondido' | 'finalizado';
  observacoes?: string;
  ordem_servico_id?: string;
  created_at: string;
  updated_at: string;
  fornecedor?: {
    name: string;
    phone?: string;
  };
}
