
import React from 'react';
import { 
  CalendarCheck, 
  ClipboardEdit, 
  UserCheck, 
  ThumbsUp 
} from 'lucide-react';

const steps = [
  {
    icon: <CalendarCheck className="h-12 w-12 text-oficina" />,
    title: "Comece com teste grátis",
    description: "Experimente todas as funcionalidades do sistema por 7 dias sem compromisso."
  },
  {
    icon: <UserCheck className="h-12 w-12 text-oficina" />,
    title: "Cadastre seus dados",
    description: "Configure sua oficina, usuários, produtos e clientes para começar a operar."
  },
  {
    icon: <ClipboardEdit className="h-12 w-12 text-oficina" />,
    title: "Crie orçamentos",
    description: "Elabore orçamentos detalhados de forma rápida e profissional."
  },
  {
    icon: <ThumbsUp className="h-12 w-12 text-oficina" />,
    title: "Aumente seus resultados",
    description: "Gerencie melhor seu negócio e veja seus resultados crescerem."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-oficina-dark mb-4">
            Como Funciona
          </h2>
          <p className="text-lg text-oficina-gray max-w-2xl mx-auto">
            Começar a usar o OficinaÁgil é simples e rápido. Siga estes passos:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative"
            >
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="mx-auto flex items-center justify-center rounded-full bg-blue-50 h-20 w-20 mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-oficina-dark mb-2">
                  {step.title}
                </h3>
                <p className="text-oficina-gray">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6L15 12L9 18" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
