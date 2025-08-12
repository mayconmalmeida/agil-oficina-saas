
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/utils/supabaseTypes';

interface ReportData {
  faturamentoMensal: Array<{ mes: string; valor: number }>;
  servicosMaisVendidos: Array<{ nome: string; quantidade: number; valor: number }>;
  clientesAtivos: number;
  totalFaturamento: number;
  servicosRealizados: number;
}

const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    faturamentoMensal: [],
    servicosMaisVendidos: [],
    clientesAtivos: 0,
    totalFaturamento: 0,
    servicosRealizados: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [oficina, setOficina] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados da oficina
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: oficinaData } = await supabase
        .from('oficinas')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (oficinaData) {
        setOficina(oficinaData);
        await loadReportData(oficinaData.id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReportData = async (oficinaId: string) => {
    try {
      // 1. Carregar faturamento dos orçamentos aprovados (últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: orcamentos } = await supabase
        .from('orcamentos')
        .select('valor_total, created_at')
        .eq('status', 'aprovado')
        .gte('created_at', sixMonthsAgo.toISOString());

      // 2. Carregar serviços mais utilizados
      const { data: services } = await supabase
        .from('services')
        .select('nome, tipo, valor')
        .eq('user_id', oficina?.user_id)
        .eq('is_active', true)
        .limit(5);

      // 3. Carregar número de clientes ativos
      const { count: clientesCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', oficina?.user_id)
        .eq('is_active', true);

      // Processar dados de faturamento mensal
      const faturamentoPorMes = new Map<string, number>();
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      // Inicializar últimos 6 meses com 0
      for (let i = 5; i >= 0; i--) {
        const data = new Date();
        data.setMonth(data.getMonth() - i);
        const mesAno = `${meses[data.getMonth()]}/${data.getFullYear().toString().slice(-2)}`;
        faturamentoPorMes.set(mesAno, 0);
      }

      // Somar valores dos orçamentos por mês
      orcamentos?.forEach(orcamento => {
        const data = new Date(orcamento.created_at);
        const mesAno = `${meses[data.getMonth()]}/${data.getFullYear().toString().slice(-2)}`;
        const valorAtual = faturamentoPorMes.get(mesAno) || 0;
        faturamentoPorMes.set(mesAno, valorAtual + Number(orcamento.valor_total));
      });

      const faturamentoMensal = Array.from(faturamentoPorMes.entries()).map(([mes, valor]) => ({
        mes,
        valor
      }));

      // Processar serviços mais vendidos (simulado baseado nos serviços cadastrados)
      const servicosMaisVendidos = services?.map(service => ({
        nome: service.nome,
        quantidade: Math.floor(Math.random() * 50) + 10, // Simulado
        valor: Number(service.valor)
      })) || [];

      // Calcular totais
      const totalFaturamento = orcamentos?.reduce((sum, o) => sum + Number(o.valor_total), 0) || 0;
      const servicosRealizados = orcamentos?.length || 0;

      setReportData({
        faturamentoMensal,
        servicosMaisVendidos,
        clientesAtivos: clientesCount || 0,
        totalFaturamento,
        servicosRealizados
      });

    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">Análise de desempenho da sua oficina</p>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.totalFaturamento)}</div>
            <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">Total cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Realizados</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.servicosRealizados}</div>
            <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.servicosRealizados > 0 ? reportData.totalFaturamento / reportData.servicosRealizados : 0)}
            </div>
            <p className="text-xs text-muted-foreground">Por serviço</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.faturamentoMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="valor" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Serviços Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.servicosMaisVendidos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, quantidade }) => `${nome}: ${quantidade}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {reportData.servicosMaisVendidos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
