
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Workshop } from '@/components/admin/UsersTable';
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';
import { format } from "date-fns";

// Define the subscription type
type Subscription = {
  status?: string;
  ends_at?: string;
  started_at?: string;
};

export const useWorkshops = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopDetails | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [newExpireDate, setNewExpireDate] = useState<string>('');
  const [editFormData, setEditFormData] = useState({
    nome_oficina: '',
    cnpj: '',
    responsavel: '',
    email: '',
    telefone: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

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
        const trial_ends_at = profile.trial_ends_at;
        
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

      const subscription = subscriptionData && subscriptionData[0] ? subscriptionData[0] : {};

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

  // Edit workshop
  const handleEditWorkshop = (workshop: Workshop) => {
    setEditFormData({
      nome_oficina: workshop.nome_oficina || '',
      cnpj: workshop.cnpj || '',
      responsavel: workshop.responsavel || '',
      email: workshop.email || '',
      telefone: workshop.telefone || '',
    });
    setSelectedWorkshop(workshop as WorkshopDetails);
    setShowEditDialog(true);
  };

  // Change plan
  const handleChangePlan = (workshop: Workshop) => {
    setSelectedWorkshop(workshop as WorkshopDetails);
    setCurrentPlan(workshop.plano || 'essencial');
    setShowPlanDialog(true);
  };

  // Renew subscription
  const handleRenewSubscription = (workshop: Workshop) => {
    setSelectedWorkshop(workshop as WorkshopDetails);
    
    // Set default expiration date to 30 days from today
    const defaultExpireDate = new Date();
    defaultExpireDate.setDate(defaultExpireDate.getDate() + 30);
    
    setNewExpireDate(defaultExpireDate.toISOString().split('T')[0]);
    setShowRenewDialog(true);
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

  // Save workshop edit
  const handleSaveEdit = async () => {
    if (!selectedWorkshop) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome_oficina: editFormData.nome_oficina,
          email: editFormData.email,
          telefone: editFormData.telefone,
          cnpj: editFormData.cnpj,
          responsavel: editFormData.responsavel
        })
        .eq('id', selectedWorkshop.id);

      if (error) throw error;

      toast({
        title: "Oficina atualizada",
        description: "Os dados da oficina foram atualizados com sucesso.",
      });

      setShowEditDialog(false);
      loadWorkshops();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar oficina",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
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
    selectedWorkshop,
    showDetailsDialog,
    setShowDetailsDialog,
    showEditDialog, 
    setShowEditDialog,
    showRenewDialog, 
    setShowRenewDialog,
    showPlanDialog, 
    setShowPlanDialog,
    currentPlan, 
    setCurrentPlan,
    newExpireDate, 
    setNewExpireDate,
    editFormData, 
    setEditFormData,
    isProcessing,
    loadWorkshops,
    handleViewDetails,
    handleEditWorkshop,
    handleChangePlan,
    handleRenewSubscription,
    handleToggleStatus,
    handleSaveEdit,
    handleSavePlanChange,
    handleRenewSubmit,
    generatePDFInvoice,
    handleViewBudgets
  };
};
