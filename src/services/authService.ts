
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

    // Buscar assinatura ativa do usuário
    const { data: subscriptionData, error: subscriptionError } = await supabase
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
    }

    console.log('fetchUserProfile: Subscription encontrada:', subscriptionData);

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
      subscription: subscriptionData || undefined
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

// ✅ Nova lógica de validação conforme solicitado
export const validatePlanAccess = (subscription: any, role: string): {
  isActive: boolean;
  plan: 'Essencial' | 'Premium' | 'Free';
  permissions: string[];
} => {
  console.log('validatePlanAccess: Validando acesso ao plano:', {
    subscription: !!subscription,
    role,
    subscriptionStatus: subscription?.status,
    planType: subscription?.plan_type,
    isManual: subscription?.is_manual,
    endsAt: subscription?.ends_at,
    trialEndsAt: subscription?.trial_ends_at
  });

  // Admin sempre tem acesso total
  if (role === 'admin' || role === 'superadmin') {
    console.log('validatePlanAccess: Admin detectado, retornando acesso total');
    return {
      isActive: true,
      plan: 'Premium',
      permissions: ['*'] // Todas as permissões
    };
  }

  const now = new Date();
  let isActive = false;
  let currentPlan: 'Free' | 'Essencial' | 'Premium' = 'Free';

  // Caso não exista assinatura → Free bloqueado
  if (!subscription) {
    console.log('validatePlanAccess: Sem assinatura, retornando Free bloqueado');
    return { 
      isActive: false, 
      plan: 'Free', 
      permissions: [] 
    };
  }

  // **1) Validar Status**
  const { status, ends_at, trial_ends_at, plan_type } = subscription;

  console.log('validatePlanAccess: Verificando status da assinatura:', {
    status,
    ends_at,
    trial_ends_at,
    plan_type,
    now: now.toISOString()
  });

  // ✅ CORREÇÃO: Trial sempre Premium e ativo se dentro do período
  if (status === 'trialing') {
    if (trial_ends_at && new Date(trial_ends_at) > now) {
      isActive = true;
      currentPlan = 'Premium'; // Trial sempre Premium
      console.log('validatePlanAccess: Trial ativo detectado, definindo Premium');
    } else {
      console.log('validatePlanAccess: Trial expirado');
    }
  } 
  // ✅ CORREÇÃO: Assinatura ativa - verificar plano corretamente
  else if (status === 'active') {
    if (!ends_at || new Date(ends_at) > now) {
      isActive = true;
      
      // Verificar tipo de plano com case insensitive
      const planTypeLower = plan_type?.toLowerCase() || '';
      if (planTypeLower.includes('premium')) {
        currentPlan = 'Premium';
        console.log('validatePlanAccess: Plano Premium ativo detectado');
      } else if (planTypeLower.includes('essencial')) {
        currentPlan = 'Essencial';
        console.log('validatePlanAccess: Plano Essencial ativo detectado');
      } else {
        // Fallback para assinaturas ativas sem tipo específico
        currentPlan = 'Premium';
        console.log('validatePlanAccess: Assinatura ativa sem tipo, assumindo Premium');
      }
    } else {
      console.log('validatePlanAccess: Assinatura expirada');
    }
  }

  // **2) Permissões por Plano**
  const permissionsMap = {
    Free: [], // Bloqueado após trial
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

  const permissions = isActive ? permissionsMap[currentPlan] : [];

  console.log('validatePlanAccess: Resultado da validação:', {
    isActive,
    plan: currentPlan,
    permissions: permissions.length,
    permissionsList: permissions,
    hasIADiagnostico: permissions.includes('diagnostico_ia')
  });

  return {
    isActive,
    plan: currentPlan,
    permissions
  };
};

export const calculateCanAccessFeatures = (subscription: any, role: string): boolean => {
  const { isActive } = validatePlanAccess(subscription, role);
  console.log('calculateCanAccessFeatures: Calculando acesso:', {
    subscription: !!subscription,
    role,
    subscriptionStatus: subscription?.status,
    result: isActive
  });
  return isActive;
};
