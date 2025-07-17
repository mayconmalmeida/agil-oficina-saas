
import { supabase } from '@/lib/supabase';
import { AuthUser } from '@/types/auth';
import { validatePlanAccess, PlanType } from './planValidation';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  nome_oficina?: string;
  telefone?: string;
  plano?: string;
  trial_started_at?: string;
  trial_ends_at?: string;
  subscription?: {
    id: string;
    user_id: string;
    plan_type: string;
    status: string;
    starts_at: string;
    ends_at?: string;
    trial_ends_at?: string;
    is_manual?: boolean;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    created_at?: string;
    updated_at?: string;
  };
  oficina_id?: string;
}

export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  console.log('fetchUserProfile: Buscando perfil para usuário:', userId);
  
  try {
    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('fetchUserProfile: Erro ao buscar profile:', profileError);
      throw profileError;
    }

    if (!profile) {
      throw new Error('Perfil não encontrado');
    }

    console.log('fetchUserProfile: Profile encontrado:', profile);

    // ✅ Buscar oficina vinculada ao usuário
    const { data: oficina, error: oficinaError } = await supabase
      .from('oficinas')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (oficinaError) {
      console.error('fetchUserProfile: Erro ao buscar oficina:', oficinaError);
    }

    let subscriptionData = null;
    
    if (oficina) {
      console.log('fetchUserProfile: Oficina encontrada:', oficina.id);
      
      // ✅ Buscar assinatura mais recente da oficina
      const { data: subscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          plan_type,
          status,
          starts_at,
          ends_at,
          trial_ends_at,
          is_manual,
          stripe_customer_id,
          stripe_subscription_id,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        console.error('fetchUserProfile: Erro ao buscar subscription:', subscriptionError);
      } else {
        subscriptionData = subscription;
        console.log('fetchUserProfile: Subscription encontrada:', subscriptionData);
      }
    }

    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email || '',
      role: profile.role || 'user',
      is_active: profile.is_active ?? true,
      nome_oficina: profile.nome_oficina,
      telefone: profile.telefone,
      plano: profile.plano,
      trial_started_at: profile.trial_started_at,
      trial_ends_at: profile.trial_ends_at,
      subscription: subscriptionData || undefined,
      oficina_id: oficina?.id
    };

    console.log('fetchUserProfile: Perfil completo retornado:', userProfile);
    return userProfile;
    
  } catch (error) {
    console.error('fetchUserProfile: Erro geral:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  console.log('signOutUser: Iniciando logout');
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('signOutUser: Erro no logout:', error);
      throw error;
    }
    console.log('signOutUser: Logout realizado com sucesso');
  } catch (error) {
    console.error('signOutUser: Erro geral:', error);
    throw error;
  }
};

// ✅ Nova função usando validatePlanAccess centralizada
export const validatePlanAccessFromProfile = (subscription: any, role: string): {
  isActive: boolean;
  plan: PlanType;
  permissions: string[];
} => {
  console.log('validatePlanAccessFromProfile: Validando acesso ao plano:', {
    subscription: !!subscription,
    role,
    subscriptionStatus: subscription?.status,
    planType: subscription?.plan_type
  });

  // Admin sempre tem acesso total
  if (role === 'admin' || role === 'superadmin') {
    console.log('validatePlanAccessFromProfile: Admin detectado, retornando acesso total');
    return {
      isActive: true,
      plan: 'Premium',
      permissions: ['*'] // Todas as permissões
    };
  }

  // Usar a função centralizada
  return validatePlanAccess(subscription);
};

export const calculateCanAccessFeatures = (subscription: any, role: string): boolean => {
  const { isActive } = validatePlanAccessFromProfile(subscription, role);
  console.log('calculateCanAccessFeatures: Calculando acesso:', {
    subscription: !!subscription,
    role,
    subscriptionStatus: subscription?.status,
    result: isActive
  });
  return isActive;
};
