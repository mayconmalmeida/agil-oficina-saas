
import { supabase } from '@/lib/supabase';
import { AuthUser } from '@/types/auth';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  nome_oficina?: string;
  telefone?: string;
  plano?: string;
  trial_started_at?: string;
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

    // Buscar assinatura do usuário
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
      .maybeSingle();

    if (subscriptionError) {
      console.error('fetchUserProfile: Erro ao buscar subscription:', subscriptionError);
    }

    console.log('fetchUserProfile: Subscription encontrada:', subscription);

    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email || '',
      role: profile.role || 'user',
      is_active: profile.is_active ?? true,
      nome_oficina: profile.nome_oficina,
      telefone: profile.telefone,
      plano: profile.plano,
      trial_started_at: profile.trial_started_at,
      subscription: subscription || undefined
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

export const validatePlanAccess = (subscription: any, role: string): {
  isActive: boolean;
  plan: 'Essencial' | 'Premium' | 'Free';
  permissions: string[];
} => {
  console.log('validatePlanAccess: Validando acesso ao plano:', {
    subscription: !!subscription,
    role,
    subscriptionStatus: subscription?.status,
    planType: subscription?.plan_type
  });

  // Admin sempre tem acesso total
  if (role === 'admin' || role === 'superadmin') {
    return {
      isActive: true,
      plan: 'Premium',
      permissions: ['*'] // Todas as permissões
    };
  }

  // Se não há assinatura, acesso limitado
  if (!subscription) {
    return {
      isActive: false,
      plan: 'Free',
      permissions: ['clientes', 'orcamentos']
    };
  }

  // Verificar se a assinatura está ativa
  const now = new Date();
  let isActive = false;

  if (subscription.status === 'active') {
    // Verificar se não expirou
    if (!subscription.ends_at || new Date(subscription.ends_at) > now) {
      isActive = true;
    }
  } else if (subscription.status === 'trialing') {
    // Verificar se o trial não expirou
    if (subscription.trial_ends_at && new Date(subscription.trial_ends_at) > now) {
      isActive = true;
    }
  }

  // Determinar o plano
  let plan: 'Essencial' | 'Premium' | 'Free' = 'Free';
  if (isActive) {
    if (subscription.plan_type?.includes('premium')) {
      plan = 'Premium';
    } else if (subscription.plan_type?.includes('essencial')) {
      plan = 'Essencial';
    }
  }

  // Definir permissões por plano
  const planPermissions = {
    Free: ['clientes', 'orcamentos'],
    Essencial: [
      'clientes', 'orcamentos', 'produtos', 'servicos', 'veiculos',
      'relatorios_basicos', 'configuracoes', 'suporte_email'
    ],
    Premium: [
      'clientes', 'orcamentos', 'produtos', 'servicos', 'veiculos',
      'relatorios_basicos', 'relatorios_avancados', 'agendamentos',
      'marketing', 'estoque', 'backup', 'diagnostico_ia', 'suporte_prioritario',
      'integracao_contabil', 'configuracoes'
    ]
  };

  const permissions = planPermissions[plan];

  console.log('validatePlanAccess: Resultado da validação:', {
    isActive,
    plan,
    permissions: permissions.length
  });

  return {
    isActive,
    plan,
    permissions
  };
};

export const calculateCanAccessFeatures = (subscription: any, role: string): boolean => {
  const { isActive } = validatePlanAccess(subscription, role);
  return isActive;
};
