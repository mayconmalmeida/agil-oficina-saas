
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useOnboardingProgress, OnboardingStatus } from "@/hooks/useOnboardingProgress";
import { Loader2 } from "lucide-react";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { status: onboardingStatus, loading: onboardingLoading, redirectToNextStep } = useOnboardingProgress(userId || undefined);

  useEffect(() => {
    const checkUser = async () => {
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
      
      // Carregar informações do perfil
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as informações do perfil.",
        });
      } else {
        setUserProfile(data);
      }
      
      setLoading(false);
    };
    
    checkUser();
  }, [navigate, toast]);
  
  // Redirect to next onboarding step if not all steps are completed
  useEffect(() => {
    if (!onboardingLoading && onboardingStatus && !allStepsCompleted(onboardingStatus)) {
      const nextStep = redirectToNextStep();
      toast({
        title: "Continue seu cadastro",
        description: "Vamos completar o cadastro da sua oficina.",
      });
      navigate(nextStep);
    }
  }, [onboardingStatus, onboardingLoading]);
  
  const allStepsCompleted = (status: OnboardingStatus) => {
    return (
      status.profile_completed &&
      status.clients_added &&
      status.services_added &&
      status.budget_created
    );
  };
  
  const getCompletedSteps = (status: OnboardingStatus | null) => {
    if (!status) return 0;
    let count = 0;
    if (status.profile_completed) count++;
    if (status.clients_added) count++;
    if (status.services_added) count++;
    if (status.budget_created) count++;
    return count;
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado com sucesso",
      description: "Você foi desconectado da sua conta.",
    });
    navigate('/');
  };
  
  if (loading || onboardingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-xl">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-oficina-dark sm:text-4xl">
            Bem-vindo ao OficinaÁgil
          </h1>
          <p className="mt-3 text-xl text-oficina-gray">
            {userProfile?.nome_oficina || userProfile?.full_name || 'Sua Oficina'}
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Seu Plano</CardTitle>
              <CardDescription>Detalhes da sua assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Plano:</strong> {userProfile?.plano === 'premium' ? 'Premium' : 'Essencial'}</p>
                <p><strong>Status:</strong> Período de teste (7 dias)</p>
                <p className="text-green-600 font-medium">Sua assinatura está ativa!</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Início Rápido</CardTitle>
              <CardDescription>
                {onboardingStatus && allStepsCompleted(onboardingStatus) 
                  ? 'Você completou todas as etapas!' 
                  : `${getCompletedSteps(onboardingStatus)}/4 etapas concluídas`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className={`flex items-center ${onboardingStatus?.profile_completed ? 'text-green-600' : ''}`}>
                  {onboardingStatus?.profile_completed ? '✅' : '▢'} 
                  <span className="ml-2">Configurar perfil da oficina</span>
                  {!onboardingStatus?.profile_completed && (
                    <Button 
                      variant="link" 
                      className="ml-auto text-xs" 
                      onClick={() => navigate('/perfil-oficina')}
                    >
                      Fazer agora
                    </Button>
                  )}
                </li>
                <li className={`flex items-center ${onboardingStatus?.clients_added ? 'text-green-600' : ''}`}>
                  {onboardingStatus?.clients_added ? '✅' : '▢'} 
                  <span className="ml-2">Adicionar seus primeiros clientes</span>
                  {!onboardingStatus?.clients_added && (
                    <Button 
                      variant="link" 
                      className="ml-auto text-xs" 
                      onClick={() => navigate('/clientes')}
                    >
                      Fazer agora
                    </Button>
                  )}
                </li>
                <li className={`flex items-center ${onboardingStatus?.services_added ? 'text-green-600' : ''}`}>
                  {onboardingStatus?.services_added ? '✅' : '▢'} 
                  <span className="ml-2">Cadastrar produtos e serviços</span>
                  {!onboardingStatus?.services_added && (
                    <Button 
                      variant="link" 
                      className="ml-auto text-xs" 
                      onClick={() => navigate('/produtos-servicos')}
                    >
                      Fazer agora
                    </Button>
                  )}
                </li>
                <li className={`flex items-center ${onboardingStatus?.budget_created ? 'text-green-600' : ''}`}>
                  {onboardingStatus?.budget_created ? '✅' : '▢'} 
                  <span className="ml-2">Criar seu primeiro orçamento</span>
                  {!onboardingStatus?.budget_created && (
                    <Button 
                      variant="link" 
                      className="ml-auto text-xs" 
                      onClick={() => navigate('/orcamentos/novo')}
                    >
                      Fazer agora
                    </Button>
                  )}
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Suporte</CardTitle>
              <CardDescription>Precisa de ajuda?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Nossa equipe está pronta para ajudar você a aproveitar ao máximo o OficinaÁgil.</p>
              <Button className="w-full">Central de Ajuda</Button>
              <Button variant="outline" className="w-full">Contato</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            variant="outline"
            onClick={handleLogout}
            className="text-oficina-gray"
          >
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
