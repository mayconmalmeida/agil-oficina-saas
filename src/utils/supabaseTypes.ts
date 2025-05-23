
// Define all Supabase types and interfaces here
import { supabase } from '@/lib/supabase';

export interface SubscriptionWithProfile {
  id: string;
  nome_oficina?: string;
  email?: string;
  amount?: number;
  created_at?: string;
  expires_at?: string;
  payment_method?: string;
  status?: string;
}

export interface Service {
  id: string;
  nome: string;
  descricao?: string;
  valor: number;
  tipo: "produto" | "servico"; // Using a union type to restrict tipo values
  is_active: boolean;
  created_at: string;
  user_id: string;
}

export interface Client {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  veiculo: string;
  placa?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  cor?: string;
  is_active: boolean;
  created_at: string;
  user_id: string;
  // Add missing properties that are being used in the codebase
  tipo?: 'pf' | 'pj';
  documento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  bairro?: string;
  numero?: string;
  kilometragem?: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  nome_oficina?: string;
  responsavel?: string;
  telefone?: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  logo_url?: string;
  is_active?: boolean;
  plano?: string;
  trial_ends_at?: string;
  created_at?: string;
  whatsapp_suporte?: string;
}

export interface Vehicle {
  marca?: string;
  modelo?: string;
  ano?: string;
  placa: string;
  cor?: string;
  kilometragem?: string;
}

// Define available RPC function names from Supabase
type RpcFunctionNames = 
  | 'check_admin_permission'
  | 'create_agendamento'
  | 'create_agendamentos_table'
  | 'create_budget'
  | 'create_client'
  | 'create_profile'
  | 'create_profile_table'
  | 'create_profiles_table'
  | 'create_service'
  | 'create_subscription'
  | 'create_subscriptions_table'
  | 'ensure_profiles_table'
  | 'ensure_whatsapp_suporte_column'
  | 'update_onboarding_step';

// Add the safeRpc utility function with proper typing
export const safeRpc = async (functionName: RpcFunctionNames, params: Record<string, any> = {}) => {
  try {
    const { data, error } = await supabase.rpc(functionName, params);
    return { data, error };
  } catch (err) {
    console.error(`Error calling RPC function ${functionName}:`, err);
    return { data: null, error: err as Error };
  }
};

// Utility function to map database response to Service type
export const mapToServiceType = (data: any[]): Service[] => {
  return data.map(item => ({
    id: item.id,
    nome: item.nome,
    tipo: (item.tipo === 'servico' ? 'servico' : 'produto') as "produto" | "servico",
    valor: item.valor,
    descricao: item.descricao || "",
    is_active: item.is_active !== undefined ? item.is_active : true,
    created_at: item.created_at,
    user_id: item.user_id || ""
  }));
};

// Add any other needed types here
