
import { supabase } from '@/lib/supabase';

export type PlanType = 'essencial' | 'premium' | 'enterprise' | null;

interface PlanValidationResult {
  isActive: boolean;
  plan: PlanType;
  permissions: string[];
  daysRemaining: number;
  source: 'active' | 'trial' | 'manual' | 'expired' | 'none';
}

const getPlanPermissions = (planType: string): string[] => {
  const plan = planType.toLowerCase();
  
  if (plan.includes('premium')) {
    return [
      'clientes', 'orcamentos', 'servicos', 'relatorios_basicos', 
      'diagnostico_ia', 'campanhas_marketing', 'relatorios_avancados', 
      'agendamentos', 'backup_automatico', 'integracao_contabil',
      'suporte_prioritario', 'marketing_automatico'
    ];
  } else if (plan.includes('essencial')) {
    return [
      'clientes', 'orcamentos', 'servicos', 'relatorios_basicos', 
      'backup_automatico', 'suporte_email', 'ia_suporte_inteligente'
    ];
  }
  
  // Recursos básicos para plano inativo ou free
  return ['clientes', 'orcamentos'];
};

const calculateDaysRemaining = (endDate: string | null): number => {
  if (!endDate) return 0;
  
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

export const validateUserPlan = async (userId: string): Promise<PlanValidationResult> => {
  try {
    console.log('[validateUserPlan] Validando plano para userId:', userId);
    
    // Buscar assinatura ativa mais recente - incluindo diferentes status
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('[validateUserPlan] Resultado da consulta:', { subscription, error });

    if (error) {
      console.error('[validateUserPlan] Erro ao buscar assinatura:', error);
      return {
        isActive: false,
        plan: null,
        permissions: getPlanPermissions('free'),
        daysRemaining: 0,
        source: 'none'
      };
    }

    if (!subscription) {
      console.log('[validateUserPlan] Nenhuma assinatura ativa encontrada, tentando buscar qualquer assinatura...');
      
      // Se não encontrou ativa, buscar qualquer assinatura para debug
      const { data: anySubscription, error: anyError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('[validateUserPlan] Qualquer assinatura encontrada:', { anySubscription, anyError });

      if (anySubscription) {
        console.log('[validateUserPlan] Encontrada assinatura com status:', anySubscription.status);
        console.log('[validateUserPlan] Dados completos da assinatura:', anySubscription);
        
        // Verificar se a assinatura deveria estar ativa
        const now = new Date();
        const startsAt = new Date(anySubscription.starts_at);
        const endsAt = anySubscription.ends_at ? new Date(anySubscription.ends_at) : null;
        const trialEndsAt = anySubscription.trial_ends_at ? new Date(anySubscription.trial_ends_at) : null;
        
        console.log('[validateUserPlan] Verificação de datas:', {
          now: now.toISOString(),
          startsAt: startsAt.toISOString(),
          endsAt: endsAt?.toISOString(),
          trialEndsAt: trialEndsAt?.toISOString(),
          isAfterStart: now >= startsAt,
          isBeforeEnd: !endsAt || now <= endsAt,
          isBeforeTrialEnd: !trialEndsAt || now <= trialEndsAt
        });

        // Se a assinatura deveria estar ativa, processar mesmo assim
        if (now >= startsAt && (!endsAt || now <= endsAt)) {
          console.log('[validateUserPlan] Assinatura deveria estar ativa, processando...');
          subscription = anySubscription;
        }
      }
      
      if (!subscription) {
        return {
          isActive: false,
          plan: null,
          permissions: getPlanPermissions('free'),
          daysRemaining: 0,
          source: 'none'
        };
      }
    }

    console.log('[validateUserPlan] Assinatura encontrada:', {
      id: subscription.id,
      plan_type: subscription.plan_type,
      status: subscription.status,
      is_manual: subscription.is_manual,
      starts_at: subscription.starts_at,
      ends_at: subscription.ends_at,
      trial_ends_at: subscription.trial_ends_at
    });

    const now = new Date();
    const { plan_type, status, ends_at, trial_ends_at, is_manual, starts_at } = subscription;

    // Determinar se está ativo
    let isActive = false;
    let daysRemaining = 0;
    let source: 'active' | 'trial' | 'manual' | 'expired' | 'none' = 'none';

    // Verificar se já começou
    const hasStarted = new Date(starts_at) <= now;
    console.log('[validateUserPlan] Verificando se já começou:', {
      starts_at,
      now: now.toISOString(),
      hasStarted
    });

    if (!hasStarted) {
      console.log('[validateUserPlan] Assinatura ainda não começou');
      return {
        isActive: false,
        plan: null,
        permissions: getPlanPermissions('free'),
        daysRemaining: 0,
        source: 'none'
      };
    }

    if (status === 'active') {
      if (is_manual) {
        // Assinatura manual - verificar se não expirou
        if (!ends_at || new Date(ends_at) > now) {
          isActive = true;
          source = 'manual';
          daysRemaining = ends_at ? calculateDaysRemaining(ends_at) : 9999;
        } else {
          source = 'expired';
        }
      } else {
        // Assinatura regular - verificar se não expirou
        if (!ends_at || new Date(ends_at) > now) {
          isActive = true;
          source = 'active';
          daysRemaining = ends_at ? calculateDaysRemaining(ends_at) : 9999;
        } else {
          source = 'expired';
        }
      }
    } else if (status === 'trialing') {
      // Período de trial - verificar se não expirou
      if (trial_ends_at && new Date(trial_ends_at) > now) {
        isActive = true;
        source = 'trial';
        daysRemaining = calculateDaysRemaining(trial_ends_at);
      } else {
        source = 'expired';
      }
    }

    // Determinar tipo do plano
    let planType: PlanType = null;
    if (plan_type.toLowerCase().includes('premium')) {
      planType = 'premium';
    } else if (plan_type.toLowerCase().includes('essencial')) {
      planType = 'essencial';
    } else if (plan_type.toLowerCase().includes('enterprise')) {
      planType = 'enterprise';
    }

    const permissions = isActive ? getPlanPermissions(plan_type) : getPlanPermissions('free');

    console.log('[validateUserPlan] Resultado da validação:', {
      isActive,
      planType,
      source,
      daysRemaining,
      permissionsCount: permissions.length,
      debugInfo: {
        status,
        is_manual,
        starts_at,
        ends_at,
        trial_ends_at,
        now: now.toISOString()
      }
    });

    return {
      isActive,
      plan: planType,
      permissions,
      daysRemaining,
      source
    };

  } catch (error) {
    console.error('[validateUserPlan] Erro na validação:', error);
    return {
      isActive: false,
      plan: null,
      permissions: getPlanPermissions('free'),
      daysRemaining: 0,
      source: 'none'
    };
  }
};
