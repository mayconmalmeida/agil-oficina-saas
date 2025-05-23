
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

// Add the safeRpc utility function that was missing
export const safeRpc = async (functionName: string, params: Record<string, any> = {}) => {
  try {
    const { data, error } = await supabase.rpc(functionName, params);
    return { data, error };
  } catch (err) {
    console.error(`Error calling RPC function ${functionName}:`, err);
    return { data: null, error: err as Error };
  }
};

// Add any other needed types here
