
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
    console.log('[validateUserPlan] 🔍 Validando plano para userId:', userId);
    
    // Buscar assinatura ativa mais recente - incluindo diferentes status
    let { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('[validateUserPlan] 📊 Resultado da consulta ativa:', { subscription, error });

    if (error) {
      console.error('[validateUserPlan] ❌ Erro ao buscar assinatura:', error);
      return {
        isActive: false,
        plan: null,
        permissions: getPlanPermissions('free'),
        daysRemaining: 0,
        source: 'none'
      };
    }

    // Se não encontrou ativa, buscar qualquer assinatura para análise
    if (!subscription) {
      console.log('[validateUserPlan] 🔄 Nenhuma assinatura ativa encontrada, buscando todas...');
      
      const { data: allSubscriptions, error: allError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('[validateUserPlan] 📋 Todas as assinaturas encontradas:', { 
        count: allSubscriptions?.length || 0, 
        subscriptions: allSubscriptions,
        error: allError 
      });

      if (allSubscriptions && allSubscriptions.length > 0) {
        const latestSubscription = allSubscriptions[0];
        console.log('[validateUserPlan] 🔍 Analisando assinatura mais recente:', {
          id: latestSubscription.id,
          status: latestSubscription.status,
          plan_type: latestSubscription.plan_type,
          starts_at: latestSubscription.starts_at,
          ends_at: latestSubscription.ends_at,
          is_manual: latestSubscription.is_manual
        });
        
        // Verificar se deveria estar ativa baseado nas datas
        const now = new Date();
        const startsAt = new Date(latestSubscription.starts_at);
        const endsAt = latestSubscription.ends_at ? new Date(latestSubscription.ends_at) : null;
        
        const hasStarted = now >= startsAt;
        const hasNotExpired = !endsAt || now <= endsAt;
        
        console.log('[validateUserPlan] ⏰ Análise de datas:', {
          now: now.toISOString(),
          startsAt: startsAt.toISOString(),
          endsAt: endsAt?.toISOString() || 'sem data de fim',
          hasStarted,
          hasNotExpired,
          shouldBeActive: hasStarted && hasNotExpired
        });

        // Se deveria estar ativa mas não está, usar mesmo assim
        if (hasStarted && hasNotExpired) {
          console.log('[validateUserPlan] ✅ Assinatura deveria estar ativa, processando...');
          subscription = latestSubscription;
        }
      }
      
      if (!subscription) {
        console.log('[validateUserPlan] ❌ Nenhuma assinatura válida encontrada');
        return {
          isActive: false,
          plan: null,
          permissions: getPlanPermissions('free'),
          daysRemaining: 0,
          source: 'none'
        };
      }
    }

    console.log('[validateUserPlan] 🎯 Processando assinatura:', {
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

    // Verificar se já começou
    const hasStarted = new Date(starts_at) <= now;
    console.log('[validateUserPlan] 🕐 Verificando início:', {
      starts_at,
      now: now.toISOString(),
      hasStarted
    });

    if (!hasStarted) {
      console.log('[validateUserPlan] ⏳ Assinatura ainda não começou');
      return {
        isActive: false,
        plan: null,
        permissions: getPlanPermissions('free'),
        daysRemaining: 0,
        source: 'none'
      };
    }

    // Determinar se está ativo
    let isActive = false;
    let daysRemaining = 0;
    let source: 'active' | 'trial' | 'manual' | 'expired' | 'none' = 'none';

    if (status === 'active') {
      if (is_manual) {
        // Assinatura manual - verificar se não expirou
        if (!ends_at || new Date(ends_at) > now) {
          isActive = true;
          source = 'manual';
          daysRemaining = ends_at ? calculateDaysRemaining(ends_at) : 9999;
          console.log('[validateUserPlan] ✅ Assinatura manual ativa');
        } else {
          source = 'expired';
          console.log('[validateUserPlan] ❌ Assinatura manual expirada');
        }
      } else {
        // Assinatura regular - verificar se não expirou
        if (!ends_at || new Date(ends_at) > now) {
          isActive = true;
          source = 'active';
          daysRemaining = ends_at ? calculateDaysRemaining(ends_at) : 9999;
          console.log('[validateUserPlan] ✅ Assinatura regular ativa');
        } else {
          source = 'expired';
          console.log('[validateUserPlan] ❌ Assinatura regular expirada');
        }
      }
    } else if (status === 'trialing') {
      // Período de trial - verificar se não expirou
      if (trial_ends_at && new Date(trial_ends_at) > now) {
        isActive = true;
        source = 'trial';
        daysRemaining = calculateDaysRemaining(trial_ends_at);
        console.log('[validateUserPlan] ✅ Trial ativo');
      } else {
        source = 'expired';
        console.log('[validateUserPlan] ❌ Trial expirado');
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

    const result = {
      isActive,
      plan: planType,
      permissions,
      daysRemaining,
      source
    };

    console.log('[validateUserPlan] 🏁 Resultado final:', {
      isActive,
      planType,
      source,
      daysRemaining,
      permissionsCount: permissions.length,
      permissions: permissions.slice(0, 5) // Mostrar apenas os primeiros 5 para evitar spam no log
    });

    return result;

  } catch (error) {
    console.error('[validateUserPlan] 💥 Erro na validação:', error);
    return {
      isActive: false,
      plan: null,
      permissions: getPlanPermissions('free'),
      daysRemaining: 0,
      source: 'none'
    };
  }
};
