
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Workshop } from '@/components/admin/UsersTable';
import { Subscription } from './types';

export const useWorkshopsList = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  // Load all workshops
  const loadWorkshops = async () => {
    try {
      setIsLoading(true);
      // Get all workshop profiles with subscription status
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*, subscriptions(status, ends_at, started_at)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Get quote counts for each workshop
      const workshopsWithStats = await Promise.all((profiles || []).map(async (profile) => {
        const { count, error: countError } = await supabase
          .from('orcamentos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        // Handle subscriptions as array and extract status
        const subscriptionsData = Array.isArray(profile.subscriptions) ? profile.subscriptions : [];
        const subscription: Subscription = subscriptionsData[0] || {}; 
        const subscription_status = subscription?.status || 'inactive';
        
        const workshop: Workshop = {
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
          subscription_status: subscription_status,
          quote_count: count || 0
        };
        
        return workshop;
      }));

      setWorkshops(workshopsWithStats);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar oficinas",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle workshop status
  const handleToggleStatus = async (userId: string, isCurrentlyActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isCurrentlyActive })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: isCurrentlyActive ? "Oficina desativada" : "Oficina ativada",
        description: `A oficina foi ${isCurrentlyActive ? 'desativada' : 'ativada'} com sucesso.`,
      });

      // Refresh the list
      loadWorkshops();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message,
      });
    }
  };

  // Generate PDF Invoice
  const generatePDFInvoice = (workshop: Workshop) => {
    // This is a placeholder. In a real app, this would generate a PDF invoice.
    toast({
      title: "Função em desenvolvimento",
      description: "A geração de faturas em PDF será implementada em breve.",
    });
  };

  // View budgets
  const handleViewBudgets = (userId: string) => {
    // Placeholder for budget viewing functionality
    toast({
      title: "Função em desenvolvimento",
      description: "A visualização de orçamentos será implementada em breve.",
    });
  };

  return {
    workshops,
    isLoading,
    loadWorkshops,
    handleToggleStatus,
    generatePDFInvoice,
    handleViewBudgets
  };
};
