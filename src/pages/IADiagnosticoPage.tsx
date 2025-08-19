
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';
import DiagnosticoIA from '@/components/ai/DiagnosticoIA';

const IADiagnosticoPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Stethoscope className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-3xl font-bold">Diagnóstico com IA</h1>
          <p className="text-gray-600">Análise inteligente de problemas automotivos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assistente de Diagnóstico Inteligente</CardTitle>
          <CardDescription>
            Descreva os sintomas do veículo e nossa IA irá sugerir possíveis causas e soluções.
            Esta ferramenta utiliza tecnologia avançada para auxiliar no diagnóstico preliminar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DiagnosticoIA />
        </CardContent>
      </Card>
    </div>
  );
};

export default IADiagnosticoPage;
