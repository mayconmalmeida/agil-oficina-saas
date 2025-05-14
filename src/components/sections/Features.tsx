
import React from 'react';
import { 
  FileText, 
  Users, 
  ShoppingCart, 
  Car, 
  FileDigit, 
  BarChart3, 
  Megaphone, 
  Clock 
} from 'lucide-react';

const features = [
  {
    icon: <FileText className="h-10 w-10 text-oficina" />,
    title: "Orçamentos Rápidos",
    description: "Crie orçamentos profissionais em minutos com uma interface intuitiva e prática."
  },
  {
    icon: <Users className="h-10 w-10 text-oficina" />,
    title: "Cadastro de Clientes",
    description: "Mantenha uma base completa de clientes com histórico e preferências."
  },
  {
    icon: <ShoppingCart className="h-10 w-10 text-oficina" />,
    title: "Controle de Estoque",
    description: "Gerencie seu inventário de peças e produtos com alertas de níveis baixos."
  },
  {
    icon: <Car className="h-10 w-10 text-oficina" />,
    title: "Gestão de Veículos",
    description: "Cadastre e acompanhe o histórico de cada veículo que passa pela sua oficina."
  },
  {
    icon: <FileDigit className="h-10 w-10 text-oficina" />,
    title: "XML para Contabilidade",
    description: "Exporte dados para seu sistema contábil com um clique."
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-oficina" />,
    title: "Relatórios Gerenciais",
    description: "Analise o desempenho da sua oficina com relatórios detalhados."
  },
  {
    icon: <Megaphone className="h-10 w-10 text-oficina" />,
    title: "Campanhas de Marketing",
    description: "Envie promoções e comunicados diretamente aos seus clientes."
  },
  {
    icon: <Clock className="h-10 w-10 text-oficina" />,
    title: "Agendamento",
    description: "Organize sua agenda de serviços para maximizar a produtividade."
  }
];

export default function Features() {
  return (
    <section id="funcionalidades" className="py-20 bg-oficina-lightgray">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-oficina-dark mb-4">
            Funcionalidades Completas para sua Oficina
          </h2>
          <p className="text-lg text-oficina-gray max-w-2xl mx-auto">
            O OficinaÁgil reúne tudo o que você precisa para gerenciar sua oficina com praticidade e eficiência.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="rounded-full bg-blue-50 p-4 inline-flex mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-oficina-dark mb-2">
                {feature.title}
              </h3>
              <p className="text-oficina-gray">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
