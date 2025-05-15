
import { supabase } from '@/lib/supabase';

// Type helper for RPC functions
export type RpcFunction = 
  | "create_profile" 
  | "create_subscription" 
  | "update_onboarding_step"
  | "create_budget"
  | "create_client"
  | "create_service"
  | "create_profile_table"
  | "create_profiles_table"
  | "create_subscriptions_table"
  | "ensure_profiles_table";

// Type-safe wrapper for RPC calls
export const safeRpc = <T>(fn: RpcFunction, params?: Record<string, any>) => {
  // @ts-ignore - We're using this to bypass TypeScript's strict checking
  // since our generated types don't include all the RPC functions
  return supabase.rpc(fn, params) as Promise<{ data: T | null; error: any }>;
};

// Profile type that matches our database schema
export interface Profile {
  id: string;
  created_at?: string;
  email?: string;
  full_name?: string;
  nome_oficina?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  plano?: string;
  is_active?: boolean;
}

// Subscription type that matches our database schema
export interface Subscription {
  id: string;
  user_id: string;
  plan?: string;
  status?: string;
  created_at?: string;
  started_at?: string;
  ends_at?: string;
  payment_method?: string;
  amount?: number;
}

// Budget type that matches our database schema
export interface Budget {
  id: string;
  user_id: string;
  cliente: string;
  veiculo: string;
  descricao: string;
  valor_total: number;
  status?: string;
  created_at?: string;
}

// Client type that matches our database schema
export interface Client {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  email?: string;
  veiculo: string;
  created_at?: string;
}

// Service type that matches our database schema
export interface Service {
  id: string;
  user_id: string;
  nome: string;
  tipo: string;
  valor: number;
  descricao?: string;
  created_at?: string;
}
