
export interface Service {
  id: string;
  user_id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  valor: number;
  descricao?: string;
  codigo?: string;
  quantidade_estoque?: number;
  preco_custo?: number;
  is_active?: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  email?: string;
  documento?: string;
  tipo?: 'pf' | 'pj';
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  veiculo: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  cor?: string;
  kilometragem?: string;
  is_active?: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  cliente: string;
  veiculo: string;
  descricao: string;
  valor_total: number;
  status?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  telefone?: string;
  nome_oficina?: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  logo_url?: string;
  plano?: string;
  trial_started_at?: string;
  trial_ends_at?: string;
  is_active?: boolean;
  role?: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}
