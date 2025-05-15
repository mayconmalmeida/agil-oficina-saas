
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
      
      // Show success toast
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

  const redirectToNextStep = useCallback((immediate = false) => {
    const nextStep = getNextStep(status);
    if (immediate) {
      navigate(nextStep);
    }
    return nextStep;
  }, [status, getNextStep, navigate]);

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
  }, [userId, fetchStatus]);

  return {
    status,
    loading,
    updateProgress,
    redirectToNextStep,
    getNextStep
  };
};
