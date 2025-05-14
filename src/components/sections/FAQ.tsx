
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "Como funciona o período de teste grátis?",
    answer: "Você terá acesso completo a todas as funcionalidades do OficinaÁgil durante 7 dias, sem qualquer compromisso. Após esse período, você pode optar por continuar usando o sistema mediante assinatura mensal ou cancelar sem custos."
  },
  {
    question: "Preciso instalar algum software no meu computador?",
    answer: "Não! O OficinaÁgil é um sistema totalmente web, então você só precisa de um navegador e conexão com a internet para utilizá-lo em qualquer dispositivo, seja computador, tablet ou celular."
  },
  {
    question: "Quantos usuários posso cadastrar?",
    answer: "Você pode cadastrar quantos usuários precisar, sendo que cada usuário adicional terá um custo de R$ 79,90 por mês. Cada colaborador da oficina pode ter seu próprio acesso com permissões específicas."
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Absolutamente! Utilizamos tecnologia de ponta para garantir a segurança dos seus dados. Todas as informações são armazenadas em servidores na nuvem com backups diários e criptografia avançada."
  },
  {
    question: "Como funciona o suporte técnico?",
    answer: "Oferecemos suporte técnico por e-mail e chat durante horário comercial. Nossa equipe está sempre pronta para ajudar com quaisquer dúvidas ou dificuldades que você possa ter."
  },
  {
    question: "Posso exportar meus dados para outros sistemas?",
    answer: "Sim, o OficinaÁgil permite exportar dados em diversos formatos, incluindo XML para contabilidade, PDF para orçamentos e planilhas para análises personalizadas."
  },
  {
    question: "Como é feito o pagamento?",
    answer: "O pagamento é feito mensalmente via cartão de crédito ou boleto bancário. Você receberá a nota fiscal referente ao serviço contratado."
  }
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-oficina-dark mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-oficina-gray max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o OficinaÁgil.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                <AccordionTrigger className="text-left font-medium text-oficina-dark py-4 hover:text-oficina">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-oficina-gray pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-oficina-gray mb-6">
            Ainda tem dúvidas? Entre em contato conosco!
          </p>
          <Button className="bg-oficina hover:bg-oficina-dark transition-colors">
            <a href="#contato">Fale Conosco</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
