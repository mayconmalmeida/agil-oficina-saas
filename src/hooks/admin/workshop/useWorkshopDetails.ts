
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Workshop } from '@/components/admin/UsersTable';
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';
import { Subscription } from './types';

export const useWorkshopDetails = () => {
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopDetails | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();

  // View workshop details
  const handleViewDetails = async (userId: string) => {
    try {
      setIsProcessing(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      const subscription: Subscription = subscriptionData && subscriptionData[0] ? subscriptionData[0] : {};

      // Get quote counts
      const { count: quoteCount } = await supabase
        .from('orcamentos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (profile) {
        const workshopDetails: WorkshopDetails = {
          id: profile.id,
          nome_oficina: profile.nome_oficina || '',
          email: profile.email || '',
          telefone: profile.telefone,
          cnpj: profile.cnpj,
          responsavel: profile.responsavel,
          plano: profile.plano,
          is_active: profile.is_active || false,
          created_at: profile.created_at || '',
          trial_ends_at: profile.trial_ends_at,
          subscription_status: subscription?.status || 'inactive',
          quote_count: quoteCount || 0,
          endereco: profile.endereco,
          cidade: profile.cidade,
          estado: profile.estado,
          cep: profile.cep
        };
        
        setSelectedWorkshop(workshopDetails);
        setShowDetailsDialog(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar detalhes",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedWorkshop,
    setSelectedWorkshop,
    showDetailsDialog,
    setShowDetailsDialog,
    isProcessing,
    handleViewDetails
  };
};
