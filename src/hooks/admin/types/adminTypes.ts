
export interface AdminUser {
  id: string;
  email: string;
  nome_oficina: string | null;
  telefone: string | null;
  cnpj: string | null;
  responsavel: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  trial_ends_at: string | null;
  subscription?: {
    id: string;
    plan_type: string;
    status: string;
    starts_at: string;
    ends_at: string | null;
    trial_ends_at: string | null;
  } | null;
}

export interface AdminSubscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  starts_at: string;
  ends_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  user_email: string;
  nome_oficina: string;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  trialingUsers: number;
  totalRevenue: number;
  newUsersThisMonth: number;
}
