
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import SubscriptionHeader from '@/components/admin/SubscriptionHeader';
import SubscriptionsTable from '@/components/admin/SubscriptionsTable';
import Loading from '@/components/ui/loading';
import { SubscriptionWithProfile } from '@/utils/supabaseTypes';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithProfile[]>([]);
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

      if (data) {
        // Properly format the data by extracting profile information
        const formattedSubscriptions: SubscriptionWithProfile[] = data.map(sub => {
          // Extract profile data if available
          const profileData = sub.profiles && (
            Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles
          );
          
          return {
            id: sub.id,
            user_id: sub.user_id,
            status: sub.status || 'unknown',
            created_at: sub.created_at,
            expires_at: sub.expires_at,
            payment_method: sub.payment_method || 'N/A',
            amount: sub.amount || 0,
            email: profileData?.email || 'N/A',
            nome_oficina: profileData?.nome_oficina || 'N/A'
          };
        });

        setSubscriptions(formattedSubscriptions);
      }
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
    return <Loading fullscreen text="Carregando lista de assinaturas..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SubscriptionHeader onBack={() => navigate('/admin/dashboard')} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SubscriptionsTable subscriptions={subscriptions as any} />
      </main>
    </div>
  );
};

export default AdminSubscriptions;
