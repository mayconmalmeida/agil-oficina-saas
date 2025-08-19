
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download, Calendar, DollarSign, Package, Users } from 'lucide-react';

interface RelatorioData {
  osPorStatus: Array<{ status: string; count: number }>;
  faturamentoPorPeriodo: Array<{ periodo: string; valor: number }>;
  produtosMaisUsados: Array<{ nome: string; quantidade: number }>;
  clientesRecorrentes: Array<{ nome: string; total_os: number; ultimo_servico: string }>;
  resumoFinanceiro: {
    totalFaturado: number;
    totalServicos: number;
    mediaTicket: number;
  };
}

const RelatoriosPage: React.FC = () => {
  const [relatorioData, setRelatorioData] = useState<RelatorioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    tipoRelatorio: 'geral'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRelatorioData();
  }, []);

  const fetchRelatorioData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar OS por status
      const { data: osData, error: osError } = await supabase
        .from('ordens_servico')
        .select('status')
        .gte('created_at', filtros.dataInicio || '2024-01-01')
        .lte('created_at', filtros.dataFim || new Date().toISOString());

      if (osError) throw osError;

      const osPorStatus = osData?.reduce((acc: any, os) => {
        const status = os.status || 'Sem status';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Buscar faturamento por mês
      const { data: faturamentoData, error: fatError } = await supabase
        .from('ordens_servico')
        .select('valor_total, created_at')
        .not('valor_total', 'is', null)
        .gte('created_at', filtros.dataInicio || '2024-01-01')
        .lte('created_at', filtros.dataFim || new Date().toISOString());

      if (fatError) throw fatError;

      const faturamentoPorPeriodo = faturamentoData?.reduce((acc: any, item) => {
        const mes = new Date(item.created_at).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
        acc[mes] = (acc[mes] || 0) + (item.valor_total || 0);
        return acc;
      }, {});

      // Buscar produtos mais usados (através de serviços)
      const { data: servicos, error: servicosError } = await supabase
        .from('services')
        .select('nome, quantidade_estoque')
        .eq('tipo', 'produto')
        .order('quantidade_estoque', { ascending: true })
        .limit(10);

      if (servicosError) throw servicosError;

      // Buscar clientes mais recorrentes
      const { data: clientesData, error: clientesError } = await supabase
        .from('ordens_servico')
        .select(`
          cliente_id,
          created_at,
          clients:cliente_id(nome)
        `)
        .not('cliente_id', 'is', null);

      if (clientesError) throw clientesError;

      const clientesRecorrentes = clientesData?.reduce((acc: any, os) => {
        const clienteId = os.cliente_id;
        const nomeCliente = os.clients?.nome || 'Cliente não identificado';
        
        if (!acc[clienteId]) {
          acc[clienteId] = {
            nome: nomeCliente,
            total_os: 0,
            ultimo_servico: os.created_at
          };
        }
        
        acc[clienteId].total_os += 1;
        if (new Date(os.created_at) > new Date(acc[clienteId].ultimo_servico)) {
          acc[clienteId].ultimo_servico = os.created_at;
        }
        
        return acc;
      }, {});

      // Calcular resumo financeiro
      const totalFaturado = faturamentoData?.reduce((sum, item) => sum + (item.valor_total || 0), 0) || 0;
      const totalServicos = osData?.length || 0;
      const mediaTicket = totalServicos > 0 ? totalFaturado / totalServicos : 0;

      setRelatorioData({
        osPorStatus: Object.entries(osPorStatus || {}).map(([status, count]) => ({ 
          status, 
          count: count as number 
        })),
        faturamentoPorPeriodo: Object.entries(faturamentoPorPeriodo || {}).map(([periodo, valor]) => ({ 
          periodo, 
          valor: valor as number 
        })),
        produtosMaisUsados: servicos?.map(s => ({ 
          nome: s.nome, 
          quantidade: s.quantidade_estoque || 0 
        })) || [],
        clientesRecorrentes: Object.values(clientesRecorrentes || {}).sort((a: any, b: any) => 
          b.total_os - a.total_os
        ).slice(0, 10) as any,
        resumoFinanceiro: {
          totalFaturado,
          totalServicos,
          mediaTicket
        }
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar relatórios",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportarRelatorio = (tipo: string) => {
    // Implementar exportação futura
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exportação de relatórios será implementada em breve."
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return <div className="p-6">Carregando relatórios...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportarRelatorio('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => exportarRelatorio('excel')}>
            <FileText className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="tipoRelatorio">Tipo de Relatório</Label>
              <Select 
                value={filtros.tipoRelatorio} 
                onValueChange={(value) => setFiltros({...filtros, tipoRelatorio: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="estoque">Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchRelatorioData}>Aplicar Filtros</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {relatorioData?.resumoFinanceiro.totalFaturado.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {relatorioData?.resumoFinanceiro.totalServicos}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {relatorioData?.resumoFinanceiro.mediaTicket.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OS por Status */}
        <Card>
          <CardHeader>
            <CardTitle>OS por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={relatorioData?.osPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({status, count}) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {relatorioData?.osPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Faturamento por Período */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={relatorioData?.faturamentoPorPeriodo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Faturamento']} />
                <Bar dataKey="valor" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Mais Usados */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorioData?.produtosMaisUsados.map((produto, index) => (
                  <TableRow key={index}>
                    <TableCell>{produto.nome}</TableCell>
                    <TableCell>{produto.quantidade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Clientes Recorrentes */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes Mais Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total OS</TableHead>
                  <TableHead>Último Serviço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorioData?.clientesRecorrentes.map((cliente, index) => (
                  <TableRow key={index}>
                    <TableCell>{cliente.nome}</TableCell>
                    <TableCell>{cliente.total_os}</TableCell>
                    <TableCell>
                      {new Date(cliente.ultimo_servico).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatoriosPage;
