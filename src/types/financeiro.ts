
export interface ContaReceber {
  id: string;
  user_id: string;
  cliente_id?: string;
  ordem_servico_id?: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'vencido';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    nome: string;
  };
}

export interface ContaPagar {
  id: string;
  user_id: string;
  fornecedor_id?: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'vencido';
  categoria?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  fornecedores?: {
    nome: string;
  };
}

export interface FechamentoCaixa {
  id: string;
  user_id: string;
  data_fechamento: string;
  valor_inicial: number;
  total_entradas: number;
  total_saidas: number;
  saldo_final: number;
  observacoes?: string;
  created_at: string;
}

export interface PagamentoManual {
  id: string;
  user_id: string;
  ordem_servico_id: string;
  valor: number;
  forma_pagamento: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito';
  data_pagamento: string;
  observacoes?: string;
  created_at: string;
}
