
import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Essencial',
    id: 'essencial',
    href: '/cadastro-oficina?plano=Essencial',
    price: 'R$ 69',
    description: 'Ideal para oficinas de pequeno porte.',
    features: [
      'Cadastro de clientes ilimitado',
      'Gestão de orçamentos',
      'Controle de serviços',
      'Relatórios básicos',
      'Suporte via e-mail',
    ],
    most_popular: false,
  },
  {
    name: 'Premium',
    id: 'premium',
    href: '/cadastro-oficina?plano=Premium',
    price: 'R$ 129',
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
  },
];

const Pricing = () => {
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
                <p className="mt-2 text-sm text-gray-500">{tier.description}</p>
                <Link
                  to={tier.href}
                  className={`mt-6 block w-full py-3 px-6 text-center font-medium rounded-md ${
                    tier.most_popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {tier.most_popular ? 'Começar agora' : 'Iniciar teste grátis'}
                </Link>
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
