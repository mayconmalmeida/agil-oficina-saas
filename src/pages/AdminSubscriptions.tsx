import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import SubscriptionsTable from "@/components/admin/SubscriptionsTable";
import EditSubscriptionModal from '@/components/admin/subscriptions/EditSubscriptionModal';
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
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [oficinas, setOficinas] = useState<any[]>([]);
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

  const fetchOficinas = async () => {
    try {
      // Buscar oficinas que tenham usuários válidos no auth.users
      const { data, error } = await supabase
        .from('oficinas')
        .select(`
          id, 
          nome_oficina, 
          user_id,
          profiles!inner(id)
        `)
        .order('nome_oficina');

      if (error) throw error;
      setOficinas(data || []);
    } catch (error) {
      console.error('Erro ao buscar oficinas:', error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchOficinas();
  }, []);

  const handleBack = () => {
    navigate('/admin');
  };

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleEdit = (subscription: any) => {
    setEditingSubscription(subscription);
  };

  const handleModalClose = () => {
    setEditingSubscription(null);
    setIsCreating(false);
  };

  const handleModalSuccess = () => {
    fetchSubscriptions();
    handleModalClose();
  };

  if (isLoading) {
    return <Loading fullscreen text="Carregando assinaturas..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white shadow rounded-lg p-6 max-w-xl w-full">
          <h2 className="text-lg font-bold mb-2 text-red-700">Erro ao carregar assinaturas:</h2>
          <p className="mb-3 text-gray-700">{error}</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={fetchSubscriptions}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack}>
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Assinaturas</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSubscriptions}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Assinatura
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <SubscriptionsTable
            subscriptions={subscriptions}
            isLoading={isLoading}
            onEdit={handleEdit}
          />
        </div>
      </main>

      <EditSubscriptionModal
        subscription={editingSubscription}
        isOpen={isCreating || !!editingSubscription}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        isCreating={isCreating}
        oficinas={oficinas}
      />
    </div>
  );
};

export default AdminSubscriptions;
