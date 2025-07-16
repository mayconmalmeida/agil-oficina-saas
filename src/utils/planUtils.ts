
export const getPlanDetails = (planType: string) => {
  const planMap: { [key: string]: any } = {
    'essencial_mensal': {
      name: 'Essencial Mensal',
      type: 'essencial',
      billing: 'mensal',
      price: 'R$ 49,90',
      features: ['Gestão de clientes', 'Agendamentos', 'Orçamentos básicos']
    },
    'essencial_anual': {
      name: 'Essencial Anual',
      type: 'essencial',
      billing: 'anual',
      price: 'R$ 499,00',
      features: ['Gestão de clientes', 'Agendamentos', 'Orçamentos básicos']
    },
    'premium_mensal': {
      name: 'Premium Mensal',
      type: 'premium',
      billing: 'mensal',
      price: 'R$ 99,90',
      features: ['Tudo do Essencial', 'Gestão de estoque', 'Relatórios avançados', 'Marketing']
    },
    'premium_anual': {
      name: 'Premium Anual',
      type: 'premium',
      billing: 'anual',
      price: 'R$ 999,00',
      features: ['Tudo do Essencial', 'Gestão de estoque', 'Relatórios avançados', 'Marketing']
    },
    'free_trial_essencial': {
      name: 'Trial Essencial',
      type: 'essencial',
      billing: 'trial',
      price: 'Grátis',
      features: ['Gestão de clientes', 'Agendamentos', 'Orçamentos básicos']
    },
    'free_trial_premium': {
      name: 'Trial Premium',
      type: 'premium',
      billing: 'trial',
      price: 'Grátis',
      features: ['Tudo do Essencial', 'Gestão de estoque', 'Relatórios avançados', 'Marketing']
    }
  };

  return planMap[planType] || null;
};

export const calculateDaysRemaining = (endDate: string): number => {
  if (!endDate) return 0;
  
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};
