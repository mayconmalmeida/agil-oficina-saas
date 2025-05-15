import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { safeRpc } from '@/utils/supabaseTypes';
import { ServiceFormValues } from '@/components/services/ServiceForm';
import { ServiceForm } from '@/components/services/ServiceForm';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import Loading from '@/components/ui/loading';
import ServicesPageHeader from '@/components/services/ServicesPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ServicesPage: React.FC = () => {
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
  
  const onSubmit = async (values: ServiceFormValues) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para adicionar serviços ou produtos.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create services table if not exists using RPC function
      const { error } = await safeRpc('create_service', {
        p_user_id: userId,
        p_nome: values.nome,
        p_tipo: values.tipo,
        p_valor: parseFloat(values.valor.replace(',', '.')),
        p_descricao: values.descricao || null
      });
      
      if (error) {
        console.error('Erro ao adicionar serviço/produto:', error);
        toast({
          variant: "destructive",
          title: "Erro ao adicionar serviço/produto",
          description: error.message || "Ocorreu um erro ao adicionar o serviço/produto.",
        });
        return;
      }
      
      // Mark services as added
      await updateProgress('services_added', true);
      
      // Show success state
      setSaveSuccess(true);
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/orcamento');
      }, 1500);
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado ao adicionar o serviço/produto.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const skipStep = async () => {
    if (userId) {
      await updateProgress('services_added', true);
      navigate('/orcamento');
    }
  };
  
  if (isPageLoading) {
    return <Loading text="Carregando..." fullscreen />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <ServicesPageHeader />
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Adicione seus Serviços e Produtos</CardTitle>
            <CardDescription>
              Registre os serviços e produtos que sua oficina oferece
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceForm 
              onSubmit={onSubmit}
              onSkip={skipStep}
              isLoading={isLoading}
              saveSuccess={saveSuccess}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServicesPage;
