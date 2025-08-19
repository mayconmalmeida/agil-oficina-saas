
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import SuporteIA from '@/components/ai/SuporteIA';

const IASuportePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Suporte Inteligente</h1>
          <p className="text-gray-600">Assistente virtual especializado no sistema OficinaGO</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Chat com Suporte IA</CardTitle>
              <CardDescription>
                Tire suas dúvidas sobre o sistema, funcionalidades e como aproveitar melhor 
                todas as ferramentas disponíveis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SuporteIA />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dicas Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Como criar um orçamento?</p>
                <p className="text-sm text-blue-600">Acesse Menu > Orçamentos > Novo Orçamento</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Cadastrar produtos</p>
                <p className="text-sm text-green-600">Menu > Produtos > Adicionar Produto</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-800">Controlar estoque</p>
                <p className="text-sm text-purple-600">Menu > Estoque > Nova Movimentação</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IASuportePage;
