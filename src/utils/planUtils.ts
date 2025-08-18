
export const getPlanDetails = (planType: string) => {
  const planMap: { [key: string]: any } = {
    'premium_mensal': {
      name: 'Premium Mensal',
      type: 'premium',
      billing: 'mensal',
      price: 'R$ 197,00',
      features: [
        'Gestão completa de clientes',
        'Orçamentos digitais profissionais', 
        'IA para diagnóstico avançado',
        'Agendamentos inteligentes',
        'Controle de estoque completo',
        'Relatórios avançados',
        'Marketing automático',
        'Suporte prioritário'
      ]
    },
    'premium_anual': {
      name: 'Premium Anual',
      type: 'premium',
      billing: 'anual',
      price: 'R$ 1.970,00',
      features: [
        'Tudo do Premium Mensal',
        '2 meses grátis no plano anual',
        'Desconto especial de 17%',
        'Suporte prioritário garantido',
        'Treinamento personalizado',
        'Migração gratuita de dados'
      ]
    },
    'free_trial_premium': {
      name: 'Trial Premium',
      type: 'premium',
      billing: 'trial',
      price: 'Grátis',
      features: [
        'Acesso completo por 7 dias',
        'Todos os recursos Premium',
        'Suporte durante o trial'
      ]
    }
  };

  return planMap[planType] || {
    name: 'Premium',
    type: 'premium',
    billing: 'mensal',
    price: 'R$ 197,00',
    features: ['Acesso completo aos recursos Premium']
  };
};

export const calculateDaysRemaining = (endDate: string): number => {
  if (!endDate) return 0;
  
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};
