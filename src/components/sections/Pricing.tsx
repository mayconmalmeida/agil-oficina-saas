
import React from 'react';
import { Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const tiers = [
  {
    name: 'Essencial',
    id: 'essencial',
    price: 'R$ 89,90',
    yearlyPrice: 'R$ 899,00',
    description: 'Ideal para oficinas de pequeno porte.',
    features: [
      'Cadastro de clientes ilimitado',
      'Gestão de orçamentos',
      'Controle de serviços',
      'Relatórios básicos',
      'Suporte via e-mail',
    ],
    most_popular: false,
    caktoLinks: {
      monthly: 'https://pay.cakto.com.br/essencial-mensal',
      yearly: 'https://pay.cakto.com.br/essencial-anual'
    }
  },
  {
    name: 'Premium',
    id: 'premium',
    price: 'R$ 179,90',
    yearlyPrice: 'R$ 1.799,00',
    description: 'Recomendado para oficinas em crescimento.',
    features: [
      'Todos os recursos do plano Essencial',
      'Módulo de estoque integrado',
      'Agendamento de serviços',
      'Relatórios avançados',
      'Suporte prioritário',
      'Backup automático',
    ],
    most_popular: true,
    caktoLinks: {
      monthly: 'https://pay.cakto.com.br/premium-mensal',
      yearly: 'https://pay.cakto.com.br/premium-anual'
    }
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startFreeTrial, subscriptionStatus } = useSubscription();

  const handleFreeTrial = async (planType: 'essencial' | 'premium') => {
    // Verificar se usuário está logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Redirecionar para registro/login com parâmetro do plano
      navigate(`/register?plan=${planType}`);
      return;
    }

    // Se já tem assinatura ativa, redirecionar para dashboard
    if (subscriptionStatus.canAccessFeatures) {
      toast({
        title: "Você já tem acesso!",
        description: "Você já possui uma assinatura ativa ou teste em andamento."
      });
      navigate('/dashboard');
      return;
    }

    // Iniciar teste gratuito
    const result = await startFreeTrial(planType);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handlePaidPlan = (caktoUrl: string) => {
    window.open(caktoUrl, '_blank');
  };

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
                    {tier.price}
                  </span>
                  <span className="ml-1 text-xl font-semibold text-gray-500">/mês</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  ou {tier.yearlyPrice}/ano (2 meses grátis)
                </p>
                <p className="mt-2 text-sm text-gray-500">{tier.description}</p>
                
                {/* Botão de teste gratuito */}
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
                
                {/* Botões de assinatura paga */}
                <div className="mt-3 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handlePaidPlan(tier.caktoLinks.monthly)}
                  >
                    Assinar Mensal - {tier.price}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handlePaidPlan(tier.caktoLinks.yearly)}
                  >
                    Assinar Anual - {tier.yearlyPrice}
                  </Button>
                </div>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
                  O que está incluído
                </h4>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
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
