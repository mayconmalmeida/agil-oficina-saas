
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import UsersHeader from '@/components/admin/UsersHeader';
import UsersTable from '@/components/admin/UsersTable';

export type User = {
  id: string;
  email: string;
  nome_oficina: string;
  is_active: boolean;
  created_at: string;
  quote_count: number;
  subscription_status: string;
  trial_ends_at: string | null;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        fetchUsers();
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          nome_oficina,
          is_active,
          created_at,
          trial_ends_at,
          subscriptions (
            status
          )
        `);

      if (error) {
        throw error;
      }

      const usersWithQuoteCounts = await Promise.all(data.map(async (user) => {
        const { count } = await supabase
          .from('orcamentos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        return {
          ...user,
          quote_count: count || 0,
          subscription_status: user.subscriptions && user.subscriptions[0]?.status || 'none',
        };
      }));

      setUsers(usersWithQuoteCounts);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a lista de usuários.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ));

      toast({
        title: "Status atualizado",
        description: `Usuário ${!currentStatus ? "ativado" : "desativado"} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário.",
      });
    }
  };

  const handleViewQuotes = (userId: string) => {
    navigate(`/admin/user/${userId}/quotes`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando lista de usuários...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UsersHeader onBack={() => navigate('/admin/dashboard')} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <UsersTable 
          users={users} 
          onToggleStatus={toggleUserStatus}
          onViewQuotes={handleViewQuotes}
        />
      </main>
    </div>
  );
};

export default AdminUsers;
