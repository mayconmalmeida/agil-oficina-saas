
import { supabase } from '@/lib/supabase';

export type PlanType = 'essencial' | 'premium' | 'enterprise';

export interface PlanValidationResult {
  isActive: boolean;
  plan: PlanType | null;
  permissions: string[];
  daysRemaining: number;
}

export const validateUserPlan = async (userId: string): Promise<PlanValidationResult> => {
  console.log('[validateUserPlan] Validando plano para userId:', userId);
  
  try {
    // Buscar assinatura ativa mais recente
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[validateUserPlan] Erro ao buscar assinatura:', error);
      return {
        isActive: false,
        plan: null,
        permissions: getPermissions('essencial'), // Fallback para essencial
        daysRemaining: 0
      };
    }

    if (!subscription) {
      console.log('[validateUserPlan] Nenhuma assinatura ativa encontrada');
      return {
        isActive: false,
        plan: null,
        permissions: getPermissions('essencial'), // Fallback para essencial
        daysRemaining: 0
      };
    }

    const now = new Date();
    
    // Verificar se ainda está válida (se tem data de fim)
    let isActive = true;
    let daysRemaining = 999; // Padrão para assinaturas sem data fim
    
    if (subscription.ends_at) {
      const endDate = new Date(subscription.ends_at);
      isActive = endDate > now;
      
      if (isActive) {
        const diffTime = endDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        daysRemaining = 0;
      }
    }

    // Determinar tipo do plano
    let planType: PlanType = 'essencial';
    if (subscription.plan_type === 'premium') {
      planType = 'premium';
    } else if (subscription.plan_type === 'enterprise') {
      planType = 'enterprise';
    }

    console.log('[validateUserPlan] Resultado:', {
      isActive,
      planType,
      daysRemaining,
      subscription: subscription.plan_type
    });

    return {
      isActive,
      plan: planType,
      permissions: getPermissions(planType),
      daysRemaining: Math.max(0, daysRemaining)
    };
  } catch (error) {
    console.error('[validateUserPlan] Erro na validação:', error);
    return {
      isActive: false,
      plan: null,
      permissions: getPermissions('essencial'),
      daysRemaining: 0
    };
  }
};

const getPermissions = (planType: PlanType | null): string[] => {
  const permissions = {
    essencial: [
      'clientes',
      'orcamentos',
      'servicos',
      'relatorios_basicos',
      'suporte_email',
      'backup_automatico',
      'ia_suporte_inteligente'
    ],
    premium: [
      'clientes',
      'orcamentos', 
      'servicos',
      'relatorios_basicos',
      'suporte_email',
      'backup_automatico',
      'ia_suporte_inteligente',
      'diagnostico_ia',
      'agendamentos_inteligentes',
      'relatorios_avancados',
      'marketing_automatico',
      'suporte_prioritario',
      'integracao_contabil'
    ],
    enterprise: [
      'clientes',
      'orcamentos',
      'servicos', 
      'relatorios_basicos',
      'suporte_email',
      'backup_automatico',
      'ia_suporte_inteligente',
      'diagnostico_ia',
      'agendamentos_inteligentes',
      'relatorios_avancados',
      'marketing_automatico',
      'suporte_prioritario',
      'integracao_contabil',
      'multi_filiais',
      'api_personalizada',
      'treinamento_dedicado',
      'gerente_conta',
      'sla_garantido',
      'customizacoes'
    ]
  };
  
  return permissions[planType || 'essencial'];
};

export const getPlanFeatures = (planType: PlanType | null) => {
  const features = {
    essencial: [
      'Gestão de clientes',
      'Orçamentos digitais',
      'Controle de serviços',
      'Relatórios básicos',
      'Suporte por e-mail',
      'Backup automático',
      'IA para Suporte Inteligente'
    ],
    premium: [
      'Tudo do Essencial',
      'IA para Diagnóstico de Problemas',
      'Agendamentos inteligentes',
      'Relatórios avançados',
      'Marketing automático',
      'Suporte prioritário',
      'Integração contábil'
    ],
    enterprise: [
      'Tudo do Premium',
      'Multi-filiais',
      'API personalizada',
      'Treinamento dedicado',
      'Gerente de conta',
      'SLA garantido',
      'Customizações'
    ]
  };

  return features[planType || 'essencial'];
};
