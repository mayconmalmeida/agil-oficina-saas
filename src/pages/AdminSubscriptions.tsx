
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
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id (
            email,
            nome_oficina
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Erro ao carregar assinaturas:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as assinaturas.",
        });
        setIsLoading(false);
        return;
      }
      
      // Map the data to a format that the component expects
      const formattedData: SubscriptionWithProfile[] = data?.map(item => {
        return {
          id: item.id,
          user_id: item.user_id,
          status: item.status,
          created_at: item.created_at,
          expires_at: item.ends_at || '',
          payment_method: item.payment_method || '',
          amount: item.amount,
          email: item.profiles?.email || '',
          nome_oficina: item.profiles?.nome_oficina || '',
        };
      }) || [];
      
      setSubscriptions(formattedData);
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
