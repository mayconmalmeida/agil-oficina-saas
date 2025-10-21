import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Calendar } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';

export const SubscriptionSection: React.FC = () => {
  const { subscriptionStatus, loading, startFreeTrial } = useSubscription();
  
  if (loading) {
    return <div>Carregando informações do plano...</div>;
  }
  
  const { 
    hasSubscription, 
    subscription, 
    isTrialActive, 
    isPremium, 
    daysRemaining 
  } = subscriptionStatus;
  
  const handleStartTrial = async () => {
    await startFreeTrial('premium');
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Plano e Assinatura</h2>
        <p className="text-sm text-gray-500">
          Gerencie seu plano e veja detalhes da sua assinatura
        </p>
      </div>
      
      {hasSubscription ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="h-5 w-5 text-yellow-500 mr-2" />
              {isPremium ? 'Plano Premium' : 'Plano Básico'}
              {isTrialActive && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">Período de Teste</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysRemaining > 0 && (
              <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-md">
                <span>
                  {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'} 
                  {isTrialActive ? ' no seu período de teste' : ' na sua assinatura'}
                </span>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscription?.starts_at && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Início</p>
                  <p className="text-base">{formatDate(subscription.starts_at)}</p>
                </div>
              )}
              
              {(subscription?.ends_at || subscription?.trial_ends_at) && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {isTrialActive ? 'Fim do Período de Teste' : 'Data de Vencimento'}
                  </p>
                  <p className="text-base">
                    {formatDate(isTrialActive ? subscription?.trial_ends_at : subscription?.ends_at)}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={() => window.open('https://pay.kiwify.com.br/8gVUJfE')}
                className="w-full"
              >
                Assinar Plano Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Experimente o Plano Premium</CardTitle>
            <CardDescription>
              Teste gratuitamente por 7 dias todas as funcionalidades do plano Premium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleStartTrial}
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Iniciar Teste Gratuito de 7 Dias
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionSection;