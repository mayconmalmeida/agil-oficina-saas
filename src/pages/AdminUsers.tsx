
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import UsersTable from "@/components/admin/UsersTable";
import Loading from '@/components/ui/loading';

interface ClientUser {
  id: string;
  nome: string;
  telefone: string;
  veiculo: string;
  email?: string | null;
  tipo?: string;
  cor?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  documento?: string;
  kilometragem?: string;
  bairro?: string;
  numero?: string;
  is_active?: boolean;
  created_at?: string;
  user_id?: string | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      console.log('[ADMIN-USERS] Fazendo consulta na tabela "clients"...');
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ADMIN-USERS] Erro ao buscar clientes:', error);
        throw error;
      }

      if (!clients || clients.length === 0) {
        console.warn('[ADMIN-USERS] Nenhum cliente encontrado na tabela clients.');
      } else {
        console.log('[ADMIN-USERS] Clientes encontrados:', clients);
      }

      setUsers(clients || []);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os clientes."
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

  const handleToggleStatus = async (clientId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ is_active: !currentStatus })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Cliente desativado" : "Cliente ativado",
        description: `O cliente foi ${currentStatus ? 'desativado' : 'ativado'} com sucesso.`,
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

  const handleViewBudgets = (clientId: string) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A visualização de orçamentos será implementada em breve.",
    });
  };

  const handleViewDetails = (clientId: string) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A visualização de detalhes será implementada em breve.",
    });
  };

  const handleEditUser = (client: any) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A edição de clientes será implementada em breve.",
    });
  };

  const handleChangePlan = (client: any) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A alteração de planos será implementada em breve.",
    });
  };

  const handleRenewSubscription = (client: any) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A renovação de assinaturas será implementada em breve.",
    });
  };

  const generatePDFInvoice = (client: any) => {
    toast({
      title: "Função em desenvolvimento",
      description: "A geração de faturas em PDF será implementada em breve.",
    });
  };

  if (isLoading) {
    return <Loading fullscreen text="Carregando clientes..." />;
  }

  // LOG dos usuários do state (apenas para diagnóstico)
  console.log('[ADMIN-USERS] State "users":', users);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Gerenciamento de Clientes (Tabela `clients`)
        </h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie todos os clientes cadastrados na plataforma.
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Clientes cadastrados</h3>
          <UsersTable 
            users={
              users.map(client => ({
                id: client.id,
                nome_oficina: client.nome,
                email: client.email || '',
                telefone: client.telefone || '',
                cnpj: '', // Adapte se sua tabela clients tiver campo cnpj
                responsavel: '', // Adapte se precisar
                plano: client.tipo || '',
                is_active: client.is_active ?? true,
                created_at: client.created_at || '',
                trial_ends_at: '', // Adapte se sua tabela clients tiver campo trial_ends_at
                subscription_status: '', // Adapte se sua tabela clients tiver campo de assinatura
                quote_count: 0
              }))
            }
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

