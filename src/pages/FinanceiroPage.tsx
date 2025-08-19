
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import ContasReceber from '@/components/financeiro/ContasReceber';
import ContasPagar from '@/components/financeiro/ContasPagar';
import FechamentoCaixa from '@/components/financeiro/FechamentoCaixa';
import RelatoriosFinanceiros from '@/components/financeiro/RelatoriosFinanceiros';

const FinanceiroPage: React.FC = () => {
  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    totalReceber: 0,
    totalPagar: 0,
    saldoAtual: 0,
    movimentacoesMes: 0
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">A Receber</p>
                <p className="text-lg font-semibold text-green-600">
                  R$ {resumoFinanceiro.totalReceber.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">A Pagar</p>
                <p className="text-lg font-semibold text-red-600">
                  R$ {resumoFinanceiro.totalPagar.toFixed(2)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saldo Atual</p>
                <p className="text-lg font-semibold">
                  R$ {resumoFinanceiro.saldoAtual.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Movimentações</p>
                <p className="text-lg font-semibold">
                  {resumoFinanceiro.movimentacoesMes}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contas-receber" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="contas-receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="contas-pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="fechamento-caixa">Fechamento de Caixa</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="contas-receber">
          <ContasReceber onUpdateResumo={setResumoFinanceiro} />
        </TabsContent>

        <TabsContent value="contas-pagar">
          <ContasPagar onUpdateResumo={setResumoFinanceiro} />
        </TabsContent>

        <TabsContent value="fechamento-caixa">
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
