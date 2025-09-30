
import { supabase } from '@/lib/supabase';

export type PlanType = 'free' | 'essencial' | 'premium' | null;

export interface PlanValidationResult {
  isActive: boolean;
  plan: PlanType;
  permissions: string[];
  daysRemaining: number;
  source: 'user_subscriptions' | 'oficinas' | 'profiles' | 'none';
}

/**
 * ✅ Validação completa de plano do usuário
 * Verifica user_subscriptions, oficinas e profiles para determinar o plano ativo
 */
export const validateUserPlan = async (userId: string): Promise<PlanValidationResult> => {
  console.log('[validateUserPlan] Validando plano para userId:', userId);

  try {
    // ✅ PASSO 1: Verificar assinaturas ativas na tabela user_subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false });

    console.log('[validateUserPlan] Assinaturas encontradas:', {
      count: subscriptions?.length || 0,
      subscriptions: subscriptions?.map(s => ({
        id: s.id,
        plan_type: s.plan_type,
        status: s.status,
        ends_at: s.ends_at,
        trial_ends_at: s.trial_ends_at
      })),
      error: subError?.message
    });

    if (subscriptions && subscriptions.length > 0) {
      // Pegar a assinatura mais recente
      const activeSubscription = subscriptions[0];
      console.log('[validateUserPlan] Assinatura ativa encontrada:', {
        plan_type: activeSubscription.plan_type,
        status: activeSubscription.status,
        ends_at: activeSubscription.ends_at,
        trial_ends_at: activeSubscription.trial_ends_at
      });

      // Determinar data de expiração
      let expirationDate: Date;
      let planName: PlanType;

      if (activeSubscription.status === 'trialing' && activeSubscription.trial_ends_at) {
        expirationDate = new Date(activeSubscription.trial_ends_at);
        planName = activeSubscription.plan_type.includes('premium') ? 'premium' : 'essencial';
      } else if (activeSubscription.ends_at) {
        expirationDate = new Date(activeSubscription.ends_at);
        planName = activeSubscription.plan_type.includes('premium') ? 'premium' : 'essencial';
      } else {
        // Sem data de expiração definida, considerar como ativo por padrão
        console.log('[validateUserPlan] ⚠️ Sem data de expiração, considerando ativo');
        planName = activeSubscription.plan_type.includes('premium') ? 'premium' : 'essencial';
        return {
          isActive: true,
          plan: planName,
          permissions: getPlanPermissions(planName),
          daysRemaining: 999,
          source: 'user_subscriptions'
        };
      }

      // Verificar se ainda está ativo
      const now = new Date();
      const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isStillActive = expirationDate > now;

      console.log('[validateUserPlan] Verificação de expiração:', {
        expirationDate: expirationDate.toISOString(),
        now: now.toISOString(),
        daysRemaining,
        isStillActive
      });

      if (isStillActive) {
        return {
          isActive: true,
          plan: planName,
          permissions: getPlanPermissions(planName),
          daysRemaining: Math.max(0, daysRemaining),
          source: 'user_subscriptions'
        };
      } else {
        console.log('[validateUserPlan] ❌ Assinatura expirada');
      }
    }

    // ✅ PASSO 2: Verificar na tabela oficinas
    console.log('[validateUserPlan] Verificando na tabela oficinas...');
    const { data: oficina, error: oficinaError } = await supabase
      .from('oficinas')
      .select('plano, is_active, ativo')
      .eq('user_id', userId)
      .maybeSingle();

    if (oficinaError) {
      console.error('[validateUserPlan] Erro ao buscar oficina:', oficinaError);
    } else if (oficina) {
      console.log('[validateUserPlan] Oficina encontrada:', {
        plano: oficina.plano,
        is_active: oficina.is_active
      });

      // Se a oficina está ativa e tem plano definido
      if (oficina.is_active && oficina.plano) {
        console.log('[validateUserPlan] ✅ Plano ativo encontrado na oficina:', oficina.plano);
        const planType: PlanType = oficina.plano.toLowerCase() === 'premium' ? 'premium' : 'essencial';
        return {
          isActive: true,
          plan: planType,
          permissions: getPlanPermissions(planType),
          daysRemaining: 999, // Sem expiração definida
          source: 'oficinas'
        };
      }
    }

    // ✅ PASSO 3: Verificar na tabela profiles como fallback
    console.log('[validateUserPlan] Verificando na tabela profiles...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plano, trial_started_at, trial_ends_at')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('[validateUserPlan] Erro ao buscar perfil:', profileError);
    } else if (profile) {
      console.log('[validateUserPlan] Perfil encontrado:', {
        plano: profile.plano,
        trial_started_at: profile.trial_started_at,
        trial_ends_at: profile.trial_ends_at
      });

      // Se tem trial ativo na tabela profiles
      if (profile.trial_ends_at) {
        const trialEnd = new Date(profile.trial_ends_at);
        const now = new Date();
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (trialEnd > now) {
          console.log('[validateUserPlan] ✅ Trial ativo encontrado no profiles');
          const planType: PlanType = profile.plano?.toLowerCase() === 'premium' ? 'premium' : 'essencial';
          return {
            isActive: true,
            plan: planType,
            permissions: getPlanPermissions(planType),
            daysRemaining: Math.max(0, daysRemaining),
            source: 'profiles'
          };
        }
      }

      // Se tem plano ativo (sem trial)
      if (profile.plano && profile.plano !== 'Free') {
        console.log('[validateUserPlan] ✅ Plano ativo encontrado no profiles:', profile.plano);
        const planType: PlanType = profile.plano.toLowerCase() === 'premium' ? 'premium' : 'essencial';
        return {
          isActive: true,
          plan: planType,
          permissions: getPlanPermissions(planType),
          daysRemaining: 999, // Sem expiração definida
          source: 'profiles'
        };
      }
    }

    // ✅ PASSO 4: Nenhum plano ativo encontrado
    console.log('[validateUserPlan] Nenhuma assinatura ativa encontrada');
    return {
      isActive: false,
      plan: 'free',
      permissions: ['clientes', 'orcamentos'], // Recursos básicos
      daysRemaining: 0,
      source: 'none'
    };

  } catch (error) {
    console.error('[validateUserPlan] ❌ Erro na validação:', error);
    return {
      isActive: false,
      plan: 'free',
      permissions: ['clientes', 'orcamentos'],
      daysRemaining: 0,
      source: 'none'
    };
  }
};

/**
 * ✅ Retorna as permissões baseadas no plano
 */
export const getPlanPermissions = (plan: PlanType): string[] => {
  if (!plan) return ['clientes', 'orcamentos'];

  if (plan === 'premium') {
    return [
      'clientes', 'orcamentos', 'servicos', 'agendamentos', 'estoque',
      'relatorios', 'marketing_automatico', 'diagnostico_ia', 'integracoes',
      'backup_automatico', 'suporte_prioritario'
    ];
  }

  if (plan === 'essencial') {
    return [
      'clientes', 'orcamentos', 'servicos', 'agendamentos',
      'relatorios_basicos', 'backup_automatico'
    ];
  }

  // Plano gratuito ou sem plano
  return ['clientes', 'orcamentos'];
};

/**
 * ✅ Verifica se o usuário tem uma feature específica
 */
export const hasFeature = (permissions: string[], feature: string): boolean => {
  return permissions.includes(feature) || permissions.includes('*');
};
