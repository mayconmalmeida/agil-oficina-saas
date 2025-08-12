import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import SuporteIA from '@/components/ai/SuporteIA';
import { useIsMobile } from '@/hooks/use-mobile';

const IASuporteInteligentePage: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`space-y-6 ${isMobile ? 'px-2' : ''}`}>
      <div className="flex items-center space-x-2">
        <Bot className={`text-blue-600 ${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
        <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          IA para Suporte Inteligente
        </h1>
      </div>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Assistente de Suporte</CardTitle>
          </CardHeader>
          <CardContent>
            <SuporteIA />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Como usar o Suporte Inteligente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Como usar</h4>
              <p className="text-blue-700 text-sm">
                Faça perguntas específicas sobre o sistema, funcionalidades ou dúvidas operacionais do OficinaCloud.
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">🎯 Exemplos de perguntas</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Como cadastrar um novo cliente?</li>
                <li>• Como gerar um orçamento?</li>
                <li>• Como configurar relatórios?</li>
                <li>• Como fazer backup dos dados?</li>
                <li>• Como adicionar produtos ao estoque?</li>
              </ul>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">⚡ Disponibilidade</h4>
              <p className="text-orange-700 text-sm">
                A IA está disponível 24/7 para ajudar com suas dúvidas sobre o sistema OficinaCloud.
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">🤖 Inteligência Avançada</h4>
              <p className="text-purple-700 text-sm">
                Nosso assistente conhece todas as funcionalidades do sistema e pode orientar sobre processos completos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IASuporteInteligentePage;