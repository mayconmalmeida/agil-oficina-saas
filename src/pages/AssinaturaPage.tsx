
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, Crown, Calendar, AlertTriangle, ExternalLink, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';

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
    if (plan.affiliate_link) {
      window.open(plan.affiliate_link, '_blank');
    } else {
      toast({
        title: "Em breve",
        description: "Sistema de pagamento em desenvolvimento"
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
    const essencialPlans = plans.filter(p => p.plan_type === 'essencial');
    const premiumPlans = plans.filter(p => p.plan_type === 'premium');
    
    return { essencialPlans, premiumPlans };
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
  const { essencialPlans, premiumPlans } = getPlansGroupedByType();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <CreditCard className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Assinatura</h1>
          <p className="text-gray-600">Gerencie sua assinatura e explore nossos planos</p>
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
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Nenhuma assinatura ativa</p>
              <p className="text-gray-600 mb-4">
                Você não possui uma assinatura ativa no momento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planos Disponíveis */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Planos Disponíveis</h2>
        
        {/* Planos Essencial */}
        {essencialPlans.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              Plano Essencial
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {essencialPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{plan.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{plan.billing_cycle}</Badge>
                        {isCurrentPlan('essencial', plan.billing_cycle) && (
                          <Badge className="bg-green-100 text-green-800">Atual</Badge>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center justify-between">
                        <span>{formatPrice(plan.price)} por {plan.billing_cycle === 'mensal' ? 'mês' : 'ano'}</span>
                        <span className="text-xs text-gray-500">essencial - {plan.billing_cycle}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <p key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          {feature}
                        </p>
                      ))}
                    </div>
                    
                    {plan.affiliate_link && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Link de Afiliado:</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyAffiliateLink(plan.affiliate_link!)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">{plan.affiliate_link}</p>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      variant={isCurrentPlan('essencial', plan.billing_cycle) ? "secondary" : "outline"}
                      onClick={() => handlePlanClick(plan)}
                      disabled={isCurrentPlan('essencial', plan.billing_cycle)}
                    >
                      {isCurrentPlan('essencial', plan.billing_cycle) ? (
                        'Plano Atual'
                      ) : plan.affiliate_link ? (
                        <>
                          Assinar Agora <ExternalLink className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        'Em Breve'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Planos Premium */}
        {premiumPlans.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Crown className="h-5 w-5 text-yellow-500 mr-2" />
              Plano Premium
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {premiumPlans.map((plan) => (
                <Card key={plan.id} className="border-2 border-blue-500 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                        {plan.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{plan.billing_cycle}</Badge>
                        {isCurrentPlan('premium', plan.billing_cycle) && (
                          <Badge className="bg-green-100 text-green-800">Atual</Badge>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center justify-between">
                        <span>{formatPrice(plan.price)} por {plan.billing_cycle === 'mensal' ? 'mês' : 'ano'}</span>
                        <span className="text-xs text-gray-500">premium - {plan.billing_cycle}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <p key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          {feature}
                        </p>
                      ))}
                    </div>
                    
                    {plan.affiliate_link && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Link de Afiliado:</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyAffiliateLink(plan.affiliate_link!)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">{plan.affiliate_link}</p>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full"
                      variant={isCurrentPlan('premium', plan.billing_cycle) ? "secondary" : "default"}
                      onClick={() => handlePlanClick(plan)}
                      disabled={isCurrentPlan('premium', plan.billing_cycle)}
                    >
                      {isCurrentPlan('premium', plan.billing_cycle) ? (
                        'Plano Atual'
                      ) : plan.affiliate_link ? (
                        <>
                          Assinar Agora <ExternalLink className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        'Em Breve'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Fallback quando não há planos */}
        {essencialPlans.length === 0 && premiumPlans.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Nenhum plano disponível no momento.</p>
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
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhum histórico de pagamento encontrado.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssinaturaPage;
