
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import SubscriptionHeader from '@/components/admin/SubscriptionHeader';
import SubscriptionsTable from '@/components/admin/SubscriptionsTable';

type Profile = {
  email: string;
  nome_oficina: string;
};

type Subscription = {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  payment_method: string;
  amount: number;
  profiles: Profile;
  email?: string;
  nome_oficina?: string;
};

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
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
        fetchSubscriptions();
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          status,
          created_at,
          expires_at,
          payment_method,
          amount,
          profiles (
            email,
            nome_oficina
          )
        `);

      if (error) {
        throw error;
      }

      // Corrigindo a formatação dos dados
      const formattedSubscriptions = data.map(sub => ({
        ...sub,
        email: sub.profiles?.email || 'N/A',
        nome_oficina: sub.profiles?.nome_oficina || 'N/A'
      }));

      setSubscriptions(formattedSubscriptions);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a lista de assinaturas.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando lista de assinaturas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SubscriptionHeader onBack={() => navigate('/admin/dashboard')} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SubscriptionsTable subscriptions={subscriptions} />
      </main>
    </div>
  );
};

export default AdminSubscriptions;
