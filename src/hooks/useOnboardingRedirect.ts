
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { getNextOnboardingStep } from '@/utils/onboardingUtils';

export const useOnboardingRedirect = (userId?: string, redirectImmediately: boolean = false) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleRedirect = useCallback(async (uid?: string, shouldRedirect: boolean = false) => {
    const currentUserId = uid || userId;
    
    if (!currentUserId) {
      console.log("Nenhum ID de usuário fornecido para redirecionamento");
      return;
    }
    
    try {
      console.log("Obtendo próxima etapa para usuário:", currentUserId);
      const nextStep = await getNextOnboardingStep(currentUserId);
      console.log("Próxima etapa determinada:", nextStep);
      
      if (shouldRedirect || redirectImmediately) {
        console.log("Redirecionando para:", nextStep);
        
        const stepDescriptions: Record<string, string> = {
          '/perfil-oficina': 'Configure o perfil da sua oficina para começar',
          '/clientes': 'Adicione seus primeiros clientes',
          '/produtos-servicos': 'Cadastre produtos e serviços que você oferece',
          '/orcamentos/novo': 'Crie seu primeiro orçamento',
          '/dashboard': 'Configuração completa! Bem-vindo ao dashboard'
        };
        
        // Garante que a navegação aconteça
        window.setTimeout(() => {
          navigate(nextStep);
          
          if (nextStep !== '/dashboard') {
            toast({
              title: "Próxima etapa",
              description: stepDescriptions[nextStep] || "Continue a configuração",
            });
          }
        }, 100);
      }
      
      return nextStep;
    } catch (error) {
      console.error("Erro ao redirecionar para próxima etapa:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível determinar a próxima etapa"
      });
      
      // Redirecionamento para perfil como fallback
      if (shouldRedirect || redirectImmediately) {
        window.setTimeout(() => {
          navigate('/perfil-oficina');
        }, 100);
      }
      
      return '/perfil-oficina';
    }
  }, [userId, navigate, toast, redirectImmediately]);
  
  useEffect(() => {
    if (redirectImmediately && userId) {
      handleRedirect(userId, true);
    }
  }, [userId, redirectImmediately, handleRedirect]);
  
  return { handleRedirect };
};
