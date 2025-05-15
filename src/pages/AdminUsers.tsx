
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

      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (adminError || !adminData) {
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
      // First check if is_active column exists in profiles table
      const { error: columnCheckError } = await supabase
        .from('profiles')
        .select('is_active')
        .limit(1);
        
      // If the column doesn't exist, we need to add it with a migration
      // For now, we'll work with what we have
      const isActiveExists = !columnCheckError;
      
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          nome_oficina,
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

      // Get quoteCounts and subscription status for each user
      const usersWithDetails = await Promise.all(profilesData.map(async (profile) => {
        if (!profile) return null;
        
        // Get quote count
        let quoteCount = 0;
        try {
          const { count, error: countError } = await supabase
            .from('orcamentos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          if (!countError) {
            quoteCount = count || 0;
          }
        } catch (error) {
          console.error('Error fetching quote count:', error);
        }
        
        // Get subscription status
        let subscriptionStatus = 'none';
        
        try {
          const { data: subscriptionData, error: subError } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (!subError && subscriptionData) {
            subscriptionStatus = subscriptionData.status || 'none';
          }
        } catch (error) {
          console.error('Error fetching subscription status:', error);
        }

        // Default is_active to true if the column doesn't exist
        return {
          id: profile.id,
          email: profile.email || 'N/A',
          nome_oficina: profile.nome_oficina || 'Não definido',
          is_active: isActiveExists ? (profile.is_active || false) : true,
          created_at: profile.created_at || new Date().toISOString(),
          quote_count: quoteCount,
          subscription_status: subscriptionStatus,
          trial_ends_at: profile.trial_ends_at
        };
      }));

      // Filter out null values
      setUsers(usersWithDetails.filter(Boolean) as User[]);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a lista de usuários: " + (error.message || "Erro desconhecido"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Check if is_active column exists
      const { error: columnCheckError } = await supabase
        .from('profiles')
        .select('is_active')
        .limit(1);
        
      if (columnCheckError) {
        // Column doesn't exist, we should add it
        toast({
          variant: "destructive",
          title: "Operação não suportada",
          description: "A coluna is_active não existe na tabela profiles. Por favor, atualize o esquema do banco de dados.",
        });
        return;
      }
      
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
    } catch (error: any) {
      console.error('Erro ao atualizar status do usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário: " + (error.message || "Erro desconhecido"),
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
