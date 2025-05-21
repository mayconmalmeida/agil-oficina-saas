
export interface Vehicle {
  id: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  cor?: string;
  kilometragem?: string;
}

export interface Client {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  veiculo?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  is_active?: boolean;
  cor?: string;
  kilometragem?: string;
  tipo?: 'pf' | 'pj';
  documento?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  created_at?: string;
  user_id?: string;
}

export interface Service {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  valor: number;
  descricao?: string;
  is_active?: boolean;
  created_at?: string;
  user_id?: string;
}

export interface Profile {
  id: string;
  created_at?: string;
  full_name?: string;
  email?: string;
  trial_ends_at?: string;
  nome_oficina?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  plano?: string;
  is_active?: boolean;
  logo_url?: string;
  cnpj?: string;
  responsavel?: string;
  whatsapp_suporte?: string;
}

export interface SubscriptionWithProfile extends Profile {
  subscription?: {
    id: string;
    status: string;
    plan: string;
    started_at?: string;
    ends_at?: string;
  };
}

// Format helpers moved to formatUtils.ts
export { formatPhone } from '@/utils/formatUtils';

export async function safeRpc(functionName: string, params: any) {
  try {
    const { data, error } = await window.supabase.rpc(functionName, params);
    return { data, error };
  } catch (error: any) {
    console.error(`Error calling RPC function ${functionName}:`, error);
    return { data: null, error };
  }
}
