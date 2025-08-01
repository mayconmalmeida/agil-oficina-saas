
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, Info, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import PlanStatusCard from '@/components/subscription/PlanStatusCard';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PlanConfig {
  name: string;
  description: string;
  icon: React.ReactNode;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
  buttonVariant: "default" | "outline" | "destructive";
}

const SubscriptionPage = () => {
  const { user, plan, planActive } = useAuth();
  const { hasPermission, getPlanFeatures } = usePermissions();
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
      name: 'Essencial',
      description: 'Recursos fundamentais para sua oficina',
      icon: <Star className="h-6 w-6" />,
      features: [
        { name: 'Gestão de clientes', included: true },
        { name: 'Orçamentos digitais', included: true },
        { name: 'Controle de serviços', included: true },
        { name: 'Relatórios básicos', included: true },
        { name: 'Suporte por email', included: true },
        { name: 'Backup automático', included: true },
        { name: 'IA para diagnóstico', included: false },
        { name: 'Agendamentos inteligentes', included: false },
        { name: 'Relatórios avançados', included: false },
        { name: 'Marketing automático', included: false },
        { name: 'Integração contábil', included: false },
      ],
      buttonText: plan === 'Essencial' && planActive ? 'Plano Atual' : 'Solicitar Plano',
      buttonVariant: plan === 'Essencial' && planActive ? 'outline' : 'default',
    },
    {
      name: 'Premium',
      description: 'Todos os recursos para máxima produtividade',
      icon: <Crown className="h-6 w-6" />,
      popular: true,
      features: [
        { name: 'Todos os recursos do Essencial', included: true },
        { name: 'IA para diagnóstico', included: true },
        { name: 'Agendamentos inteligentes', included: true },
        { name: 'Relatórios avançados', included: true },
        { name: 'Marketing automático', included: true },
        { name: 'Suporte prioritário', included: true },
        { name: 'Integração contábil', included: true },
      ],
      buttonText: plan === 'Premium' && planActive ? 'Plano Atual' : 'Solicitar Plano',
      buttonVariant: plan === 'Premium' && planActive ? 'outline' : 'default',
    },
  ];

  // Função para solicitar plano
  const requestPlan = async (planType: string) => {
    toast.info('Para ativar ou alterar seu plano, entre em contato com o administrador do sistema.');
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

        <PlanStatusCard 
          subscriptionData={subscriptionData} 
          plan={plan} 
          planActive={planActive} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
                  disabled={planConfig.name === plan && planActive}
                  onClick={() => requestPlan(planConfig.name.toLowerCase())}
                >
                  {planConfig.buttonText}
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
                      <th className="text-center py-3 px-4 font-medium">Essencial</th>
                      <th className="text-center py-3 px-4 font-medium">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { name: 'Gestão de clientes', essencial: true, premium: true },
                      { name: 'Orçamentos digitais', essencial: true, premium: true },
                      { name: 'Controle de serviços', essencial: true, premium: true },
                      { name: 'Relatórios básicos', essencial: true, premium: true },
                      { name: 'Suporte por email', essencial: true, premium: true },
                      { name: 'Backup automático', essencial: true, premium: true },
                      { name: 'IA para diagnóstico', essencial: false, premium: true },
                      { name: 'Agendamentos inteligentes', essencial: false, premium: true },
                      { name: 'Relatórios avançados', essencial: false, premium: true },
                      { name: 'Marketing automático', essencial: false, premium: true },
                      { name: 'Suporte prioritário', essencial: false, premium: true },
                      { name: 'Integração contábil', essencial: false, premium: true },
                    ].map((feature, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4 font-medium">{feature.name}</td>
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

        {/* Informações de Contato */}
        <div className="mt-12 text-center">
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Como ativar seu plano?
              </h3>
              <p className="text-gray-600 mb-4">
                Para ativar ou alterar seu plano, entre em contato com o administrador do sistema.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Enviar Email
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Entrar em Contato
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
