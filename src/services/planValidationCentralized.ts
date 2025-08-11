import { supabase } from '@/lib/supabase';

export type PlanType = 'free' | 'essencial' | 'premium';

export interface PlanStatus {
  isActive: boolean;
  plan: PlanType;
  planName: string;
  permissions: string[];
  daysRemaining: number;
  source: 'user_subscriptions' | 'oficinas' | 'profiles' | 'admin' | 'none';
  isAdmin: boolean;
  isPremium: boolean;
  isEssencial: boolean;
  canAccessFeatures: boolean;
}

/**
 * ✅ FUNÇÃO CENTRALIZADA de validação de plano
 * Esta é a ÚNICA função que deve ser usada para validar planos
 */
export const validatePlanAccess = async (userId: string): Promise<PlanStatus> => {
  console.log('[validatePlanAccess] 🔍 Validando plano para userId:', userId);

  try {
    // ✅ PRIMEIRO: Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', userId)
      .maybeSingle();

    const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
    
    if (isAdmin) {
      console.log('[validatePlanAccess] 👑 Admin detectado, liberando acesso total');
      return {
        isActive: true,
        plan: 'premium',
        planName: 'Administrador',
        permissions: ['*'], // Admin tem todas as permissões
        daysRemaining: 999,
        source: 'admin',
        isAdmin: true,
        isPremium: true,
        isEssencial: false,
        canAccessFeatures: true
      };
    }

    // ✅ SEGUNDO: Verificar assinaturas ativas (user_subscriptions)
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false });

    if (subscriptions && subscriptions.length > 0) {
      const activeSubscription = subscriptions[0];
      console.log('[validatePlanAccess] ✅ Assinatura ativa encontrada:', {
        plan_type: activeSubscription.plan_type,
        status: activeSubscription.status
      });

      // Determinar data de expiração
      let expirationDate: Date;
      let planType: PlanType;

      if (activeSubscription.status === 'trialing' && activeSubscription.trial_ends_at) {
        expirationDate = new Date(activeSubscription.trial_ends_at);
        planType = activeSubscription.plan_type.includes('premium') ? 'premium' : 'essencial';
      } else if (activeSubscription.ends_at) {
        expirationDate = new Date(activeSubscription.ends_at);
        planType = activeSubscription.plan_type.includes('premium') ? 'premium' : 'essencial';
      } else {
        // Sem data de expiração, considerar ativo permanentemente
        planType = activeSubscription.plan_type.includes('premium') ? 'premium' : 'essencial';
        const planName = planType === 'premium' ? 'Premium Ativo' : 'Essencial Ativo';
        const permissions = getPlanPermissions(planType);
        
        return {
          isActive: true,
          plan: planType,
          planName,
          permissions,
          daysRemaining: 999,
          source: 'user_subscriptions',
          isAdmin: false,
          isPremium: planType === 'premium',
          isEssencial: planType === 'essencial',
          canAccessFeatures: true
        };
      }

      // Verificar se ainda está ativo
      const now = new Date();
      const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isStillActive = expirationDate > now;

      if (isStillActive) {
        const isTrial = activeSubscription.status === 'trialing';
        const planName = isTrial 
          ? `${planType === 'premium' ? 'Premium' : 'Essencial'} (período de teste)`
          : `${planType === 'premium' ? 'Premium' : 'Essencial'} Ativo`;
        
        const permissions = getPlanPermissions(planType);
        
        return {
          isActive: true,
          plan: planType,
          planName,
          permissions,
          daysRemaining: Math.max(0, daysRemaining),
          source: 'user_subscriptions',
          isAdmin: false,
          isPremium: planType === 'premium',
          isEssencial: planType === 'essencial',
          canAccessFeatures: true
        };
      }
    }

    // ✅ TERCEIRO: Verificar na tabela oficinas
    const { data: oficina } = await supabase
      .from('oficinas')
      .select('plano, is_active, ativo, trial_ends_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (oficina && (oficina.is_active || oficina.ativo) && oficina.plano) {
      console.log('[validatePlanAccess] ✅ Plano ativo encontrado na oficina:', oficina.plano);
      
      // Verificar se tem trial ativo
      if (oficina.trial_ends_at) {
        const trialEnd = new Date(oficina.trial_ends_at);
        const now = new Date();
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (trialEnd > now) {
          const planType: PlanType = oficina.plano.toLowerCase() === 'premium' ? 'premium' : 'essencial';
          const planName = `${planType === 'premium' ? 'Premium' : 'Essencial'} (período de teste)`;
          const permissions = getPlanPermissions(planType);
          
          return {
            isActive: true,
            plan: planType,
            planName,
            permissions,
            daysRemaining: Math.max(0, daysRemaining),
            source: 'oficinas',
            isAdmin: false,
            isPremium: planType === 'premium',
            isEssencial: planType === 'essencial',
            canAccessFeatures: true
          };
        }
      }
      
      // Plano permanente
      const planType: PlanType = oficina.plano.toLowerCase() === 'premium' ? 'premium' : 'essencial';
      const planName = `${planType === 'premium' ? 'Premium' : 'Essencial'} Ativo`;
      const permissions = getPlanPermissions(planType);
      
      return {
        isActive: true,
        plan: planType,
        planName,
        permissions,
        daysRemaining: 999,
        source: 'oficinas',
        isAdmin: false,
        isPremium: planType === 'premium',
        isEssencial: planType === 'essencial',
        canAccessFeatures: true
      };
    }

    // ✅ QUARTO: Nenhum plano ativo
    console.log('[validatePlanAccess] ❌ Nenhum plano ativo encontrado');
    return {
      isActive: false,
      plan: 'free',
      planName: 'Gratuito',
      permissions: ['clientes', 'orcamentos'],
      daysRemaining: 0,
      source: 'none',
      isAdmin: false,
      isPremium: false,
      isEssencial: false,
      canAccessFeatures: false
    };

  } catch (error) {
    console.error('[validatePlanAccess] ❌ Erro na validação:', error);
    return {
      isActive: false,
      plan: 'free',
      planName: 'Gratuito',
      permissions: ['clientes', 'orcamentos'],
      daysRemaining: 0,
      source: 'none',
      isAdmin: false,
      isPremium: false,
      isEssencial: false,
      canAccessFeatures: false
    };
  }
};

