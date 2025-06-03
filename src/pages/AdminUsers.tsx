
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import DashboardHeader from "@/components/admin/DashboardHeader";
import UsersHeader from "@/components/admin/UsersHeader";
import UsersTable from "@/components/admin/UsersTable";
import UserDetailsDialog from '@/components/admin/users/UserDetailsDialog';
import EditUserDialog from '@/components/admin/users/EditUserDialog';
import ChangePlanDialog from '@/components/admin/users/ChangePlanDialog';
import RenewSubscriptionDialog from '@/components/admin/users/RenewSubscriptionDialog';
import { useAdminData } from '@/hooks/admin/useAdminData';

const AdminUsers = () => {
  const { 
    users,
    isLoadingUsers,
    fetchUsers,
    refetch
  } = useAdminData();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuthAndLoadData();
  }, []);

  const checkAdminAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/admin/login');
      return;
    }

    // Verificar role na tabela profiles ao invés da tabela admins
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profileData || (profileData.role !== 'admin' && profileData.role !== 'superadmin')) {
      await supabase.auth.signOut();
      navigate('/admin/login');
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Você não tem permissão de administrador.",
      });
      return;
    }

    await fetchUsers();
  };

  const handleRefreshData = () => {
    fetchUsers();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Converter AdminUser para Workshop format
  const workshopsData = users.map(user => ({
    id: user.id,
    nome_oficina: user.nome_oficina || 'Não definido',
    email: user.email,
    telefone: user.telefone,
    cnpj: user.cnpj,
    responsavel: user.responsavel,
    plano: user.subscription?.plan_type || 'essencial',
    is_active: user.is_active,
    created_at: user.created_at,
    trial_ends_at: user.trial_ends_at,
    subscription_status: user.subscription?.status || 'inactive',
    quote_count: 0 // TODO: Implement quote count if needed
  }));

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Usuário desativado" : "Usuário ativado",
        description: `O usuário foi ${currentStatus ? 'desativado' : 'ativado'} com sucesso.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message,
      });
    }
  };

  const handleViewBudgets = (userId: string) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A visualização de orçamentos será implementada em breve.",
    });
  };

  const handleViewDetails = (userId: string) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A visualização de detalhes será implementada em breve.",
    });
  };

  const handleEditUser = (user: any) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A edição de usuários será implementada em breve.",
    });
  };

  const handleChangePlan = (user: any) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A alteração de planos será implementada em breve.",
    });
  };

  const handleRenewSubscription = (user: any) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A renovação de assinaturas será implementada em breve.",
    });
  };

  const generatePDFInvoice = (user: any) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A geração de faturas em PDF será implementada em breve.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Gerenciamento de Oficinas"
        onLogout={handleLogout} 
      />
      
      <UsersHeader onBack={() => navigate('/admin/dashboard')} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-end mb-4">
          <Button onClick={handleRefreshData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar dados
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Oficinas cadastradas</h3>
            <UsersTable 
              users={workshopsData}
              isLoading={isLoadingUsers}
              onToggleStatus={handleToggleStatus}
              onViewQuotes={handleViewBudgets}
              onViewDetails={handleViewDetails}
              onEditUser={handleEditUser}
              onChangePlan={handleChangePlan}
              onRenewSubscription={handleRenewSubscription}
              onGeneratePDF={generatePDFInvoice}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
