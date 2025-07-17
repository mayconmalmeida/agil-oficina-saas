
import { User, Session } from '@supabase/supabase-js';
import { UserSubscription } from './subscription';

export interface AuthUser extends User {
  role?: string;
  isAdmin?: boolean;
  canAccessFeatures?: boolean;
  subscription?: UserSubscription;
  trial_ends_at?: string;
  plano?: string;
  trial_started_at?: string;
  nome_oficina?: string;
  telefone?: string;
  is_active?: boolean;
  plan?: 'Essencial' | 'Premium' | 'Free';
  planActive?: boolean;
  permissions?: string[];
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isLoadingAuth: boolean;
  role: string | null;
  isAdmin: boolean;
  plan: 'Essencial' | 'Premium' | 'Free' | null;
  planActive: boolean;
  permissions: string[];
  signOut: () => Promise<void>;
}

export interface AuthContextValue extends AuthState {}

export interface UserProfileData {
  role: string;
  subscription: UserSubscription | null;
  plan?: 'Essencial' | 'Premium' | 'Free';
  planActive?: boolean;
  permissions?: string[];
}
