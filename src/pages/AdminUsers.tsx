
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import UsersTable from "@/components/admin/UsersTable";
import Loading from '@/components/ui/loading';

interface UserProfile {
  id: string;
  nome_oficina: string | null;
  email: string | null;
  telefone: string | null;
  cnpj: string | null;
  responsavel: string | null;
  plano: string;
  is_active: boolean;
  created_at: string;
  trial_ends_at: string | null;
  subscription_status: string;
  quote_count: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Buscar todos os perfis de usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Para cada usuário, buscar sua assinatura mais recente e contagem de orçamentos
      const usersWithDetails = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Buscar assinatura mais recente
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Buscar contagem de orçamentos
          const { count: quotesCount } = await supabase
            .from('orcamentos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          return {
            id: profile.id,
            nome_oficina: profile.nome_oficina || 'Não definido',
            email: profile.email,
            telefone: profile.telefone,
            cnpj: profile.cnpj,
            responsavel: profile.responsavel,
            plano: subscription?.plan_type || profile.plano || 'essencial',
            is_active: profile.is_active ?? true,
            created_at: profile.created_at,
            trial_ends_at: profile.trial_ends_at,
            subscription_status: subscription?.status || 'inactive',
            quote_count: quotesCount || 0
          };
        })
      );

      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os usuários."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefreshData = () => {
    fetchUsers();
  };

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

  if (isLoading) {
    return <Loading fullscreen text="Carregando usuários..." />;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Gerenciamento de Usuários
        </h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie todos os usuários da plataforma.
        </p>
      </div>
      
      <div className="flex justify-end mb-4">
        <Button onClick={handleRefreshData} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar dados
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Usuários cadastrados</h3>
          <UsersTable 
            users={users}
            isLoading={isLoading}
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
    </div>
  );
};

export default AdminUsers;
