
import { supabase } from '@/lib/supabase';

// Define specific parameter types for each RPC function
type RPCParamMap = {
  'create_profile': { user_id: string; user_email: string; user_full_name: string };
  'create_subscription': { user_id: string; plan_type: string; start_date: string; end_date: string };
  'update_onboarding_step': { step: string };
  'create_budget': { p_user_id: string; p_cliente: string; p_veiculo: string; p_descricao: string; p_valor_total: number };
  'create_client': { p_user_id: string; p_nome: string; p_telefone: string; p_email: string; p_veiculo: string };
  'create_service': { p_user_id: string; p_nome: string; p_tipo: string; p_valor: number; p_descricao: string };
  'create_profile_table': {};
  'create_profiles_table': {};
  'create_subscriptions_table': {};
  'ensure_profiles_table': {};
  [key: string]: any; // Add indexer to allow for any string key
};

// Utility type for RPC functions
type RPCFunctionNames = keyof RPCParamMap;

/**
 * Type-safe wrapper for calling Supabase RPC functions
 * @param fn The RPC function name
 * @param params The parameters to pass to the function
 * @returns The result of the RPC call
 */
export const safeRpc = <T = any>(fn: RPCFunctionNames, params: RPCParamMap[typeof fn]) => {
  return supabase.rpc(fn, params) as unknown as Promise<{ data: T; error: any }>;
};

// Types for Profile
export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  created_at?: string;
  nome_oficina?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  plano?: string;
  is_active?: boolean;
  trial_ends_at?: string | null;
  last_login?: string | null;
}

// Types for Subscription
export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  plan?: string;
  created_at: string;
  ends_at?: string;
  started_at?: string;
  payment_method?: string;
  amount: number;
  expires_at?: string;
  trial_ends_at?: string;
}

// Types for Service
export interface Service {
  id: string;
  user_id: string;
  nome: string;
  tipo: string;
  valor: number;
  descricao?: string;
  created_at: string;
}

// Types for Client
export interface Client {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  email?: string;
  veiculo: string;
  created_at: string;
}

// Types for Budget (Orçamento)
export interface Budget {
  id: string;
  user_id: string;
  cliente: string;
  veiculo: string;
  descricao: string;
  valor_total: number;
  status: string;
  created_at: string;
}

// Types for combined objects
export interface SubscriptionWithProfile extends Partial<Subscription> {
  profiles?: {
    email: string;
    nome_oficina: string;
  };
  email?: string;
  nome_oficina?: string;
}

export interface ProfileWithSubscriptions extends Profile {
  subscriptions?: Subscription[];
}

