
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ContasReceber from '@/components/financeiro/ContasReceber';
import ContasPagar from '@/components/financeiro/ContasPagar';
import FechamentoCaixa from '@/components/financeiro/FechamentoCaixa';
import RelatoriosFinanceiros from '@/components/financeiro/RelatoriosFinanceiros';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ResumoFinanceiro {
  totalReceber: number;
  totalPagar: number;
  saldoPrevisto: number;
  movimentacoesMes: number;
}

const FinanceiroPage: React.FC = () => {
  const { user } = useAuth();
  const [resumoFinanceiro, setResumoFinanceiro] = useState<ResumoFinanceiro>({
    totalReceber: 0,
    totalPagar: 0,
    saldoPrevisto: 0,
    movimentacoesMes: 0
  });

  const handleUpdateResumo = (novoResumo: Partial<ResumoFinanceiro>) => {
    setResumoFinanceiro(prev => {
      const updated = { ...prev, ...novoResumo };
      updated.saldoPrevisto = updated.totalReceber - updated.totalPagar;
      return updated;
    });
  };

  // Carregar totais diretamente (robusto mesmo sem interação nas abas)
  useEffect(() => {
    const carregarTotais = async () => {
      if (!user?.id) return;

      try {
        const [receberRes, pagarRes] = await Promise.all([
          supabase
            .from('contas_receber')
            .select('valor, status')
            .eq('user_id', user.id),
          supabase
            .from('contas_pagar')
            .select('valor, status')
            .eq('user_id', user.id)
        ]);

        const totalReceber = (receberRes.data || [])
          .filter((c: any) => (c.status || 'pendente') !== 'pago')
          .reduce((sum: number, c: any) => sum + (Number(c.valor) || 0), 0);

        const totalPagar = (pagarRes.data || [])
          .filter((c: any) => (c.status || 'pendente') !== 'pago')
          .reduce((sum: number, c: any) => sum + (Number(c.valor) || 0), 0);

        setResumoFinanceiro(prev => ({
          ...prev,
          totalReceber,
          totalPagar,
          saldoPrevisto: totalReceber - totalPagar,
        }));
      } catch (err) {
        console.error('Erro ao carregar totais financeiros:', err);
      }
    };

    carregarTotais();
  }, [user?.id]);

  // Calcular movimentações do mês (pagamentos realizados)
  useEffect(() => {
    const calcMovimentacoesMes = async () => {
      if (!user?.id) return;

      try {
        const now = new Date();
        const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
        const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        fimMes.setHours(23, 59, 59, 999);

        const [receberRes, pagarRes] = await Promise.all([
          supabase
            .from('contas_receber')
            .select('valor')
            .eq('user_id', user.id)
            .eq('status', 'pago')
            .gte('data_pagamento', inicioMes.toISOString())
            .lte('data_pagamento', fimMes.toISOString()),
          supabase
            .from('contas_pagar')
            .select('valor')
            .eq('user_id', user.id)
            .eq('status', 'pago')
            .gte('data_pagamento', inicioMes.toISOString())
            .lte('data_pagamento', fimMes.toISOString())
        ]);

        const totalRecebidoMes = (receberRes.data || []).reduce((sum: number, r: any) => sum + (r.valor || 0), 0);
        const totalPagoMes = (pagarRes.data || []).reduce((sum: number, p: any) => sum + (p.valor || 0), 0);
        // Movimentações do mês representam o fluxo líquido (entradas - saídas)
        setResumoFinanceiro(prev => ({ ...prev, movimentacoesMes: totalRecebidoMes - totalPagoMes }));
      } catch (err) {
        console.error('Erro ao calcular movimentações do mês:', err);
      }
    };

    calcMovimentacoesMes();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financeiro</h1>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">A Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {resumoFinanceiro.totalReceber.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">A Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {resumoFinanceiro.totalPagar.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Saldo Previsto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${resumoFinanceiro.saldoPrevisto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {resumoFinanceiro.saldoPrevisto.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Movimentações/Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {resumoFinanceiro.movimentacoesMes.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contas-receber" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contas-receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="contas-pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="fechamento">Fechamento de Caixa</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="contas-receber">
          <ContasReceber onUpdateResumo={handleUpdateResumo} />
        </TabsContent>

        <TabsContent value="contas-pagar">
          <ContasPagar onUpdateResumo={handleUpdateResumo} />
        </TabsContent>

        <TabsContent value="fechamento">
          <FechamentoCaixa />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatoriosFinanceiros />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceiroPage;
