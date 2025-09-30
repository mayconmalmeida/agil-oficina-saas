
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Workshop } from '@/components/admin/UsersTable';
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';

export const useWorkshopPlan = (loadWorkshops: () => Promise<void>) => {
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopDetails | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();

  // Change plan
  const handleChangePlan = (workshop: Workshop) => {
    setSelectedWorkshop(workshop as WorkshopDetails);
    setCurrentPlan(workshop.plano || 'essencial');
    setShowPlanDialog(true);
  };

  // Save plan change
  const handleSavePlanChange = async () => {
    if (!selectedWorkshop) return;
    
    setIsProcessing(true);
    try {
      // Update profile plan
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ plano: currentPlan })
        .eq('id', selectedWorkshop.id);

      if (profileError) throw profileError;

      // Create or update subscription
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', selectedWorkshop.id)
        .eq('status', 'active')
        .maybeSingle();

      if (existingSubscription) {
        // Update existing subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({ 
            plan: currentPlan,
          })
          .eq('id', existingSubscription.id);

        if (subError) throw subError;
      } else {
        // Create new subscription
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // 30 days from now
        
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: selectedWorkshop.id,
            plan: currentPlan,
            status: 'active',
            expires_at: endDate.toISOString()
          });

        if (subError) throw subError;
      }

      toast({
        title: "Plano atualizado",
        description: `O plano foi alterado para ${currentPlan === 'premium' ? 'Premium' : 'Essencial'} com sucesso.`,
      });

      setShowPlanDialog(false);
      loadWorkshops();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar plano",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedWorkshop,
    setSelectedWorkshop,
    showPlanDialog,
    setShowPlanDialog,
    currentPlan,
    setCurrentPlan,
    isProcessing,
    handleChangePlan,
    handleSavePlanChange
  };
};
