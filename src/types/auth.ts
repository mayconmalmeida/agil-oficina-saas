
import { User, Session } from '@supabase/supabase-js';
import { UserSubscription } from './subscription';

export interface AuthUser {
  id: string;
  email: string;
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
  expired?: boolean; // ✅ Nova propriedade
  permissions?: string[];
  oficina_id?: string | null;
  app_metadata?: any;
  user_metadata?: any;
  aud?: string;
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
  canAccessFeatures: boolean;
  permissionsCount: number;
  oficinaId: string | null;
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
