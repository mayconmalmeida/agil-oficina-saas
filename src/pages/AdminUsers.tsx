
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import UsersHeader from "@/components/admin/UsersHeader";
import UsersTable from "@/components/admin/UsersTable";
import { Profile } from '@/utils/supabaseTypes';

interface UserWithStats extends Profile {
  is_active: boolean;
  quote_count: number;
  subscription_status: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar se o usuário é um administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (!adminData) {
        await supabase.auth.signOut();
        navigate('/admin/login');
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
      } else {
        // Carregar usuários
        fetchUsers();
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Buscar perfis com status de teste
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Erro ao carregar perfis:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados de usuários.",
        });
        setIsLoading(false);
        return;
      }

      if (!data) {
        setIsLoading(false);
        return;
      }
      
      // Para cada perfil, buscar contagem de orçamentos e status da assinatura
      const usersWithStats = await Promise.all(data.map(async (profile) => {
        try {
          // Verificar orçamentos
          const { count: quoteCount } = await supabase
            .from('orcamentos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          // Verificar assinaturas
          const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          const subscriptionStatus = 
            subscriptions && subscriptions.length > 0 
              ? subscriptions[0].status 
              : 'none';
          
          // Criar objeto com estatísticas
          return {
            id: profile.id,
            email: profile.email || '',
            nome_oficina: profile.nome_oficina || '',
            is_active: Boolean(profile.is_active || false),
            created_at: profile.created_at || '',
            quote_count: quoteCount || 0,
            subscription_status: subscriptionStatus,
            trial_ends_at: profile.trial_ends_at || '',
            // Copy other relevant Profile fields
            full_name: profile.full_name,
            telefone: profile.telefone,
            endereco: profile.endereco,
            cidade: profile.cidade,
            estado: profile.estado,
            cep: profile.cep,
            plano: profile.plano
          };
        } catch (err) {
          console.error('Erro ao buscar dados adicionais para usuário:', err);
          // Return a basic object if there was an error
          return {
            id: profile.id,
            email: profile.email || '',
            nome_oficina: profile.nome_oficina || '',
            is_active: false,
            created_at: profile.created_at || '',
            quote_count: 0,
            subscription_status: 'error',
            trial_ends_at: '',
            // Copy other relevant Profile fields
            full_name: profile.full_name,
            telefone: profile.telefone,
            endereco: profile.endereco,
            cidade: profile.cidade,
            estado: profile.estado,
            cep: profile.cep,
            plano: profile.plano
          };
        }
      }));
      
      setUsers(usersWithStats);
    } catch (error) {
      console.error('Erro inesperado ao carregar usuários:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro inesperado ao carregar os dados de usuários.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar status",
          description: "Não foi possível atualizar o status do usuário.",
        });
        return;
      }
      
      // Atualizar a lista de usuários
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, is_active: !currentStatus };
        }
        return user;
      }));
      
      toast({
        title: "Status atualizado",
        description: `Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro inesperado ao atualizar o status do usuário.",
      });
    }
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UsersHeader onBack={handleBack} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <UsersTable 
            users={users}
            isLoading={isLoading}
            onToggleStatus={handleToggleUserStatus}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
