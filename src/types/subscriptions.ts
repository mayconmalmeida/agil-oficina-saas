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

export interface Oficina {
  id: string;
  nome_oficina: string;
  user_id: string;
}
