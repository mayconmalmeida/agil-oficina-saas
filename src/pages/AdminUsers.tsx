
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import UsersHeader from '@/components/admin/UsersHeader';
import UsersTable from '@/components/admin/UsersTable';
import Loading from '@/components/ui/loading';
import { Profile } from '@/utils/supabaseTypes';

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
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          nome_oficina,
          is_active,
          created_at,
          trial_ends_at
        `);

      if (profilesError) {
        throw profilesError;
      }

      if (!profilesData) {
        setUsers([]);
        setIsLoading(false);
        return;
      }

      // Get quoteCounts for each user
      const usersWithQuoteCounts = await Promise.all(profilesData.map(async (profile) => {
        // Get quote count
        const { count, error: countError } = await supabase
          .from('orcamentos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);
        
        if (countError) {
          console.error('Error fetching quote count:', countError);
        }
        
        // Get subscription status
        const { data: subscriptionData, error: subError } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        const subscription_status = subError ? 'none' : (subscriptionData?.status || 'none');

        return {
          id: profile.id,
          email: profile.email || 'N/A',
          nome_oficina: profile.nome_oficina || 'Não definido',
          is_active: profile.is_active || false,
          created_at: profile.created_at || new Date().toISOString(),
          quote_count: count || 0,
          subscription_status,
          trial_ends_at: profile.trial_ends_at
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
        .update({ is_active: !currentStatus } as Partial<Profile>)
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
    return <Loading fullscreen text="Carregando lista de usuários..." />;
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
