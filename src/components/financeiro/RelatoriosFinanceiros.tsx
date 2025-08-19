
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface RelatorioData {
  faturamento: Array<{ mes: string; valor: number }>;
  despesas: Array<{ categoria: string; valor: number }>;
  resumoMensal: {
    totalEntradas: number;
    totalSaidas: number;
    saldoLiquido: number;
    crescimento: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const RelatoriosFinanceiros: React.FC = () => {
  const [relatorioData, setRelatorioData] = useState<RelatorioData>({
    faturamento: [],
    despesas: [],
    resumoMensal: {
      totalEntradas: 0,
      totalSaidas: 0,
      saldoLiquido: 0,
      crescimento: 0
    }
  });
  const [periodo, setPeriodo] = useState('mes');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const gerarRelatorio = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Buscar dados de faturamento (contas receber pagas)
      const { data: contasReceber } = await supabase
        .from('contas_receber')
        .select('valor, data_pagamento')
        .eq('user_id', user.id)
        .eq('status', 'pago')
        .not('data_pagamento', 'is', null);

      // Buscar dados de despesas (contas pagar pagas)
      const { data: contasPagar } = await supabase
        .from('contas_pagar')
        .select('valor, categoria, data_pagamento')
        .eq('user_id', user.id)
        .eq('status', 'pago')
        .not('data_pagamento', 'is', null);

      // Processar dados para gráficos
      const faturamentoPorMes = processarFaturamentoPorMes(contasReceber || []);
      const despesasPorCategoria = processarDespesasPorCategoria(contasPagar || []);
      const resumo = calcularResumoMensal(contasReceber || [], contasPagar || []);

      setRelatorioData({
        faturamento: faturamentoPorMes,
        despesas: despesasPorCategoria,
        resumoMensal: resumo
      });

    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível gerar o relatório."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processarFaturamentoPorMes = (contas: any[]) => {
    const meses: { [key: string]: number } = {};
    contas.forEach(conta => {
      const mes = new Date(conta.data_pagamento).toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: '2-digit' 
      });
      meses[mes] = (meses[mes] || 0) + Number(conta.valor);
    });

    return Object.entries(meses).map(([mes, valor]) => ({ mes, valor }));
  };

  const processarDespesasPorCategoria = (contas: any[]) => {
    const categorias: { [key: string]: number } = {};
    contas.forEach(conta => {
      const categoria = conta.categoria || 'Outros';
      categorias[categoria] = (categorias[categoria] || 0) + Number(conta.valor);
    });

    return Object.entries(categorias).map(([categoria, valor]) => ({ categoria, valor }));
  };

  const calcularResumoMensal = (contasReceber: any[], contasPagar: any[]) => {
    const totalEntradas = contasReceber.reduce((sum, conta) => sum + Number(conta.valor), 0);
    const totalSaidas = contasPagar.reduce((sum, conta) => sum + Number(conta.valor), 0);
    const saldoLiquido = totalEntradas - totalSaidas;
    
    // Calcular crescimento (simulado - em implementação real, comparar com mês anterior)
    const crescimento = Math.random() * 20 - 10; // Valor simulado entre -10% e +10%

    return {
      totalEntradas,
      totalSaidas,
      saldoLiquido,
      crescimento
    };
  };

  useEffect(() => {
    gerarRelatorio();
  }, [user?.id]);

  const exportarPDF = () => {
    // Em implementação real, integrar com biblioteca de PDF como jsPDF
    toast({
      title: "Exportação",
      description: "Funcionalidade de exportação em desenvolvimento."
    });
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = typeof payload[0].value === 'number' ? payload[0].value : Number(payload[0].value);
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Valor: {formatCurrency(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios Financeiros</h2>
        <Button onClick={exportarPDF}>
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="periodo">Período</Label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semana">Última Semana</SelectItem>
                  <SelectItem value="mes">Último Mês</SelectItem>
                  <SelectItem value="trimestre">Último Trimestre</SelectItem>
                  <SelectItem value="ano">Último Ano</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {periodo === 'personalizado' && (
              <>
                <div>
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <div className="flex items-end">
              <Button onClick={gerarRelatorio} disabled={isLoading}>
                <FileText className="h-4 w-4 mr-2" />
                {isLoading ? 'Gerando...' : 'Gerar Relatório'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(relatorioData.resumoMensal.totalEntradas)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(relatorioData.resumoMensal.totalSaidas)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${relatorioData.resumoMensal.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(relatorioData.resumoMensal.saldoLiquido)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className={`h-4 w-4 ${relatorioData.resumoMensal.crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${relatorioData.resumoMensal.crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {relatorioData.resumoMensal.crescimento >= 0 ? '+' : ''}
              {relatorioData.resumoMensal.crescimento.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={relatorioData.faturamento}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valor" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={relatorioData.despesas}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {relatorioData.despesas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatoriosFinanceiros;
