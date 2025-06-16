
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Wrench, Car, AlertTriangle } from 'lucide-react';
import DiagnosticoIA from '@/components/ai/DiagnosticoIA';

const IADiagnosticoPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Bot className="h-6 w-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900">IA para Diagnóstico Mecânico</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <span>Diagnósticos Realizados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">127</div>
            <p className="text-gray-600">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-green-600" />
              <span>Veículos Analisados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">89</div>
            <p className="text-gray-600">Únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Precisão</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">94.2%</div>
            <p className="text-gray-600">Diagnósticos corretos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico Inteligente</CardTitle>
        </CardHeader>
        <CardContent>
          <DiagnosticoIA />
        </CardContent>
      </Card>
    </div>
  );
};

export default IADiagnosticoPage;
