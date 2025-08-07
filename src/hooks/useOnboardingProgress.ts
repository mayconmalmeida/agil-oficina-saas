import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { getNextOnboardingStep } from '@/utils/onboardingUtils';

export type OnboardingStatus = {
  user_id: string;
  profile_completed: boolean;
  clients_added: boolean;
  services_added: boolean;
  budget_created: boolean;
};

export const useOnboardingProgress = (userId?: string) => {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchStatus = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      
      // First check if the status record exists
      let { data, error } = await supabase
        .from('onboarding_status')
        .select('*')
        .eq('user_id', uid)
        .single();
      
      // If no record exists, create one
      if (error && error.code === 'PGRST116') {
        console.log('Creating new onboarding status for user:', uid);
        const { data: newStatus, error: insertError } = await supabase
          .from('onboarding_status')
          .insert({ user_id: uid })
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating onboarding status:', insertError);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível iniciar seu progresso de onboarding."
          });
          return null;
        }
        
        data = newStatus;
      } else if (error) {
        console.error('Error fetching onboarding status:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível verificar seu progresso."
        });
        return null;
      }

      // Verificar se o usuário tem clientes cadastrados
      if (data && !data.clients_added) {
        const { count: clientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', uid);

        if (clientsCount && clientsCount > 0) {
          // Atualizar o status para clients_added = true
          await supabase
            .from('onboarding_status')
            .update({ clients_added: true })
            .eq('user_id', uid);
          
          data.clients_added = true;
        }
      }

      // Verificar se o usuário tem serviços cadastrados
      if (data && !data.services_added) {
        const { count: servicesCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', uid);

        if (servicesCount && servicesCount > 0) {
          await supabase
            .from('onboarding_status')
            .update({ services_added: true })
            .eq('user_id', uid);
          
          data.services_added = true;
        }
      }

      // Verificar se o usuário tem orçamentos cadastrados
      if (data && !data.budget_created) {
        const { count: budgetsCount } = await supabase
          .from('orcamentos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', uid);

        if (budgetsCount && budgetsCount > 0) {
          await supabase
            .from('onboarding_status')
            .update({ budget_created: true })
            .eq('user_id', uid);
          
          data.budget_created = true;
        }
      }
      
      return data as OnboardingStatus;
    } catch (err) {
      console.error('Unexpected error in fetchStatus:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateProgress = useCallback(async (field: keyof Omit<OnboardingStatus, 'user_id'>, value: boolean = true) => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase
        .from('onboarding_status')
        .update({ [field]: value })
        .eq('user_id', userId);
        
      if (error) {
        console.error(`Error updating ${field}:`, error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: `Não foi possível atualizar seu progresso (${field}).`
        });
        return false;
      }
      
      setStatus(prev => prev ? { ...prev, [field]: value } : null);
      
      const stepMessages = {
        profile_completed: "Perfil configurado com sucesso!",
        clients_added: "Cliente adicionado com sucesso!",
        services_added: "Serviço/produto adicionado com sucesso!",
        budget_created: "Orçamento criado com sucesso!"
      };
      
      toast({
        title: "Etapa concluída",
        description: stepMessages[field] || "Progresso atualizado!"
      });
      
      return true;
    } catch (err) {
      console.error('Unexpected error in updateProgress:', err);
      return false;
    }
  }, [userId, toast]);
  
  const getNextStep = useCallback((currentStatus: OnboardingStatus | null) => {
    if (!currentStatus) return '/dashboard';
    
    if (!currentStatus.profile_completed) return '/perfil-oficina';
    if (!currentStatus.clients_added) return '/clientes';
    if (!currentStatus.services_added) return '/produtos-servicos';
    if (!currentStatus.budget_created) return '/orcamentos/novo';
    
    return '/dashboard';
  }, []);

  const redirectToNextStep = useCallback(async () => {
    if (!userId) return '/dashboard';
    
    try {
      const nextStep = await getNextOnboardingStep(userId);
      return nextStep;
    } catch (error) {
      console.error("Erro ao determinar próximo passo:", error);
      return '/dashboard';
    }
  }, [userId]);

  const redirectToNextStepAndNavigate = useCallback(async () => {
    const nextStep = await redirectToNextStep();
    navigate(nextStep);
    return nextStep;
  }, [redirectToNextStep, navigate]);

  useEffect(() => {
    const loadStatus = async () => {
      if (userId) {
        const data = await fetchStatus(userId);
        setStatus(data);
      } else {
        setLoading(false);
      }
    };
    
    loadStatus();
  }, [userId]); // Removida dependência fetchStatus para evitar loops

  return {
    status,
    loading,
    updateProgress,
    redirectToNextStep,
    redirectToNextStepAndNavigate,
    getNextStep
  };
};
