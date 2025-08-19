
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, RefreshCw } from 'lucide-react';

interface DashboardData {
  stats: {
    totalClientes: number;
    totalOrcamentos: number;
    totalOS: number;
    faturamentoMes: number;
    produtosBaixoEstoque: number;
    agendamentosHoje: number;
    osAbertas: number;
    ticketMedio: number;
  };
  charts: {
    faturamentoPorMes: Array<{ mes: string; valor: number }>;
    osPorStatus: Array<{ status: string; count: number }>;
    produtosMaisUsados: Array<{ nome: string; quantidade: number }>;
  };
  alertas: Array<{
    id: string;
    tipo: string;
    mensagem: string;
    urgencia: 'baixa' | 'media' | 'alta';
  }>;
}

const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Buscar estatísticas básicas
      const [
        clientesResult,
        orcamentosResult,
        osResult,
        produtosResult
      ] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact' }),
        supabase.from('orcamentos').select('id', { count: 'exact' }),
        supabase.from('ordens_servico').select('id, status, valor_total, created_at'),
        supabase.from('services').select('nome, quantidade_estoque, estoque_minimo').eq('tipo', 'produto')
      ]);

      // Calcular estatísticas
      const totalClientes = clientesResult.count || 0;
      const totalOrcamentos = orcamentosResult.count || 0;
      const osData = osResult.data || [];
      const totalOS = osData.length;
      const osAbertas = osData.filter(os => os.status === 'Aberta' || os.status === 'Em Andamento').length;
      
      // Faturamento do mês atual
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const faturamentoMes = osData
        .filter(os => new Date(os.created_at) >= inicioMes && os.valor_total)
        .reduce((sum, os) => sum + (os.valor_total || 0), 0);

      // Ticket médio
      const osComValor = osData.filter(os => os.valor_total > 0);
      const ticketMedio = osComValor.length > 0 
        ? osComValor.reduce((sum, os) => sum + (os.valor_total || 0), 0) / osComValor.length 
        : 0;

      // Produtos com estoque baixo
      const produtos = produtosResult.data || [];
      const produtosBaixoEstoque = produtos.filter(p => 
        (p.quantidade_estoque || 0) <= (p.estoque_minimo || 0)
      ).length;

      // Preparar dados dos gráficos
      const faturamentoPorMes = Array.from({ length: 6 }, (_, i) => {
        const data = new Date();
        data.setMonth(data.getMonth() - i);
        const mes = data.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
        const valor = osData
          .filter(os => {
            const osDate = new Date(os.created_at);
            return osDate.getMonth() === data.getMonth() && 
                   osDate.getFullYear() === data.getFullYear() &&
                   os.valor_total;
          })
          .reduce((sum, os) => sum + (os.valor_total || 0), 0);
        return { mes, valor };
      }).reverse();

      const osPorStatus = osData.reduce((acc: any, os) => {
        const status = os.status || 'Sem status';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const produtosMaisUsados = produtos
        .sort((a, b) => (a.quantidade_estoque || 0) - (b.quantidade_estoque || 0))
        .slice(0, 10)
        .map(p => ({
          nome: p.nome,
          quantidade: p.quantidade_estoque || 0
        }));

      // Gerar alertas
      const alertas = [];
      
      if (produtosBaixoEstoque > 0) {
        alertas.push({
          id: 'estoque-baixo',
          tipo: 'Estoque',
          mensagem: `${produtosBaixoEstoque} produtos com estoque baixo`,
          urgencia: 'alta' as const
        });
      }

      if (osAbertas > 10) {
        alertas.push({
          id: 'os-acumuladas',
          tipo: 'Operacional',
          mensagem: `${osAbertas} ordens de serviço em aberto`,
          urgencia: 'media' as const
        });
      }

      setDashboardData({
        stats: {
          totalClientes,
          totalOrcamentos,
          totalOS,
          faturamentoMes,
          produtosBaixoEstoque,
          agendamentosHoje: 0, // Implementar quando tiver agendamentos
          osAbertas,
          ticketMedio
        },
        charts: {
          faturamentoPorMes,
          osPorStatus: Object.entries(osPorStatus).map(([status, count]) => ({ 
            status, 
            count: count as number 
          })),
          produtosMaisUsados
        },
        alertas
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar dashboard",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeVariant = (urgencia: string) => {
    switch (urgencia) {
      case 'alta': return 'destructive';
      case 'media': return 'default';
      case 'baixa': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="p-6">Carregando dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="p-6">Erro ao carregar dados do dashboard</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={fetchDashboardData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Alertas */}
      {dashboardData.alertas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alertas e Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData.alertas.map((alerta) => (
                <div 
                  key={alerta.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={getBadgeVariant(alerta.urgencia)}>
                      {alerta.tipo}
                    </Badge>
                    <span>{alerta.mensagem}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <DashboardStats stats={dashboardData.stats} />

      {/* Gráficos */}
      <DashboardCharts 
        faturamentoPorMes={dashboardData.charts.faturamentoPorMes}
        osPorStatus={dashboardData.charts.osPorStatus}
        produtosMaisUsados={dashboardData.charts.produtosMaisUsados}
      />
    </div>
  );
};

export default DashboardPage;
