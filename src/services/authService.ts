
import { supabase } from '@/lib/supabase';
import { AuthUser } from '@/types/auth';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  nome_oficina?: string;
  is_active: boolean;
  subscription?: {
    id: string;
    plan_type: string;
    status: string;
    starts_at: string;
    ends_at?: string;
    trial_ends_at?: string;
  } | null;
}

export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    console.log('Buscando perfil do usuário:', userId);
    
    // Buscar perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil:', profileError);
      throw profileError;
    }

    if (!profileData) {
      console.log('Perfil não encontrado, usando dados padrão');
      return {
        id: userId,
        email: 'email@unknown.com',
        role: 'user',
        is_active: true,
        subscription: null
      };
    }

    console.log('Role do usuário encontrada:', profileData.role);

    // Se é admin, não precisa verificar assinatura
    if (profileData.role === 'admin' || profileData.role === 'superadmin') {
      console.log('Usuário identificado como admin, pulando verificação de assinatura');
      return {
        id: profileData.id,
        email: profileData.email || 'admin@system.com',
        role: profileData.role,
        nome_oficina: profileData.nome_oficina,
        is_active: profileData.is_active ?? true,
        subscription: null
      };
    }

    // Para usuários normais, buscar assinatura
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.warn('Erro ao buscar assinatura:', subscriptionError);
    }

    return {
      id: profileData.id,
      email: profileData.email || 'user@system.com',
      role: profileData.role || 'user',
      nome_oficina: profileData.nome_oficina,
      is_active: profileData.is_active ?? true,
      subscription: subscriptionData || null
    };

  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    
    // Retornar dados padrão em caso de erro
    return {
      id: userId,
      email: 'error@system.com',
      role: 'user',
      is_active: true,
      subscription: null
    };
  }
};

export const calculateCanAccessFeatures = (subscription: any): boolean => {
  if (!subscription) return false;
  
  const now = new Date();
  
  // Verificar se a assinatura está ativa
  if (subscription.status === 'active') {
    // Se tem data de término, verificar se ainda não expirou
    if (subscription.ends_at) {
      return new Date(subscription.ends_at) > now;
    }
    return true;
  }
  
  // Verificar se está em período de teste
  if (subscription.status === 'trialing') {
    if (subscription.trial_ends_at) {
      return new Date(subscription.trial_ends_at) > now;
    }
    return true;
  }
  
  return false;
};
