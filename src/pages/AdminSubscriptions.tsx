
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
  const [error, setError] = useState<string | null>(null);
  const [debugData, setDebugData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar todas as assinaturas
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      setDebugData({ subscriptionsData, subscriptionsError });
      console.log('[DEBUG] Assinaturas - subscriptionsData:', subscriptionsData, 'subscriptionsError:', subscriptionsError);

      if (subscriptionsError) throw subscriptionsError;

      // Para cada assinatura, buscar dados do perfil do usuário
      const subscriptionsWithProfiles = await Promise.all(
        (subscriptionsData || []).map(async (subscription) => {
          let profile: any = {};
          let planData: any = { price: 0 };

          try {
            // Buscar perfil
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('email, nome_oficina')
              .eq('id', subscription.user_id)
              .maybeSingle();

            if (profileError) {
              console.error('[DEBUG] Erro ao buscar perfil:', profileError);
            }
            profile = profileData || {};

            // Buscar preço do plano se disponível
            const { data: planDatum, error: planError } = await supabase
              .from('plan_configurations')
              .select('price')
              .eq('plan_type', subscription.plan_type.replace('_anual', '').replace('_mensal', ''))
              .eq('billing_cycle', subscription.plan_type.includes('_anual') ? 'anual' : 'mensal')
              .maybeSingle();

            if (planError) {
              console.error('[DEBUG] Erro ao buscar plan_configurations:', planError);
            }
            planData = planDatum || { price: 0 };
          } catch (err: any) {
            console.error('[DEBUG] Erro ao buscar perfil/plan_data:', err);
          }

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
    } catch (error: any) {
      setError(error.message ?? "Erro desconhecido ao carregar assinaturas.");
      setSubscriptions([]);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as assinaturas."
      });
      console.error('[DEBUG] Erro global ao carregar assinaturas:', error);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <SubscriptionHeader onBack={handleBack} />
        <div className="bg-white shadow rounded-lg p-6 max-w-xl w-full">
          <h2 className="text-lg font-bold mb-2 text-red-700">Erro ao carregar assinaturas:</h2>
          <p className="mb-3 text-gray-700">{error}</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={fetchSubscriptions}
          >
            Tentar Novamente
          </button>
          {debugData && (
            <div className="mt-6">
              <div className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto mb-1">
                <strong>[DEBUG] subscriptionsData:</strong>
                <pre>{JSON.stringify(debugData.subscriptionsData, null, 2)}</pre>
              </div>
              <div className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                <strong>[DEBUG] subscriptionsError:</strong>
                <pre>{JSON.stringify(debugData.subscriptionsError, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
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
        {/* Bloco debug adicional em casos de sucesso */}
        {debugData && (
          <div className="mt-4 mb-12 bg-gray-100 rounded-md p-4 text-xs overflow-x-auto max-w-2xl">
            <strong>[DEBUG] subscriptionsData:</strong>
            <pre>{JSON.stringify(debugData.subscriptionsData, null, 2)}</pre>
            <strong>[DEBUG] subscriptionsError:</strong>
            <pre>{JSON.stringify(debugData.subscriptionsError, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSubscriptions;
