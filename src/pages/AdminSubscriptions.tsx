
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import SubscriptionHeader from "@/components/admin/SubscriptionHeader";
import SubscriptionsTable from "@/components/admin/SubscriptionsTable";
import { useAdminData } from '@/hooks/admin/useAdminData';

const AdminSubscriptions = () => {
  const { subscriptions, isLoadingSubscriptions, fetchSubscriptions } = useAdminData();
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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profileData || (profileData.role !== 'admin' && profileData.role !== 'superadmin')) {
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
  }, [navigate, toast, fetchSubscriptions]);

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  // Converter AdminSubscription para SubscriptionWithProfile format
  const formattedSubscriptions = subscriptions.map(sub => ({
    id: sub.id,
    user_id: sub.user_id,
    plan: sub.plan_type,
    status: sub.status,
    started_at: sub.starts_at,
    created_at: sub.created_at,
    ends_at: sub.ends_at,
    expires_at: sub.trial_ends_at || sub.ends_at,
    payment_method: 'N/A', // TODO: Add payment method if available
    amount: 0, // TODO: Add amount calculation based on plan
    email: sub.user_email,
    nome_oficina: sub.nome_oficina,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <SubscriptionHeader onBack={handleBack} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <SubscriptionsTable 
            subscriptions={formattedSubscriptions}
            isLoading={isLoadingSubscriptions}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminSubscriptions;
