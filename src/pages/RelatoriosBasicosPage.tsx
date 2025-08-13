
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, FileText, Calendar, Download } from 'lucide-react';

const RelatoriosBasicosPage: React.FC = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState('');
  const [periodo, setPeriodo] = useState('');

  const tiposRelatorio = [
    { value: 'clientes', label: 'Relatório de Clientes' },
    { value: 'servicos', label: 'Relatório de Serviços' },
    { value: 'orcamentos', label: 'Relatório de Orçamentos' },
    { value: 'agendamentos', label: 'Relatório de Agendamentos' },
    { value: 'financeiro', label: 'Relatório Financeiro' }
  ];

  const periodos = [
    { value: '7dias', label: 'Últimos 7 dias' },
    { value: '30dias', label: 'Últimos 30 dias' },
    { value: '3meses', label: 'Últimos 3 meses' },
    { value: 'anual', label: 'Últimos 12 meses' },
    { value: 'personalizado', label: 'Período personalizado' }
  ];

  const handleGerarRelatorio = () => {
    console.log('Gerando relatório:', { tipoRelatorio, periodo });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatórios Básicos</h1>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <BarChart3 className="h-4 w-4 mr-1" />
          Análises e Dados
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Gerar Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de relatório" />
                </SelectTrigger>
                <SelectContent>
                  {tiposRelatorio.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((per) => (
                    <SelectItem key={per.value} value={per.value}>
                      {per.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGerarRelatorio}
            disabled={!tipoRelatorio || !periodo}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiposRelatorio.map((tipo) => (
          <Card key={tipo.value} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-medium">{tipo.label}</h3>
                  <p className="text-sm text-gray-600">Visualizar dados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatoriosBasicosPage;
