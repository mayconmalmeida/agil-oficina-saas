
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import SubscriptionHeader from "@/components/admin/SubscriptionHeader";
import SubscriptionsTable from "@/components/admin/SubscriptionsTable";
import { SubscriptionWithProfile } from '@/utils/supabaseTypes';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithProfile[]>([]);
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
        // Carregar assinaturas
        fetchSubscriptions();
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      
      // Use a simpler query to avoid relations issues
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (subsError) {
        console.error('Erro ao carregar assinaturas:', subsError);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as assinaturas.",
        });
        setIsLoading(false);
        return;
      }

      if (!subsData || subsData.length === 0) {
        setIsLoading(false);
        setSubscriptions([]);
        return;
      }

      // Fetch profiles separately for each subscription
      const formattedSubscriptions: SubscriptionWithProfile[] = await Promise.all(subsData.map(async (sub) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email, nome_oficina')
          .eq('id', sub.user_id)
          .single();
          
        return {
          id: sub.id,
          user_id: sub.user_id,
          plan: sub.plan || '',
          status: sub.status,
          started_at: sub.started_at || '',
          created_at: sub.created_at,
          ends_at: sub.ends_at || undefined,
          expires_at: sub.expires_at || undefined,
          payment_method: sub.payment_method || '',
          amount: sub.amount,
          email: profileData?.email || '',
          nome_oficina: profileData?.nome_oficina || '',
        };
      }));
      
      setSubscriptions(formattedSubscriptions);
    } catch (error) {
      console.error('Erro inesperado ao carregar assinaturas:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro inesperado ao carregar as assinaturas.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SubscriptionHeader onBack={handleBack} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <SubscriptionsTable 
            subscriptions={subscriptions}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminSubscriptions;
