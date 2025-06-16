
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import SuporteIA from '@/components/ai/SuporteIA';

const IASuporteInteligentePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Bot className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">IA para Suporte Inteligente</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>Conversas Hoje</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">23</div>
            <p className="text-gray-600">Perguntas respondidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>Tempo de Resposta</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">&lt; 3s</div>
            <p className="text-gray-600">Média de resposta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span>Taxa de Resolução</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">89%</div>
            <p className="text-gray-600">Problemas resolvidos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assistente de Suporte</CardTitle>
          </CardHeader>
          <CardContent>
            <SuporteIA />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dicas de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Como usar</h4>
              <p className="text-blue-700 text-sm">
                Faça perguntas específicas sobre o sistema, funcionalidades ou dúvidas operacionais.
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">🎯 Exemplos</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Como cadastrar um novo cliente?</li>
                <li>• Como gerar um orçamento?</li>
                <li>• Como configurar relatórios?</li>
              </ul>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">⚡ Disponibilidade</h4>
              <p className="text-orange-700 text-sm">
                A IA está disponível 24/7 para ajudar com suas dúvidas sobre o sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IASuporteInteligentePage;
