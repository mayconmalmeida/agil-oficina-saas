
import { OnboardingStatus } from '@/hooks/useOnboardingProgress';
import { supabase } from '@/lib/supabase';

export const allStepsCompleted = (status: OnboardingStatus) => {
  return (
    status.profile_completed &&
    status.clients_added &&
    status.services_added &&
    status.budget_created
  );
};

export const getCompletedSteps = (status: OnboardingStatus | null) => {
  if (!status) return 0;
  let count = 0;
  if (status.profile_completed) count++;
  if (status.clients_added) count++;
  if (status.services_added) count++;
  if (status.budget_created) count++;
  return count;
};

export const getProgressPercentage = (status: OnboardingStatus | null) => {
  const completed = getCompletedSteps(status);
  const total = 4; // Total number of steps
  return (completed / total) * 100;
};

export const getStepInfo = (stepName: keyof Omit<OnboardingStatus, 'user_id'>) => {
  const stepInfo = {
    profile_completed: {
      title: "Configurar perfil",
      route: "/perfil-oficina",
      description: "Configure as informações da sua oficina",
      index: 1
    },
    clients_added: {
      title: "Adicionar clientes",
      route: "/clientes",
      description: "Cadastre seus primeiros clientes",
      index: 2
    },
    services_added: {
      title: "Adicionar serviços",
      route: "/produtos-servicos",
      description: "Cadastre produtos e serviços",
      index: 3
    },
    budget_created: {
      title: "Criar orçamento",
      route: "/orcamentos/novo",
      description: "Crie seu primeiro orçamento",
      index: 4
    }
  };
  
  return stepInfo[stepName];
};

// New function to get the next onboarding step directly
export const getNextOnboardingStep = async (userId: string) => {
  try {
    // Check if the onboarding status record exists
    const { data, error } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao obter status do onboarding:', error);
      // If there's an error, direct to profile setup as first step
      return '/perfil-oficina';
    }
    
    // Determine next step based on onboarding status
    if (!data.profile_completed) return '/perfil-oficina';
    if (!data.clients_added) return '/clientes';
    if (!data.services_added) return '/produtos-servicos';
    if (!data.budget_created) return '/orcamentos/novo';
    
    // If all steps are completed, go to dashboard
    return '/dashboard';
  } catch (err) {
    console.error('Erro inesperado ao verificar onboarding:', err);
    return '/perfil-oficina'; // Default to profile setup on error
  }
};
