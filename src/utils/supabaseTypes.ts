
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
  whatsapp_suporte?: string;
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

export interface SubscriptionWithProfile {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  started_at: string;
  created_at: string;
  ends_at: string | null;
  expires_at: string | null;
  payment_method: string;
  amount: number;
  email: string;
  nome_oficina: string;
}

// Utility functions
export const safeRpc = async (functionName: string, params: any) => {
  try {
    const { supabase } = await import('@/lib/supabase');
    // Use type assertion to bypass strict typing for RPC calls
    return await (supabase as any).rpc(functionName, params);
  } catch (error) {
    console.error(`Error calling RPC function ${functionName}:`, error);
    return { data: null, error };
  }
};

export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
