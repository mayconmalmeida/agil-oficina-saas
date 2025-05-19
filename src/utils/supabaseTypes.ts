
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

export const safeRpc = async <T = any>(
  procedureName: string, 
  params: Record<string, any>
): Promise<{ data: T | null; error: any }> => {
  try {
    const { data, error } = await supabase.rpc(procedureName, params);
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}
