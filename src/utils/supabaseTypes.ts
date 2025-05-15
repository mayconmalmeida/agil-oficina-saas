
import { supabase } from '@/lib/supabase';

// Utility type for RPC functions
type RPCFunctionNames = 
  | 'create_profile' 
  | 'create_subscription' 
  | 'update_onboarding_step'
  | 'create_budget'
  | 'create_client'
  | 'create_service'
  | 'create_profile_table'
  | 'create_profiles_table'
  | 'create_subscriptions_table'
  | 'ensure_profiles_table';

/**
 * Type-safe wrapper for calling Supabase RPC functions
 * @param fn The RPC function name
 * @param params The parameters to pass to the function
 * @returns The result of the RPC call
 */
export const safeRpc = <T = any>(fn: RPCFunctionNames, params?: Record<string, any>) => {
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
