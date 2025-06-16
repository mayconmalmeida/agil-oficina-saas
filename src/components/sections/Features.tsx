
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
    icon: <FileText className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-oficina-accent" />,
    title: "Orçamentos Profissionais",
    description: "Crie orçamentos detalhados e personalizados em menos de 2 minutos."
  },
  {
    icon: <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-oficina-accent" />,
    title: "Gestão de Clientes",
    description: "Cadastre, segmente e acompanhe o histórico completo de cada cliente."
  },
  {
    icon: <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-oficina-accent" />,
    title: "Controle de Estoque",
    description: "Monitore seu inventário em tempo real com alertas automáticos."
  },
  {
    icon: <Car className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-oficina-accent" />,
    title: "Histórico de Veículos",
    description: "Registro completo de serviços e peças para cada veículo."
  },
  {
    icon: <FileDigit className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-oficina-accent" />,
    title: "Integração Contábil",
    description: "Emissão de notas fiscais e exportação para sistemas contábeis."
  },
  {
    icon: <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-oficina-accent" />,
    title: "Relatórios Detalhados",
    description: "Visualize indicadores de performance para tomar melhores decisões."
  },
  {
    icon: <Megaphone className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-oficina-accent" />,
    title: "Marketing Integrado",
    description: "Envie lembretes e promoções automaticamente para seus clientes."
  },
  {
    icon: <Clock className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-oficina-accent" />,
    title: "Agendamento Online",
    description: "Calendário integrado para gerenciar sua agenda de serviços."
  }
];

export default function Features() {
  return (
    <section id="funcionalidades" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-poppins text-oficina mb-4">
            Todas as <span className="text-gradient">ferramentas</span> que sua oficina precisa
          </h2>
          <p className="text-base sm:text-lg text-oficina-gray">
            O OficinaÁgil reúne tudo o que você precisa para gerenciar sua oficina com eficiência e profissionalismo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-6 sm:p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100 group"
            >
              <div className="rounded-xl bg-oficina/5 p-3 sm:p-4 inline-flex mb-4 sm:mb-6 group-hover:bg-oficina/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-oficina mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-oficina-gray">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
