
export type PlanType = 'Free' | 'Essencial' | 'Premium';

interface Subscription {
  status: string; // Changed from union type to string to accept any status
  plan_type: string | null;
  ends_at?: string | null;
  trial_ends_at?: string | null;
}

export const validatePlanAccess = (subscription: Subscription | null): {
  isActive: boolean;
  plan: PlanType;
  permissions: string[];
} => {
  const now = new Date();
  let plan: PlanType = 'Free';
  let isActive = false;

  console.log('[validatePlanAccess] Validando assinatura:', subscription);

  if (!subscription) {
    console.log('[validatePlanAccess] Nenhuma assinatura encontrada → Free');
    return { isActive: false, plan, permissions: getPermissions(plan) };
  }

  const { status, plan_type, ends_at, trial_ends_at } = subscription;

  // ✅ Trial sempre Premium por 7 dias
  if (status === 'trialing' && trial_ends_at && new Date(trial_ends_at) > now) {
    plan = 'Premium';
    isActive = true;
    console.log('[validatePlanAccess] Trial ativo → Premium completo');
  } 
  // ✅ Assinatura ativa
  else if (status === 'active') {
    if (!ends_at || new Date(ends_at) > now) {
      isActive = true;
      
      if (plan_type?.toLowerCase().includes('premium')) {
        plan = 'Premium';
        console.log('[validatePlanAccess] Plano Premium ativo');
      } else if (plan_type?.toLowerCase().includes('essencial')) {
        plan = 'Essencial';
        console.log('[validatePlanAccess] Plano Essencial ativo');
      } else {
        plan = 'Essencial'; // Fallback para active sem tipo específico
        console.log('[validatePlanAccess] Plano ativo sem tipo específico → Essencial');
      }
    } else {
      console.log('[validatePlanAccess] Assinatura expirada');
    }
  } else {
    console.log('[validatePlanAccess] Status inválido ou cancelado');
  }

  const result = {
    isActive,
    plan,
    permissions: getPermissions(plan)
  };

  console.log('[validatePlanAccess] Resultado:', result);
  return result;
};

const getPermissions = (plan: PlanType): string[] => {
  const permissions = {
    Free: ['clientes', 'orcamentos'], // Básico após trial expirar
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
  return permissions[plan];
};
