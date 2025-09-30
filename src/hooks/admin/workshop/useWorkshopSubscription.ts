
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Workshop } from '@/components/admin/UsersTable';
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';
import { format } from "date-fns";

export const useWorkshopSubscription = (loadWorkshops: () => Promise<void>) => {
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopDetails | null>(null);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [newExpireDate, setNewExpireDate] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();

  // Renew subscription
  const handleRenewSubscription = (workshop: Workshop) => {
    setSelectedWorkshop(workshop as WorkshopDetails);
    
    // Set default expiration date to 30 days from today
    const defaultExpireDate = new Date();
    defaultExpireDate.setDate(defaultExpireDate.getDate() + 30);
    
    setNewExpireDate(defaultExpireDate.toISOString().split('T')[0]);
    setShowRenewDialog(true);
  };

  // Renew subscription
  const handleRenewSubmit = async () => {
    if (!selectedWorkshop || !newExpireDate) return;
    
    setIsProcessing(true);
    try {
      const expireDate = new Date(newExpireDate);
      
      // Update trial_ends_at in profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ trial_ends_at: expireDate.toISOString() })
        .eq('id', selectedWorkshop.id);

      if (profileError) throw profileError;

      // Create or update subscription
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', selectedWorkshop.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingSubscription && existingSubscription.length > 0) {
        // Update existing subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({ 
            status: 'active',
            expires_at: expireDate.toISOString()
          })
          .eq('id', existingSubscription[0].id);

        if (subError) throw subError;
      } else {
        // Create new subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: selectedWorkshop.id,
            plan: selectedWorkshop.plano || 'essencial',
            status: 'active',
            expires_at: expireDate.toISOString()
          });

        if (subError) throw subError;
      }

      toast({
        title: "Assinatura renovada",
        description: `A assinatura foi renovada com vencimento para ${format(expireDate, 'dd/MM/yyyy')}.`,
      });

      setShowRenewDialog(false);
      loadWorkshops();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao renovar assinatura",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedWorkshop,
    setSelectedWorkshop,
    showRenewDialog,
    setShowRenewDialog,
    newExpireDate,
    setNewExpireDate,
    isProcessing,
    handleRenewSubscription,
    handleRenewSubmit
  };
};
