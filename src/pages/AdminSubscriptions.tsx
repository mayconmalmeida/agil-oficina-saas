
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import SubscriptionHeader from "@/components/admin/SubscriptionHeader";
import SubscriptionsTable from "@/components/admin/SubscriptionsTable";
import Loading from '@/components/ui/loading';

interface SubscriptionWithProfile {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  started_at: string;
  created_at: string;
  ends_at: string | null;
  expires_at: string | null;
  payment_method: string;
  amount: number;
  email: string;
  nome_oficina: string;
}

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      
      // Buscar todas as assinaturas
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionsError) throw subscriptionsError;

      // Para cada assinatura, buscar dados do perfil do usuário
      const subscriptionsWithProfiles = await Promise.all(
        (subscriptionsData || []).map(async (subscription) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, nome_oficina')
            .eq('id', subscription.user_id)
            .maybeSingle();

          // Buscar preço do plano se disponível
          const { data: planData } = await supabase
            .from('plan_configurations')
            .select('price')
            .eq('plan_type', subscription.plan_type.replace('_anual', '').replace('_mensal', ''))
            .eq('billing_cycle', subscription.plan_type.includes('_anual') ? 'anual' : 'mensal')
            .maybeSingle();

          return {
            id: subscription.id,
            user_id: subscription.user_id,
            plan: subscription.plan_type,
            status: subscription.status,
            started_at: subscription.starts_at,
            created_at: subscription.created_at,
            ends_at: subscription.ends_at,
            expires_at: subscription.trial_ends_at || subscription.ends_at,
            payment_method: 'Cartão de Crédito', // Assumindo cartão como padrão
            amount: planData?.price || 0,
            email: profile?.email || 'Email não encontrado',
            nome_oficina: profile?.nome_oficina || 'Nome não encontrado',
          };
        })
      );

      setSubscriptions(subscriptionsWithProfiles);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as assinaturas."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleBack = () => {
    navigate('/admin');
  };

  if (isLoading) {
    return <Loading fullscreen text="Carregando assinaturas..." />;
  }

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
