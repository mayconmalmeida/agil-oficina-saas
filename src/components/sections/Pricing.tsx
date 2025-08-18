
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Premium Mensal",
      monthlyPrice: "197",
      yearlyPrice: "1970",
      period: billingCycle === 'monthly' ? "/mês" : "/ano",
      description: "Gestão completa para sua oficina",
      popular: false,
      features: [
        "Gestão completa de clientes",
        "Orçamentos digitais profissionais",
        "IA para diagnóstico avançado",
        "Agendamentos inteligentes",
        "Controle de estoque completo",
        "Relatórios avançados",
        "Marketing automático",
        "Suporte prioritário",
        "Integração contábil",
        "App mobile",
        "Backup automático"
      ]
    },
    {
      name: "Premium Anual",
      monthlyPrice: "197",
      yearlyPrice: "1970",
      period: billingCycle === 'yearly' ? "/ano" : "/mês",
      description: "Economia de 17% no plano anual",
      popular: true,
      features: [
        "Tudo do Premium Mensal",
        "2 meses grátis no plano anual",
        "Desconto especial de 17%",
        "Suporte prioritário garantido",
        "Treinamento personalizado",
        "Migração gratuita de dados",
        "Customizações exclusivas"
      ]
    }
  ];

  const getCurrentPrice = (plan: typeof plans[0]) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  return (
    <section id="precos" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Plano <span className="text-blue-600">Premium</span> Completo
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Solução completa para gestão da sua oficina. Escolha entre mensal ou anual e economize.
          </p>

          {/* Toggle de Billing Cycle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Anual
                <span className="ml-1 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                  -17%
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-2 border-blue-500 shadow-xl scale-105' 
                  : 'border border-gray-200 shadow-lg hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2">
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-semibold">MAIS ECONÔMICO</span>
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'} pb-4`}>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600 text-base sm:text-lg">
                  {plan.description}
                </CardDescription>
                <div className="flex items-center justify-center space-x-1 mt-4">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                    R$ {getCurrentPrice(plan)}
                  </span>
                  <span className="text-lg text-gray-600">{plan.period}</span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="text-sm text-green-600 font-medium mt-2">
                    Economize 17% no plano anual
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="px-6 pb-8">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full py-3 text-base font-semibold transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                  size="lg"
                >
                  <Link to="/workshop-registration">
                    Começar Teste Grátis
                  </Link>
                </Button>
                
                <p className="text-center text-xs sm:text-sm text-gray-500 mt-3">
                  7 dias grátis • Sem cartão de crédito
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 lg:mt-16">
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            Todas as assinaturas incluem suporte técnico e atualizações gratuitas
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm sm:text-base text-gray-700">30 dias de garantia</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm sm:text-base text-gray-700">Cancele quando quiser</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm sm:text-base text-gray-700">Migração gratuita</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