/**
 * ✅ Permissões por plano
 */
export const getPlanPermissions = (plan: PlanType): string[] => {
  switch (plan) {
    case 'premium':
      return [
        'clientes', 'orcamentos', 'servicos', 'produtos', 'veiculos',
        'agendamentos', 'estoque', 'relatorios_avancados', 'relatorios_basicos',
        'marketing', 'diagnostico_ia', 'integracao_contabil', 'backup',
        'suporte_prioritario', 'configuracoes'
      ];
    case 'essencial':
      return [
        'clientes', 'orcamentos', 'servicos', 'produtos', 'veiculos',
        'relatorios_basicos', 'configuracoes', 'suporte_email'
      ];
    default:
      return ['clientes', 'orcamentos'];
  }
};

/**
 * ✅ Verificar se tem uma feature específica
 */
export const hasFeature = (permissions: string[], feature: string): boolean => {
  return permissions.includes('*') || permissions.includes(feature);
};

/**
 * ✅ Garantir que oficina existe e não é duplicada
 */
export const ensureOficinaExists = async (userId: string, userEmail: string, nomeOficina?: string): Promise<string | null> => {
  try {
    console.log('[ensureOficinaExists] 🔍 Verificando oficina para userId:', userId);
    
    // Verificar se já existe oficina
    const { data: existingOficina } = await supabase
      .from('oficinas')
      .select('id, nome_oficina')
      .or(`email.eq.${userEmail},user_id.eq.${userId}`)
      .maybeSingle();

    if (existingOficina) {
      console.log('[ensureOficinaExists] ✅ Oficina já existe:', existingOficina.id);
      
      // Atualizar o perfil para garantir que está vinculado
      await supabase
        .from('profiles')
        .update({ oficina_id: existingOficina.id })
        .eq('id', userId);
      
      return existingOficina.id;
    }

    // Criar nova oficina
    const { data: newOficina, error: insertError } = await supabase
      .from('oficinas')
      .insert({
        nome_oficina: nomeOficina || 'Minha Oficina',
        email: userEmail,
        user_id: userId,
        is_active: true,
        ativo: true,
        plano: 'Essencial'
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[ensureOficinaExists] ❌ Erro ao criar oficina:', insertError);
      return null;
    }

    console.log('[ensureOficinaExists] ✅ Nova oficina criada:', newOficina.id);
    
    // Vincular ao perfil
    await supabase
      .from('profiles')
      .update({ oficina_id: newOficina.id })
      .eq('id', userId);

    return newOficina.id;
  } catch (error) {
    console.error('[ensureOficinaExists] 💥 Erro:', error);
    return null;
  }
};