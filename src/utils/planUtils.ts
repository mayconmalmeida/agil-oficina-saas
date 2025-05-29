
import { PlanDetails } from '@/types/subscription';

export const getPlanDetails = (planType: string): PlanDetails | null => {
  const planMap: Record<string, PlanDetails> = {
    'essencial_mensal': {
      name: 'Essencial Mensal',
      type: 'essencial',
      billing: 'mensal',
      price: 'R$ 89,90/mês',
      features: [
        'Cadastro de clientes ilimitado',
        'Gestão de orçamentos',
        'Controle de serviços',
        'Relatórios básicos',
        'Suporte via e-mail'
      ]
    },
    'essencial_anual': {
      name: 'Essencial Anual',
      type: 'essencial',
      billing: 'anual',
      price: 'R$ 899,00/ano',
      features: [
        'Cadastro de clientes ilimitado',
        'Gestão de orçamentos',
        'Controle de serviços',
        'Relatórios básicos',
        'Suporte via e-mail'
      ]
    },
    'premium_mensal': {
      name: 'Premium Mensal',
      type: 'premium',
      billing: 'mensal',
      price: 'R$ 179,90/mês',
      features: [
        'Todos os recursos do plano Essencial',
        'Módulo de estoque integrado',
        'Agendamento de serviços',
        'Relatórios avançados',
        'Suporte prioritário',
        'Backup automático'
      ]
    },
    'premium_anual': {
      name: 'Premium Anual',
      type: 'premium',
      billing: 'anual',
      price: 'R$ 1.799,00/ano',
      features: [
        'Todos os recursos do plano Essencial',
        'Módulo de estoque integrado',
        'Agendamento de serviços',
        'Relatórios avançados',
        'Suporte prioritário',
        'Backup automático'
      ]
    },
    'free_trial_essencial': {
      name: 'Teste Grátis - Essencial',
      type: 'essencial',
      billing: 'trial',
      price: 'Grátis por 7 dias',
      features: [
        'Cadastro de clientes ilimitado',
        'Gestão de orçamentos',
        'Controle de serviços',
        'Relatórios básicos',
        'Suporte via e-mail'
      ]
    },
    'free_trial_premium': {
      name: 'Teste Grátis - Premium',
      type: 'premium',
      billing: 'trial',
      price: 'Grátis por 7 dias',
      features: [
        'Todos os recursos do plano Essencial',
        'Módulo de estoque integrado',
        'Agendamento de serviços',
        'Relatórios avançados',
        'Suporte prioritário',
        'Backup automático'
      ]
    }
  };

  return planMap[planType] || null;
};

export const calculateDaysRemaining = (subscription: any): number => {
  if (!subscription) return 0;
  
  const now = new Date();
  let endDate: Date | null = null;

  if (subscription.status === 'trialing' && subscription.trial_ends_at) {
    endDate = new Date(subscription.trial_ends_at);
  } else if (subscription.status === 'active' && subscription.ends_at) {
    endDate = new Date(subscription.ends_at);
  }

  if (!endDate) return 0;

  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};
