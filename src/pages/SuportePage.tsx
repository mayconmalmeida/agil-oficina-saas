
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones, MessageSquare, Phone, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SuporteIA from '@/components/ai/SuporteIA';

const SuportePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Headphones className="h-6 w-6 text-pink-600" />
        <h1 className="text-2xl font-bold text-gray-900">Suporte Prioritário</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Tempo de Resposta</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">< 2h</div>
            <p className="text-gray-600">Média de resposta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <span>Tickets Abertos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">2</div>
            <p className="text-gray-600">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-orange-600" />
              <span>Tickets Resolvidos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">47</div>
            <p className="text-gray-600">Este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Canais de Suporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat Ao Vivo</span>
            </Button>
            <Button variant="outline" className="w-full flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Telefone: (11) 99999-9999</span>
            </Button>
            <Button variant="outline" className="w-full flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp Business</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suporte Inteligente</CardTitle>
          </CardHeader>
          <CardContent>
            <SuporteIA />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Suporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">#SUP-2025-001</p>
                <p className="text-sm text-gray-600">Dúvida sobre integração contábil</p>
              </div>
              <span className="text-green-600 text-sm">Resolvido</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">#SUP-2025-002</p>
                <p className="text-sm text-gray-600">Problema com backup automático</p>
              </div>
              <span className="text-yellow-600 text-sm">Em andamento</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">#SUP-2025-003</p>
                <p className="text-sm text-gray-600">Configuração do IA Diagnóstico</p>
              </div>
              <span className="text-blue-600 text-sm">Aberto</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuportePage;
