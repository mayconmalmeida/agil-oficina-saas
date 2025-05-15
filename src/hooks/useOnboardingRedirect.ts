
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { getNextOnboardingStep } from '@/utils/onboardingUtils';

export const useOnboardingRedirect = (userId?: string, redirectImmediately: boolean = false) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleRedirect = useCallback(async () => {
    if (!userId) return;
    
    try {
      const nextStep = await getNextOnboardingStep(userId);
      
      if (redirectImmediately) {
        navigate(nextStep);
        
        const stepDescriptions: Record<string, string> = {
          '/perfil-oficina': 'Configure o perfil da sua oficina para começar',
          '/clientes': 'Adicione seus primeiros clientes',
          '/produtos-servicos': 'Cadastre produtos e serviços que você oferece',
          '/orcamentos/novo': 'Crie seu primeiro orçamento',
          '/dashboard': 'Configuração completa! Bem-vindo ao dashboard'
        };
        
        if (nextStep !== '/dashboard') {
          toast({
            title: "Próxima etapa",
            description: stepDescriptions[nextStep] || "Continue a configuração",
          });
        }
      }
      
      return nextStep;
    } catch (error) {
      console.error("Erro ao redirecionar para próxima etapa:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível determinar a próxima etapa"
      });
      return '/perfil-oficina';
    }
  }, [userId, navigate, toast, redirectImmediately]);
  
  useEffect(() => {
    if (redirectImmediately && userId) {
      handleRedirect();
    }
  }, [userId, redirectImmediately, handleRedirect]);
  
  return { handleRedirect };
};
