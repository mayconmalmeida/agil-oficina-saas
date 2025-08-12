import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { FileText, Download, Calendar, TrendingUp, Users, Car, DollarSign } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

const RelatoriosPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState('geral');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    totalClientes: 0,
    totalOrcamentos: 0,
    totalAgendamentos: 0,
    faturamentoTotal: 0,
    orcamentosPorStatus: [],
    agendamentosPorMes: [],
    servicosMaisVendidos: []
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange, reportType]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Total de clientes
      const { count: clientesCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Total de orçamentos
      const { data: orcamentos, count: orcamentosCount } = await supabase
        .from('orcamentos')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Total de agendamentos
      const { count: agendamentosCount } = await supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Faturamento total (soma dos orçamentos) - Fixed type error
      const faturamentoTotal = orcamentos?.reduce((sum, orcamento) => 
        sum + (parseFloat(String(orcamento.valor_total)) || 0), 0) || 0;

      // Dados simulados para os gráficos (substituir por dados reais)
      const orcamentosPorStatus = [
        { name: 'Pendente', value: 40, color: '#fbbf24' },
        { name: 'Aprovado', value: 35, color: '#10b981' },
        { name: 'Rejeitado', value: 25, color: '#ef4444' }
      ];

      const agendamentosPorMes = [
        { mes: 'Jan', agendamentos: 12, orcamentos: 8 },
        { mes: 'Fev', agendamentos: 19, orcamentos: 15 },
        { mes: 'Mar', agendamentos: 25, orcamentos: 20 },
        { mes: 'Abr', agendamentos: 18, orcamentos: 12 },
        { mes: 'Mai', agendamentos: 22, orcamentos: 18 },
        { mes: 'Jun', agendamentos: 28, orcamentos: 25 }
      ];

      const servicosMaisVendidos = [
        { servico: 'Troca de Óleo', quantidade: 45 },
        { servico: 'Alinhamento', quantidade: 32 },
        { servico: 'Balanceamento', quantidade: 28 },
        { servico: 'Freios', quantidade: 25 },
        { servico: 'Suspensão', quantidade: 18 }
      ];

      setReportData({
        totalClientes: clientesCount || 0,
        totalOrcamentos: orcamentosCount || 0,
        totalAgendamentos: agendamentosCount || 0,
        faturamentoTotal,
        orcamentosPorStatus,
        agendamentosPorMes,
        servicosMaisVendidos
      });
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // Implementar exportação para PDF/Excel
    console.log('Exportando relatório...');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          Relatórios
        </h1>
        <p className="text-muted-foreground mt-2">
          Análise completa dos dados da sua oficina
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Período</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Relatório Geral</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="servicos">Serviços</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleExportReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{reportData.totalClientes}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orçamentos</p>
                <p className="text-2xl font-bold">{reportData.totalOrcamentos}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Agendamentos</p>
                <p className="text-2xl font-bold">{reportData.totalAgendamentos}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
                <p className="text-2xl font-bold">
                  R$ {reportData.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Barras - Agendamentos por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos e Orçamentos por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.agendamentosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="agendamentos" fill="#3b82f6" name="Agendamentos" />
                <Bar dataKey="orcamentos" fill="#10b981" name="Orçamentos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Status dos Orçamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Orçamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.orcamentosPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.orcamentosPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Serviços Mais Vendidos */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Mais Vendidos</CardTitle>
          <CardDescription>Ranking dos serviços mais solicitados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.servicosMaisVendidos.map((servico, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium">{servico.servico}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Quantidade:</span>
                  <span className="font-bold">{servico.quantidade}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosPage;
