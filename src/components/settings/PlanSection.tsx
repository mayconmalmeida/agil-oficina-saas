import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const PlanSection: React.FC = () => {
  const { subscriptionStatus, loading, startFreeTrial } = useSubscription();
  
  if (loading) {
    return <div>Carregando informações do plano...</div>;
  }
  
  const { 
    hasSubscription, 
    subscription, 
    isTrialActive, 
    isPremium, 
    daysRemaining,
    planDetails
  } = subscriptionStatus;
  
  const handleStartTrial = async () => {
    await startFreeTrial('premium');
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateTrialProgress = () => {
    if (!isTrialActive || !subscription?.trial_ends_at) return 0;
    
    const trialDuration = 7; // 7 dias de teste
    const progress = ((trialDuration - daysRemaining) / trialDuration) * 100;
    return Math.min(Math.max(progress, 0), 100); // Limita entre 0 e 100
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Planos e Assinatura</h2>
        <p className="text-sm text-gray-500">
          Gerencie seu plano e veja detalhes da sua assinatura
        </p>
      </div>
      
      {hasSubscription ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                {isPremium ? 'Plano Premium' : 'Plano Básico'}
                {isTrialActive && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800">Período de Teste</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isTrialActive 
                  ? 'Você está utilizando o período de teste do plano Premium' 
                  : isPremium 
                    ? 'Você possui acesso a todas as funcionalidades premium' 
                    : 'Plano com recursos básicos'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isTrialActive && daysRemaining > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Período de teste: {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(calculateTrialProgress())}%
                    </span>
                  </div>
                  <Progress value={calculateTrialProgress()} className="h-2" />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscription?.starts_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Início</p>
                    <p className="text-base flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(subscription.starts_at)}
                    </p>
                  </div>
                )}
                
                {(subscription?.ends_at || subscription?.trial_ends_at) && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {isTrialActive ? 'Fim do Período de Teste' : 'Data de Vencimento'}
                    </p>
                    <p className="text-base flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(isTrialActive ? subscription?.trial_ends_at : subscription?.ends_at)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Opções de Planos Premium</CardTitle>
              <CardDescription>
                Escolha o plano que melhor se adapta às necessidades da sua oficina
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-blue-200 hover:border-blue-500 transition-all">
                  <CardHeader>
                    <CardTitle className="text-blue-600">Premium Mensal</CardTitle>
                    <CardDescription>
                      <span className="text-lg font-bold">R$ 99,90</span>/mês
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Acesso a todas as funcionalidades</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Suporte prioritário</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Sem limite de usuários</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={() => window.open('https://pay.kiwify.com.br/8gVUJfE')}
                      className="w-full"
                    >
                      Assinar Plano Mensal
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-yellow-200 hover:border-yellow-500 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-yellow-600">Premium Anual</CardTitle>
                      <Badge className="bg-yellow-100 text-yellow-800">Economia de 20%</Badge>
                    </div>
                    <CardDescription>
                      <span className="text-lg font-bold">R$ 959,00</span>/ano
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Acesso a todas as funcionalidades</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Suporte prioritário</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Sem limite de usuários</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>Economia de 2 meses por ano</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={() => window.open('https://pay.kiwify.com.br/8gVUJfE')}
                      className="w-full"
                      variant="secondary"
                    >
                      Assinar Plano Anual
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Experimente o Plano Premium</CardTitle>
            <CardDescription>
              Teste gratuitamente por 7 dias todas as funcionalidades do plano Premium
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">O que está incluso:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Acesso a todas as funcionalidades</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Suporte prioritário</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Sem limite de usuários</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <Button 
                  onClick={handleStartTrial}
                  className="w-full"
                  size="lg"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Iniciar Teste Gratuito de 7 Dias
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlanSection;