
import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startFreeTrial, subscriptionStatus } = useSubscription();
  const { plans, loading, error, getPlansByType } = usePlanConfigurations();
  const { createCheckoutSession, loading: stripeLoading } = useStripeSubscription();

  console.log('Pricing component - Plans loaded:', plans);
  console.log('Pricing component - Loading:', loading);
  console.log('Pricing component - Error:', error);

  const essencialPlans = getPlansByType('essencial');
  const premiumPlans = getPlansByType('premium');

  console.log('Essencial plans:', essencialPlans);
  console.log('Premium plans:', premiumPlans);

  const handleFreeTrial = async (planType: 'essencial' | 'premium') => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate(`/register?plan=${planType}`);
      return;
    }

    if (subscriptionStatus.canAccessFeatures) {
      toast({
        title: "Você já tem acesso!",
        description: "Você já possui uma assinatura ativa ou teste em andamento."
      });
      navigate('/dashboard');
      return;
    }

    const result = await startFreeTrial(planType);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handlePaidPlan = async (planType: 'essencial' | 'premium', billingCycle: 'mensal' | 'anual') => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate(`/register?plan=${planType}`);
      return;
    }

    await createCheckoutSession(planType, billingCycle);
  };

  // Fallback para planos quando não conseguimos carregar do banco ou está carregando
  const fallbackTiers = [
    {
      name: 'Essencial',
      id: 'essencial',
      price: 89.90,
      yearlyPrice: 899.00,
      description: 'Ideal para oficinas de pequeno porte.',
      features: [
        'Cadastro de clientes ilimitado',
        'Gestão de orçamentos',
        'Controle de serviços',
        'Relatórios básicos',
        'Suporte via e-mail'
      ],
      most_popular: false
    },
    {
      name: 'Premium',
      id: 'premium',
      price: 179.90,
      yearlyPrice: 1799.00,
      description: 'Recomendado para oficinas em crescimento.',
      features: [
        'Todos os recursos do plano Essencial',
        'Módulo de estoque integrado',
        'Agendamento de serviços',
        'Relatórios avançados',
        'Suporte prioritário',
        'Backup automático'
      ],
      most_popular: true
    },
  ];

  // Use dados do banco se disponíveis, senão use fallback
  const tiers = !loading && plans.length > 0 ? [
    {
      name: 'Essencial',
      id: 'essencial',
      price: essencialPlans.find(p => p.billing_cycle === 'mensal')?.price || 89.90,
      yearlyPrice: essencialPlans.find(p => p.billing_cycle === 'anual')?.price || 899.00,
      description: 'Ideal para oficinas de pequeno porte.',
      features: essencialPlans.find(p => p.billing_cycle === 'mensal')?.features || fallbackTiers[0].features,
      most_popular: false
    },
    {
      name: 'Premium',
      id: 'premium',
      price: premiumPlans.find(p => p.billing_cycle === 'mensal')?.price || 179.90,
      yearlyPrice: premiumPlans.find(p => p.billing_cycle === 'anual')?.price || 1799.00,
      description: 'Recomendado para oficinas em crescimento.',
      features: premiumPlans.find(p => p.billing_cycle === 'mensal')?.features || fallbackTiers[1].features,
      most_popular: true
    },
  ] : fallbackTiers;

  console.log('Final tiers to render:', tiers);

  return (
    <div id="precos" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Planos Simples e Acessíveis
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para sua oficina e aproveite 7 dias de teste grátis. Sem compromisso.
          </p>
          {loading && (
            <p className="mt-2 text-sm text-blue-600">
              Carregando configurações dos planos...
            </p>
          )}
          {error && (
            <p className="mt-2 text-sm text-orange-600">
              Usando configuração padrão de planos
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                tier.most_popular ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {tier.most_popular && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                  Mais Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    R$ {tier.price.toFixed(2)}
                  </span>
                  <span className="ml-1 text-xl font-semibold text-gray-500">/mês</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  ou R$ {tier.yearlyPrice.toFixed(2)}/ano (2 meses grátis)
                </p>
                <p className="mt-2 text-sm text-gray-500">{tier.description}</p>
                
                <Button
                  onClick={() => handleFreeTrial(tier.id as 'essencial' | 'premium')}
                  className={`mt-6 w-full py-3 px-6 text-center font-medium rounded-md ${
                    tier.most_popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Iniciar teste grátis (7 dias)
                </Button>
                
                <div className="mt-3 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handlePaidPlan(tier.id as 'essencial' | 'premium', 'mensal')}
                    disabled={stripeLoading}
                  >
                    {stripeLoading ? 'Processando...' : `Assinar Mensal - R$ ${tier.price.toFixed(2)}`}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handlePaidPlan(tier.id as 'essencial' | 'premium', 'anual')}
                    disabled={stripeLoading}
                  >
                    {stripeLoading ? 'Processando...' : `Assinar Anual - R$ ${tier.yearlyPrice.toFixed(2)}`}
                  </Button>
                </div>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
                  O que está incluído
                </h4>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-500">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-gray-600">
            Precisa de um plano personalizado para sua rede de oficinas?{' '}
            <a href="#contato" className="text-blue-600 font-medium hover:underline">
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
