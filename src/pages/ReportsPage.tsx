
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Calendar, Users, Package, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
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
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Serviço por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportData.osStatus.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.status}</span>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faturamento" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Faturamento por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead>Faturamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.faturamento.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.mes}</TableCell>
                      <TableCell>R$ {item.valor.toLocaleString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Usados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade Usada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.produtosMaisUsados.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
