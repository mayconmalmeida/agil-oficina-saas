
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, Crown, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  starts_at: string;
  ends_at?: string;
  trial_ends_at?: string;
}

const AssinaturaPage: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setSubscription(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar assinatura",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expirada</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inativa</Badge>;
    }
  };

  const getPlanName = (planType?: string) => {
    if (!planType) return 'Nenhum plano';
    
    if (planType.includes('premium')) return 'Premium';
    if (planType.includes('essencial')) return 'Essencial';
    return planType;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return diff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando assinatura...</p>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(subscription?.ends_at || subscription?.trial_ends_at);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <CreditCard className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Assinatura</h1>
      </div>
      
      {/* Status da Assinatura Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status da Assinatura</span>
            {subscription && getStatusBadge(subscription.status)}
          </CardTitle>
          <CardDescription>
            Informações sobre sua assinatura atual do OficinaGO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Plano Atual</p>
                  <p className="text-lg font-semibold flex items-center">
                    {getPlanName(subscription.plan_type).includes('Premium') && (
                      <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                    )}
                    {getPlanName(subscription.plan_type)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Início</p>
                  <p className="text-lg">{formatDate(subscription.starts_at)}</p>
                </div>
                
                {subscription.ends_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Vencimento</p>
                    <p className={`text-lg ${isExpiringSoon ? 'text-red-600 font-semibold' : ''}`}>
                      {formatDate(subscription.ends_at)}
                      {daysRemaining !== null && (
                        <span className="text-sm ml-2">
                          ({daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Expirado'})
                        </span>
                      )}
                    </p>
                  </div>
                )}
                
                {subscription.trial_ends_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Trial termina em</p>
                    <p className={`text-lg ${isExpiringSoon ? 'text-red-600 font-semibold' : ''}`}>
                      {formatDate(subscription.trial_ends_at)}
                      {daysRemaining !== null && (
                        <span className="text-sm ml-2">
                          ({daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Expirado'})
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
              
              {isExpiringSoon && (
                <div className="flex items-center space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <p className="text-yellow-800">
                    Sua assinatura expira em breve! Renove para continuar usando todos os recursos.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Nenhuma assinatura ativa</p>
              <p className="text-gray-600 mb-4">
                Você não possui uma assinatura ativa no momento.
              </p>
              <Button>
                <Crown className="h-4 w-4 mr-2" />
                Escolher Plano
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planos Disponíveis */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              Plano Essencial
            </CardTitle>
            <CardDescription>
              Recursos básicos para pequenas oficinas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <p className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Cadastro de clientes
              </p>
              <p className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Criação de orçamentos
              </p>
              <p className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Controle de serviços
              </p>
              <p className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Agendamentos básicos
              </p>
            </div>
            <Button variant="outline" className="w-full">
              R$ 29,90/mês
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="h-5 w-5 text-yellow-500 mr-2" />
              Plano Premium
            </CardTitle>
            <CardDescription>
              Recursos avançados para oficinas completas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <p className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Todos os recursos do Essencial
              </p>
              <p className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                IA Diagnóstico avançado
              </p>
              <p className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Relatórios detalhados
              </p>
              <p className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Controle de estoque
              </p>
              <p className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Campanhas de marketing
              </p>
            </div>
            <Button className="w-full">
              R$ 59,90/mês
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Histórico de Pagamentos
          </CardTitle>
          <CardDescription>
            Histórico das suas transações e pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhum histórico de pagamento encontrado.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssinaturaPage;
