
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

export default function Pricing() {
  return (
    <section id="planos" className="py-20 bg-oficina-lightgray">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-oficina-dark mb-4">
            Planos Simples e Transparentes
          </h2>
          <p className="text-lg text-oficina-gray max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho da sua oficina e comece a usar imediatamente.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 lg:pr-8 lg:border-r lg:border-gray-200">
                  <div className="bg-blue-50 inline-block rounded-full px-3 py-1 text-sm font-medium text-oficina mb-6">
                    Plano Único
                  </div>
                  <h3 className="text-2xl font-bold text-oficina-dark mb-2">
                    OficinaÁgil Premium
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-oficina-dark">R$ 79,90</span>
                    <span className="text-oficina-gray">/mês por usuário</span>
                  </div>
                  <p className="text-oficina-gray mb-6">
                    Acesso completo a todas as funcionalidades do sistema para transformar a gestão da sua oficina.
                  </p>
                  <Button className="w-full bg-oficina-accent hover:bg-orange-600 text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all">
                    <a href="#teste-gratis" id="teste-gratis" className="w-full">Teste Grátis por 7 Dias</a>
                  </Button>
                  <p className="text-sm text-oficina-gray mt-4 text-center">
                    Sem compromisso. Cancele quando quiser.
                  </p>
                </div>

                <div className="lg:w-1/2 lg:pl-8 mt-8 lg:mt-0">
                  <h4 className="font-semibold text-lg mb-4 text-oficina-dark">
                    O que está incluído:
                  </h4>
                  <ul className="space-y-3">
                    {[
                      "Sistema de orçamentos completo",
                      "Cadastro de clientes ilimitado",
                      "Cadastro de produtos e peças",
                      "Controle de estoque",
                      "Gestão de veículos",
                      "Relatórios gerenciais",
                      "Exportação XML para contabilidade",
                      "Ferramenta de campanhas de marketing",
                      "Agendamento de serviços",
                      "Suporte técnico por e-mail e chat",
                      "Atualizações constantes"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-oficina-gray">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
