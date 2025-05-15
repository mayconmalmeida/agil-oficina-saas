
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Loading from '@/components/ui/loading';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import ClientsPageHeader from '@/components/clients/ClientsPageHeader';
import ClientFormCard from '@/components/clients/ClientFormCard';
import { ClientFormValues } from '@/components/clients/ClientForm';

const ClientsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { updateProgress } = useOnboardingProgress(userId);
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            variant: "destructive",
            title: "Acesso não autorizado",
            description: "Você precisa fazer login para acessar este recurso.",
          });
          navigate('/login');
          return;
        }
        
        setUserId(session.user.id);
      } finally {
        setIsPageLoading(false);
      }
    };
    
    checkUser();
  }, [navigate, toast]);
  
  const onSubmit = async (values: ClientFormValues) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para adicionar clientes.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create clients table if not exists using RPC function
      const { error } = await supabase.rpc('create_client', {
        p_user_id: userId,
        p_nome: values.nome,
        p_telefone: values.telefone,
        p_email: values.email || null,
        p_veiculo: values.veiculo
      });
      
      if (error) {
        console.error('Erro ao adicionar cliente:', error);
        toast({
          variant: "destructive",
          title: "Erro ao adicionar cliente",
          description: error.message || "Ocorreu um erro ao adicionar o cliente.",
        });
        return;
      }
      
      // Mark clients as added
      await updateProgress('clients_added', true);
      
      // Show success state
      setSaveSuccess(true);
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/produtos-servicos');
      }, 1500);
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado ao adicionar o cliente.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const skipStep = async () => {
    if (userId) {
      await updateProgress('clients_added', true);
      navigate('/produtos-servicos');
    }
  };
  
  if (isPageLoading) {
    return <Loading text="Carregando..." fullscreen />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <ClientsPageHeader />
        <ClientFormCard 
          onSubmit={onSubmit}
          onSkip={skipStep}
          isLoading={isLoading}
          saveSuccess={saveSuccess}
        />
      </div>
    </div>
  );
};

export default ClientsPage;
