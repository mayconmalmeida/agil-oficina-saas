
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Check, Crown, Calendar, AlertTriangle, ExternalLink, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';
import { CHECKOUT_PROVIDER, getCheckoutUrl } from '@/config/checkout';
import { useAuth } from '@/contexts/AuthContext';

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
  const { plans, loading: plansLoading } = usePlanConfigurations();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!user?.id) return;
      setLoadingTransactions(true);
      try {
        const { data, error } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setTransactions(data || []);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar pagamentos',
          description: error.message,
        });
      } finally {
        setLoadingTransactions(false);
      }
    };
    loadTransactions();
  }, [user?.id]);

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

  const formatPrice = (price: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(price);
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

  const handlePlanClick = (plan: any) => {
    try {
      console.log('handlePlanClick called with plan:', plan);

      // Prefer Asaas checkout if configured
      const checkoutUrl = getCheckoutUrl(
        plan.billing_cycle === 'anual' ? 'anual' : 'mensal',
        plan.affiliate_link,
        { userId: user?.id, email: user?.email }
      );

      if (checkoutUrl) {
        console.log('Opening checkout URL:', checkoutUrl, 'provider:', CHECKOUT_PROVIDER);
        window.open(checkoutUrl, '_blank');
      } else {
        console.log('No checkout URL available');
        toast({
          title: 'Em breve',
          description: 'Sistema de pagamento em desenvolvimento'
        });
      }
    } catch (error) {
      console.error('Error in handlePlanClick:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao processar o plano',
        variant: 'destructive'
      });
    }
  };

  const copyAffiliateLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Link de afiliado copiado para a área de transferência"
    });
  };

  const getPlansGroupedByType = () => {
    // Focar apenas nos planos Premium
    const premiumPlans = plans.filter(p => p.plan_type === 'premium');
    
    return { premiumPlans };
  };

  const isCurrentPlan = (planType: string, billingCycle: string) => {
    if (!subscription) return false;
    return subscription.plan_type === `${planType}_${billingCycle}`;
  };

  if (loading || plansLoading) {
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
  const { premiumPlans } = getPlansGroupedByType();

  // Calcular economia do plano anual
  const monthlyPlan = premiumPlans.find(p => p.billing_cycle === 'mensal');
  const annualPlan = premiumPlans.find(p => p.billing_cycle === 'anual');
  const annualSavings = monthlyPlan && annualPlan ? 
    (monthlyPlan.price * 12) - annualPlan.price : 0;
  const savingsPercentage = monthlyPlan && annualSavings > 0 ? 
    Math.round((annualSavings / (monthlyPlan.price * 12)) * 100) : 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <CreditCard className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Assinatura Premium</h1>
          <p className="text-gray-600">Gerencie sua assinatura e explore nossos planos Premium</p>
        </div>
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
              <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Nenhuma assinatura ativa</p>
              <p className="text-gray-600 mb-4">
                Assine o plano Premium e tenha acesso completo a todos os recursos do OficinaGO.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planos Premium */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <Crown className="h-8 w-8 text-yellow-500 mr-3" />
            Planos Premium
          </h2>
          <p className="text-gray-600 text-lg">
            Escolha o plano que melhor se adapta às suas necessidades
          </p>
          {savingsPercentage > 0 && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <span className="font-semibold">
                Economize {savingsPercentage}% no plano anual - R$ {annualSavings.toFixed(2)} de desconto!
              </span>
            </div>
          )}
        </div>
        
        {premiumPlans.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {premiumPlans.map((plan) => {
              const isAnnual = plan.billing_cycle === 'anual';
              const isCurrentUserPlan = isCurrentPlan('premium', plan.billing_cycle);
              const hasCheckoutLink = Boolean(
                getCheckoutUrl(isAnnual ? 'anual' : 'mensal', plan.affiliate_link, { userId: user?.id, email: user?.email })
              );
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    isAnnual 
                      ? 'border-2 border-green-500 shadow-lg transform hover:scale-105' 
                      : 'border-2 border-blue-500 hover:shadow-lg'
                  }`}
                >
                  {isAnnual && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-semibold">
                      Mais Popular
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="flex items-center justify-center mb-2">
                      <Crown className="h-6 w-6 text-yellow-500 mr-2" />
                      <span className="text-2xl">{plan.name}</span>
                    </CardTitle>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-900">
                          R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                        <span className="text-gray-600 ml-2">
                          /{plan.billing_cycle === 'mensal' ? 'mês' : 'ano'}
                        </span>
                      </div>
                      
                      {isAnnual && monthlyPlan && (
                        <div className="text-sm text-green-600 font-medium">
                          Equivale a R$ {(plan.price / 12).toFixed(2)}/mês
                        </div>
                      )}
                      
                      {isCurrentUserPlan && (
                        <Badge className="bg-green-100 text-green-800 mt-2">
                          Plano Atual
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Link de pagamento ocultado: direcionamento apenas via botão */}
                    
                    <Button 
                      className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                        isAnnual 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      variant={isCurrentUserPlan ? "secondary" : "default"}
                      onClick={() => handlePlanClick(plan)}
                      disabled={isCurrentUserPlan}
                    >
                      {isCurrentUserPlan ? (
                        'Plano Atual'
                      ) : hasCheckoutLink ? (
                        <>Assinar {plan.name} <ExternalLink className="h-4 w-4 ml-2" /></>
                      ) : (
                        'Em Breve'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Nenhum plano Premium disponível no momento.</p>
              <p className="text-sm text-gray-500 mt-2">Entre em contato conosco para mais informações.</p>
            </CardContent>
          </Card>
        )}
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
          {loadingTransactions ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Carregando histórico de pagamentos...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhum histórico de pagamento encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Método</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDate(tx.created_at)}</TableCell>
                    <TableCell>{formatPrice(tx.amount || 0, tx.currency || 'BRL')}</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell>{getPlanName(tx.plan_type)}</TableCell>
                    <TableCell className="uppercase">{tx.payment_method || 'asaas'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssinaturaPage;
