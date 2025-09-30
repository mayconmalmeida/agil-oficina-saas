
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { WorkshopStatus } from '@/types/dashboardTypes';

type WorkshopStatusData = {
  workshopStatus: WorkshopStatus;
  daysRemaining: number;
  planType: string;
};

export const useWorkshopStatus = (userId?: string) => {
  const [status, setStatus] = useState<WorkshopStatusData>({
    workshopStatus: 'trial',
    daysRemaining: 7,
    planType: 'basic',
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkshopStatus = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('plano, trial_ends_at')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Error fetching profile data:", profileError);
          toast({
            variant: "destructive",
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os dados do seu perfil.",
          });
          return;
        }

        // Calculate trial status and days remaining
        let workshopStatus: WorkshopStatus = 'trial';
        let daysRemaining = 7;
        
        if (profileData) {
          const planType = profileData.plano || 'basic';
          const trialEndsAt = profileData.trial_ends_at ? new Date(profileData.trial_ends_at) : null;
          
          if (planType === 'premium') {
            workshopStatus = 'active';
          } else if (trialEndsAt) {
            const now = new Date();
            if (trialEndsAt > now) {
              const diffTime = trialEndsAt.getTime() - now.getTime();
              daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              workshopStatus = 'trial';
            } else {
              workshopStatus = 'expired';
              daysRemaining = 0;
            }
          }
          
          setStatus({
            workshopStatus,
            daysRemaining,
            planType,
          });
        }
      } catch (error) {
        console.error("Error in fetchWorkshopStatus:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao carregar o status da sua oficina.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshopStatus();
  }, [userId, toast]);

  return { status, isLoading };
};
