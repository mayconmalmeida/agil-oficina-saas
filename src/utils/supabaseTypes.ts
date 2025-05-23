// Define all Supabase types and interfaces here

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
}

// Add any other needed types here
