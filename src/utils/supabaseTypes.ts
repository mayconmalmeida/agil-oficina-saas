
import { supabase } from '@/lib/supabase';

export interface Client {
  id: string;
  created_at: string;
  nome: string;
  telefone: string;
  email: string;
  veiculo: string;
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  user_id: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  documento?: string;
  tipo: 'pf' | 'pj';
  cor?: string;
  kilometragem?: string;
  bairro?: string;
  numero?: string;
}

export interface Vehicle {
  id: string;
  created_at: string;
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  cor?: string;
  kilometragem?: string;
  cliente_id: string;
  user_id: string;
}

export interface Service {
  id: string;
  nome: string;
  tipo: string;
  valor: number;
  descricao?: string;
  user_id: string;
  created_at: string;
  codigo?: string;
}

export interface Profile {
  id: string;
  created_at?: string;
  full_name?: string;
  email?: string;
  nome_oficina?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  plano?: string;
  cnpj?: string;
  responsavel?: string;
  logo_url?: string;
  is_active?: boolean;
  trial_ends_at?: string;
  whatsapp_suporte?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  started_at: string;
  ends_at?: string;
  expires_at?: string;
  amount?: number;
  payment_method?: string;
  created_at: string;
}

export interface SubscriptionWithProfile extends Subscription {
  nome_oficina: string;
  email: string;
}

export const safeRpc = async <T = any>(
  procedureName: string, 
  params: Record<string, any>
): Promise<{ data: T | null; error: any }> => {
  try {
    // @ts-ignore - Using a string parameter for procedureName
    const { data, error } = await supabase.rpc(procedureName, params);
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Add utility functions that were referenced in other files
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPhone = (value: string): string => {
  if (!value) return '';
  
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  } else {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
};

export const formatPhoneNumber = formatPhone;
