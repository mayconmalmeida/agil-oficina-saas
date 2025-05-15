
import { OnboardingStatus } from '@/hooks/useOnboardingProgress';

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
