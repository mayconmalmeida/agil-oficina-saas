
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BarChart3, Download, Calendar, TrendingUp, Users, Car, DollarSign, FileText } from 'lucide-react';
import { useRelatoriosBasicosData } from '@/hooks/useRelatoriosBasicosData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const RelatoriosPage: React.FC = () => {
  const [reportType, setReportType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { data, loading } = useRelatoriosBasicosData();

  const handleGenerateReport = () => {
    console.log('Gerando relatório:', { reportType, dateFrom, dateTo });
  };

  const reportTypes = [
    { value: 'orcamentos', label: 'Relatório de Orçamentos', icon: BarChart3 },
    { value: 'clientes', label: 'Relatório de Clientes', icon: Users },
    { value: 'servicos', label: 'Relatório de Serviços', icon: Car },
    { value: 'financeiro', label: 'Relatório Financeiro', icon: TrendingUp }
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Relatórios</h1>
      </div>

      {/* Cards com estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalClientes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalOrcamentos || 0}</div>
            <p className="text-xs text-muted-foreground">
              Orçamentos criados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
            <Car className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalServicos || 0}</div>
            <p className="text-xs text-muted-foreground">
              Serviços realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {data?.faturamentoTotal?.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) || '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>
              Orçamentos e serviços por mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.graficoMensal || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orcamentos" fill="#3b82f6" name="Orçamentos" />
                  <Bar dataKey="servicos" fill="#10b981" name="Serviços" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
            <CardDescription>
              Evolução da receita por mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.graficoMensal || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [
                      `R$ ${Number(value).toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`,
                      'Faturamento'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="faturamento" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Faturamento"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimos serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Serviços</CardTitle>
          <CardDescription>
            Os 10 serviços mais recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.ultimosServicos?.length ? (
              data.ultimosServicos.map((servico) => (
                <div key={servico.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{servico.cliente_nome}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {servico.status} | {new Date(servico.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      R$ {servico.valor_total.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum serviço encontrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Gerador de Relatórios */}
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
