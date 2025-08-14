
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BarChart3, Download, Calendar, TrendingUp, Users, Car } from 'lucide-react';

const RelatoriosPage: React.FC = () => {
  const [reportType, setReportType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleGenerateReport = () => {
    // Implementar geração de relatório
    console.log('Gerando relatório:', { reportType, dateFrom, dateTo });
  };

  const reportTypes = [
    { value: 'orcamentos', label: 'Relatório de Orçamentos', icon: BarChart3 },
    { value: 'clientes', label: 'Relatório de Clientes', icon: Users },
    { value: 'servicos', label: 'Relatório de Serviços', icon: Car },
    { value: 'financeiro', label: 'Relatório Financeiro', icon: TrendingUp }
  ];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Relatórios</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.value} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Icon className="h-12 w-12 mx-auto text-blue-600" />
                <CardTitle className="text-lg">{report.label}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gerador de Relatórios</CardTitle>
          <CardDescription>
            Selecione o tipo de relatório e o período para gerar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Relatório
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => (
                    <SelectItem key={report.value} value={report.value}>
                      {report.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Data Inicial
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Data Final
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleGenerateReport}
            disabled={!reportType}
            className="w-full md:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosPage;
