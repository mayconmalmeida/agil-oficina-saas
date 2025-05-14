
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import SubscriptionHeader from '@/components/admin/SubscriptionHeader';
import SubscriptionsTable from '@/components/admin/SubscriptionsTable';

// Ensure this type definition matches the one in SubscriptionsTable
type Subscription = {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  payment_method: string;
  amount: number;
  email: string;
  nome_oficina: string;
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

      // Properly format the data by extracting profile information from the array's first element
      const formattedSubscriptions: Subscription[] = data.map(sub => ({
        id: sub.id,
        user_id: sub.user_id,
        status: sub.status,
        created_at: sub.created_at,
        expires_at: sub.expires_at,
        payment_method: sub.payment_method,
        amount: sub.amount,
        email: sub.profiles && sub.profiles[0]?.email || 'N/A',
        nome_oficina: sub.profiles && sub.profiles[0]?.nome_oficina || 'N/A'
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
