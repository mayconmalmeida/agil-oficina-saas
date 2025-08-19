
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RelatoriosFinanceiros: React.FC = () => {
  const { toast } = useToast();
  const [tipoRelatorio, setTipoRelatorio] = useState('faturamento');
  const [periodoInicio, setPeriodoInicio] = useState(new Date().toISOString().split('T')[0]);
  const [periodoFim, setPeriodoFim] = useState(new Date().toISOString().split('T')[0]);

  // Dados simulados para os gráficos
  const dadosFaturamento = [
    { mes: 'Jan', valor: 4500 },
    { mes: 'Fev', valor: 5200 },
    { mes: 'Mar', valor: 4800 },
    { mes: 'Abr', valor: 5800 },
    { mes: 'Mai', valor: 6200 },
    { mes: 'Jun', valor: 5500 }
  ];

  const dadosDespesas = [
    { categoria: 'Fornecedores', valor: 2500, color: '#8884d8' },
    { categoria: 'Combustível', valor: 800, color: '#82ca9d' },
    { categoria: 'Energia', valor: 350, color: '#ffc658' },
    { categoria: 'Aluguel', valor: 1200, color: '#ff7300' },
    { categoria: 'Outros', valor: 450, color: '#8dd1e1' }
  ];

  const gerarRelatorio = () => {
    toast({
      title: "Relatório gerado",
      description: `Relatório de ${tipoRelatorio} para o período selecionado foi gerado com sucesso.`,
    });
  };

  const exportarPDF = () => {
    toast({
      title: "Exportando relatório",
      description: "O relatório será baixado em formato PDF em instantes.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configurar Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="tipo-relatorio">Tipo de Relatório</Label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faturamento">Faturamento</SelectItem>
                  <SelectItem value="despesas">Despesas por Categoria</SelectItem>
                  <SelectItem value="fluxo-caixa">Fluxo de Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="periodo-inicio">Data Início</Label>
              <Input
                id="periodo-inicio"
                type="date"
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="periodo-fim">Data Fim</Label>
              <Input
                id="periodo-fim"
                type="date"
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={gerarRelatorio} className="flex-1">
                <Calendar className="mr-2 h-4 w-4" />
                Gerar
              </Button>
              <Button variant="outline" onClick={exportarPDF}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatório de Faturamento */}
      {tipoRelatorio === 'faturamento' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Faturamento Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosFaturamento}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Faturamento']} />
                  <Bar dataKey="valor" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Despesas */}
      {tipoRelatorio === 'despesas' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosDespesas}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="valor"
                      label={({ categoria, valor }) => `${categoria}: R$ ${valor}`}
                    >
                      {dadosDespesas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold mb-4">Resumo por Categoria</h3>
                {dadosDespesas.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.categoria}</span>
                    </div>
                    <span className="font-medium">R$ {item.valor.toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t font-semibold">
                  Total: R$ {dadosDespesas.reduce((sum, item) => sum + item.valor, 0).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Fluxo de Caixa */}
      {tipoRelatorio === 'fluxo-caixa' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Fluxo de Caixa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-green-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Total Entradas</p>
                  <p className="text-2xl font-bold text-green-600">R$ 15.250,00</p>
                </CardContent>
              </Card>
              
              <Card className="border-red-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Total Saídas</p>
                  <p className="text-2xl font-bold text-red-600">R$ 8.420,00</p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Saldo Líquido</p>
                  <p className="text-2xl font-bold text-blue-600">R$ 6.830,00</p>
                </CardContent>
              </Card>
            </div>
            
            <p className="text-center text-gray-600">
              Período: {new Date(periodoInicio).toLocaleDateString('pt-BR')} a {new Date(periodoFim).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RelatoriosFinanceiros;
