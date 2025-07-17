
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, AlertCircle, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PlanConfig {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
  buttonVariant: "default" | "outline" | "destructive";
}

const SubscriptionPage = () => {
  const { user, plan, planActive } = useAuth();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  // Buscar dados da assinatura atual
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar assinatura:', error);
          return;
        }

        setSubscriptionData(data);
      } catch (error) {
        console.error('Erro geral ao buscar assinatura:', error);
      }
    };

    fetchSubscriptionData();
  }, [user?.id]);

  // Configuração dos planos
  const plans: PlanConfig[] = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '7 dias de trial',
      description: 'Experimente todos os recursos Premium por 7 dias',
      icon: <Zap className="h-6 w-6" />,
      features: [
        { name: 'Todos os recursos Premium', included: true },
        { name: 'IA Diagnóstico', included: true },
        { name: 'Relatórios Avançados', included: true },
        { name: 'Agendamento Avançado', included: true },
        { name: 'Marketing Integrado', included: true },
        { name: 'Backup Automático', included: true },
        { name: 'Suporte Prioritário', included: true },
      ],
      buttonText: subscriptionData?.status === 'trialing' ? 'Trial Ativo' : 'Iniciar Trial',
      buttonVariant: subscriptionData?.status === 'trialing' ? 'outline' : 'default',
    },
    {
      name: 'Essencial',
      price: 'R$ 29,90',
      period: 'por mês',
      description: 'Recursos fundamentais para sua oficina',
      icon: <Star className="h-6 w-6" />,
      features: [
        { name: 'Gestão de Clientes', included: true },
        { name: 'Orçamentos', included: true },
        { name: 'Produtos e Serviços', included: true },
        { name: 'Gestão de Veículos', included: true },
        { name: 'Relatórios Básicos', included: true },
        { name: 'Suporte por E-mail', included: true },
        { name: 'IA Diagnóstico', included: false },
        { name: 'Relatórios Avançados', included: false },
        { name: 'Agendamento Avançado', included: false },
        { name: 'Marketing Integrado', included: false },
        { name: 'Backup Automático', included: false },
      ],
      buttonText: plan === 'Essencial' && planActive ? 'Plano Atual' : 'Assinar Essencial',
      buttonVariant: plan === 'Essencial' && planActive ? 'outline' : 'default',
    },
    {
      name: 'Premium',
      price: 'R$ 49,90',
      period: 'por mês',
      description: 'Todos os recursos para máxima produtividade',
      icon: <Crown className="h-6 w-6" />,
      popular: true,
      features: [
        { name: 'Tudo do Essencial', included: true },
        { name: 'IA Diagnóstico', included: true },
        { name: 'Relatórios Avançados', included: true },
        { name: 'Agendamento Avançado', included: true },
        { name: 'Marketing Integrado', included: true },
        { name: 'Backup Automático', included: true },
        { name: 'Suporte Prioritário', included: true },
        { name: 'Integração Contábil', included: true },
      ],
      buttonText: plan === 'Premium' && planActive ? 'Plano Atual' : 'Assinar Premium',
      buttonVariant: plan === 'Premium' && planActive ? 'outline' : 'default',
    },
  ];

  // Função para iniciar trial Premium
  const startFreeTrial = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('start_free_trial', {
        selected_plan_type: 'premium'
      });

      if (error) {
        toast.error('Erro ao iniciar trial: ' + error.message);
        return;
      }

      if (data.success) {
        toast.success('Trial Premium iniciado com sucesso! Aproveite 7 dias com todos os recursos.');
        // Recarregar dados
        window.location.reload();
      } else {
        toast.error(data.error || 'Erro ao iniciar trial');
      }
    } catch (error) {
      console.error('Erro ao iniciar trial:', error);
      toast.error('Erro interno ao iniciar trial');
    } finally {
      setLoading(false);
    }
  };

  // Função para assinar plano
  const subscribeToPlan = async (planType: string) => {
    toast.info('Funcionalidade de pagamento será implementada em breve');
  };

  // Função para renderizar o status da assinatura atual
  const renderCurrentSubscriptionStatus = () => {
    if (!subscriptionData) {
      return (
        <Card className="mb-6 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-gray-500" />
              <div>
                <h3 className="font-medium">Nenhuma assinatura ativa</h3>
                <p className="text-sm text-gray-600">
                  Inicie um trial gratuito ou assine um plano para acessar os recursos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const now = new Date();
    const isTrialing = subscriptionData.status === 'trialing';
    const isActive = subscriptionData.status === 'active';
    
    let statusText = '';
    let statusColor = '';
    let expiryDate = null;

    if (isTrialing && subscriptionData.trial_ends_at) {
      expiryDate = new Date(subscriptionData.trial_ends_at);
      const isExpired = expiryDate <= now;
      statusText = isExpired ? 'Trial Expirado' : 'Trial Ativo';
      statusColor = isExpired ? 'text-red-600' : 'text-blue-600';
    } else if (isActive) {
      if (subscriptionData.ends_at) {
        expiryDate = new Date(subscriptionData.ends_at);
        const isExpired = expiryDate <= now;
        statusText = isExpired ? 'Plano Expirado' : 'Plano Ativo';
        statusColor = isExpired ? 'text-red-600' : 'text-green-600';
      } else {
        statusText = 'Plano Ativo';
        statusColor = 'text-green-600';
      }
    }

    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  Assinatura Atual
                  <Badge variant="outline" className={statusColor}>
                    {statusText}
                  </Badge>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Plano: <span className="font-medium">{plan}</span>
                  {expiryDate && (
                    <>
                      <br />
                      {isTrialing ? 'Trial expira' : 'Renova'} em:{' '}
                      <span className="font-medium">
                        {format(expiryDate, 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                      {' '}({formatDistanceToNow(expiryDate, { locale: ptBR, addSuffix: true })})
                    </>
                  )}
                </p>
              </div>
            </div>
            {subscriptionData.is_manual && (
              <Badge variant="secondary" className="text-xs">
                Manual
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Planos de Assinatura
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para sua oficina e tenha acesso a todas as ferramentas 
            para gerenciar seu negócio com eficiência.
          </p>
        </div>

        {renderCurrentSubscriptionStatus()}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((planConfig) => (
            <Card 
              key={planConfig.name} 
              className={`relative ${
                planConfig.popular 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {planConfig.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full ${
                    planConfig.popular 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {planConfig.icon}
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">
                  {planConfig.name}
                </CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  {planConfig.price}
                  <span className="text-base font-normal text-gray-600 ml-1">
                    {planConfig.period}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {planConfig.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {planConfig.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check 
                        className={`h-4 w-4 ${
                          feature.included 
                            ? 'text-green-600' 
                            : 'text-gray-300'
                        }`} 
                      />
                      <span className={`text-sm ${
                        feature.included 
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                      }`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full mt-6"
                  variant={planConfig.buttonVariant}
                  disabled={
                    loading || 
                    (planConfig.name === plan && planActive) ||
                    (planConfig.name === 'Free' && subscriptionData?.status === 'trialing')
                  }
                  onClick={() => {
                    if (planConfig.name === 'Free') {
                      startFreeTrial();
                    } else {
                      subscribeToPlan(planConfig.name.toLowerCase());
                    }
                  }}
                >
                  {loading ? 'Processando...' : planConfig.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recursos Detalhados */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Compare os Recursos
          </h2>
          
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Recursos</th>
                      <th className="text-center py-3 px-4 font-medium">Free (Trial)</th>
                      <th className="text-center py-3 px-4 font-medium">Essencial</th>
                      <th className="text-center py-3 px-4 font-medium">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { name: 'Gestão de Clientes', free: true, essencial: true, premium: true },
                      { name: 'Orçamentos', free: true, essencial: true, premium: true },
                      { name: 'Produtos e Serviços', free: true, essencial: true, premium: true },
                      { name: 'Gestão de Veículos', free: true, essencial: true, premium: true },
                      { name: 'Relatórios Básicos', free: true, essencial: true, premium: true },
                      { name: 'IA Diagnóstico', free: true, essencial: false, premium: true },
                      { name: 'Relatórios Avançados', free: true, essencial: false, premium: true },
                      { name: 'Agendamento Avançado', free: true, essencial: false, premium: true },
                      { name: 'Marketing Integrado', free: true, essencial: false, premium: true },
                      { name: 'Backup Automático', free: true, essencial: false, premium: true },
                      { name: 'Integração Contábil', free: true, essencial: false, premium: true },
                      { name: 'Suporte Prioritário', free: true, essencial: false, premium: true },
                    ].map((feature, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4 font-medium">{feature.name}</td>
                        <td className="text-center py-3 px-4">
                          {feature.free ? (
                            <Check className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {feature.essencial ? (
                            <Check className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {feature.premium ? (
                            <Check className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ ou Informações Adicionais */}
        <div className="mt-12 text-center">
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Precisa de Ajuda?
              </h3>
              <p className="text-gray-600 mb-4">
                Entre em contato conosco para esclarecer dúvidas sobre os planos 
                ou solicitar uma demonstração personalizada.
              </p>
              <Button variant="outline">
                Falar com Suporte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
