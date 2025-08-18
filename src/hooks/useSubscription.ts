
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionStatus } from './useSubscriptionStatus';
import { startFreeTrial as startFreeTrialService } from '@/services/subscriptionService';

export const useSubscription = () => {
  const { subscriptionStatus, loading, error, refreshSubscription } = useSubscriptionStatus();
  const { toast } = useToast();

  const startFreeTrial = async (planType: 'premium') => {
    try {
      const result = await startFreeTrialService(planType);

      if (result.success) {
        toast({
          title: "Teste gratuito iniciado!",
          description: "Seu teste do plano Premium foi ativado por 7 dias."
        });

        window.location.reload();
        return { success: true };
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: result.error || "Não foi possível iniciar o teste gratuito."
        });
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      console.error('Erro ao iniciar teste gratuito:', err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: err.message || "Não foi possível iniciar o teste gratuito."
      });
      return { success: false, error: err.message };
    }
  };

  return {
    subscriptionStatus,
    loading,
    error,
    startFreeTrial,
    refreshSubscription
  };
};
