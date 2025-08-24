
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Calendar, Users, Package, TrendingUp, DollarSign, Sparkles, Target, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

interface ReportData {
  osStatus: { status: string; count: number; color: string }[];
  faturamento: { mes: string; valor: number }[];
  produtosMaisUsados: { nome: string; quantidade: number }[];
  clientesRecorrentes: { nome: string; count: number; telefone: string }[];
  fluxoCaixa: { tipo: string; valor: number; data: string }[];
}

const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    osStatus: [],
    faturamento: [],
    produtosMaisUsados: [],
    clientesRecorrentes: [],
    fluxoCaixa: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchReportData();
  }, [user?.id]);

  const fetchReportData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // OS por status
      const { data: osData } = await supabase
        .from('ordens_servico')
        .select('status')
        .eq('user_id', user.id);

      const statusCounts = osData?.reduce((acc: any, os) => {
        acc[os.status] = (acc[os.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const osStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number,
        color: status === 'Concluída' ? 'green' : status === 'Em Andamento' ? 'blue' : 'yellow'
      }));

      // Produtos mais usados (simulado)
      const produtosMaisUsados = [
        { nome: 'Óleo 5W30', quantidade: 45 },
        { nome: 'Filtro de Óleo', quantidade: 38 },
        { nome: 'Pastilha de Freio', quantidade: 22 },
        { nome: 'Vela de Ignição', quantidade: 18 }
      ];

      // Clientes recorrentes (simulado)
      const clientesRecorrentes = [
        { nome: 'João Silva', count: 8, telefone: '(11) 99999-9999' },
        { nome: 'Maria Santos', count: 6, telefone: '(11) 88888-8888' },
        { nome: 'Carlos Oliveira', count: 5, telefone: '(11) 77777-7777' }
      ];

      // Faturamento por período (simulado)
      const faturamento = [
        { mes: 'Jan', valor: 15000 },
        { mes: 'Fev', valor: 18000 },
        { mes: 'Mar', valor: 22000 },
        { mes: 'Abr', valor: 19000 },
        { mes: 'Mai', valor: 25000 },
        { mes: 'Jun', valor: 28000 }
      ];

      // Fluxo de caixa (simulado)
      const fluxoCaixa = [
        { tipo: 'Entrada', valor: 28000, data: '2024-01-15' },
        { tipo: 'Saída', valor: -8000, data: '2024-01-10' },
        { tipo: 'Entrada', valor: 15000, data: '2024-01-05' }
      ];

      setReportData({
        osStatus,
        faturamento,
        produtosMaisUsados,
        clientesRecorrentes,
        fluxoCaixa
      });
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Relatórios Inteligentes
        </h1>
      </div>

      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg">
                <Activity className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-blue-100">OS Ativas</p>
                <p className="text-3xl font-bold">{reportData.osStatus.reduce((acc, item) => acc + item.count, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-green-100">Faturamento</p>
                <p className="text-3xl font-bold">R$ 168k</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-purple-100">Clientes</p>
                <p className="text-3xl font-bold">127</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg">
                <Target className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-orange-100">Meta do Mês</p>
                <p className="text-3xl font-bold">89%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="os" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="os">OS por Status</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="os" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Distribuição de OS por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.osStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({status, count}) => `${status}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {reportData.osStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 137.508}deg 70% 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Status das Ordens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.osStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                          item.status === 'Concluída' ? 'from-green-400 to-green-600' :
                          item.status === 'Em Andamento' ? 'from-blue-400 to-blue-600' :
                          'from-yellow-400 to-yellow-600'
                        }`} />
                        <span className="font-medium">{item.status}</span>
                      </div>
                      <Badge variant="outline" className="font-bold">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faturamento" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Evolução do Faturamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData.faturamento}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']} />
                    <Area 
                      type="monotone" 
                      dataKey="valor" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Detalhes do Faturamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.faturamento.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                      <span className="font-medium">{item.mes}</span>
                      <span className="text-lg font-bold text-green-600">
                        R$ {item.valor.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Total:</span>
                      <span className="text-xl font-bold text-primary">
                        R$ {reportData.faturamento.reduce((acc, item) => acc + item.valor, 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="produtos" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Ranking de Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.produtosMaisUsados} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="nome" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Top Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.produtosMaisUsados.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.nome}</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500" 
                            style={{width: `${(item.quantidade / Math.max(...reportData.produtosMaisUsados.map(p => p.quantidade))) * 100}%`}}
                          />
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {item.quantidade}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clientes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Mais Recorrentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Total de OS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.clientesRecorrentes.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell>{item.telefone}</TableCell>
                      <TableCell>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.fluxoCaixa.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant={item.tipo === 'Entrada' ? 'default' : 'destructive'}>
                          {item.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.data).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className={item.valor > 0 ? 'text-green-600' : 'text-red-600'}>
                        R$ {Math.abs(item.valor).toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
