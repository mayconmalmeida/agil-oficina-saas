
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FechamentoCaixa: React.FC = () => {
  const { toast } = useToast();
  const [dataFechamento, setDataFechamento] = useState(new Date().toISOString().split('T')[0]);
  
  const [movimentacoes, setMovimentacoes] = useState({
    entradas: {
      dinheiro: 0,
      cartao: 0,
      pix: 0,
      outros: 0
    },
    saidas: {
      fornecedores: 0,
      combustivel: 0,
      almoco: 0,
      outros: 0
    }
  });

  const totalEntradas = Object.values(movimentacoes.entradas).reduce((sum, valor) => sum + valor, 0);
  const totalSaidas = Object.values(movimentacoes.saidas).reduce((sum, valor) => sum + valor, 0);
  const saldoDia = totalEntradas - totalSaidas;

  const handleInputChange = (categoria: 'entradas' | 'saidas', tipo: string, valor: string) => {
    setMovimentacoes(prev => ({
      ...prev,
      [categoria]: {
        ...prev[categoria],
        [tipo]: parseFloat(valor) || 0
      }
    }));
  };

  const handleFecharCaixa = () => {
    // Simular salvamento do fechamento
    toast({
      title: "Caixa fechado com sucesso",
      description: `Fechamento do dia ${new Date(dataFechamento).toLocaleDateString('pt-BR')} registrado.`,
    });
    
    // Resetar valores
    setMovimentacoes({
      entradas: { dinheiro: 0, cartao: 0, pix: 0, outros: 0 },
      saidas: { fornecedores: 0, combustivel: 0, almoco: 0, outros: 0 }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fechamento de Caixa Diário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="data">Data do Fechamento</Label>
            <Input
              id="data"
              type="date"
              value={dataFechamento}
              onChange={(e) => setDataFechamento(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entradas */}
            <Card className="border-green-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                  Entradas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="dinheiro-entrada">Dinheiro</Label>
                  <Input
                    id="dinheiro-entrada"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={movimentacoes.entradas.dinheiro || ''}
                    onChange={(e) => handleInputChange('entradas', 'dinheiro', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cartao-entrada">Cartão</Label>
                  <Input
                    id="cartao-entrada"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={movimentacoes.entradas.cartao || ''}
                    onChange={(e) => handleInputChange('entradas', 'cartao', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="pix-entrada">PIX</Label>
                  <Input
                    id="pix-entrada"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={movimentacoes.entradas.pix || ''}
                    onChange={(e) => handleInputChange('entradas', 'pix', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="outros-entrada">Outros</Label>
                  <Input
                    id="outros-entrada"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={movimentacoes.entradas.outros || ''}
                    onChange={(e) => handleInputChange('entradas', 'outros', e.target.value)}
                  />
                </div>
                
                <Separator />
                <div className="font-semibold text-green-700">
                  Total Entradas: R$ {totalEntradas.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            {/* Saídas */}
            <Card className="border-red-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                  <TrendingDown className="h-5 w-5" />
                  Saídas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="fornecedores-saida">Fornecedores</Label>
                  <Input
                    id="fornecedores-saida"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={movimentacoes.saidas.fornecedores || ''}
                    onChange={(e) => handleInputChange('saidas', 'fornecedores', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="combustivel-saida">Combustível</Label>
                  <Input
                    id="combustivel-saida"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={movimentacoes.saidas.combustivel || ''}
                    onChange={(e) => handleInputChange('saidas', 'combustivel', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="almoco-saida">Almoço</Label>
                  <Input
                    id="almoco-saida"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={movimentacoes.saidas.almoco || ''}
                    onChange={(e) => handleInputChange('saidas', 'almoco', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="outros-saida">Outros</Label>
                  <Input
                    id="outros-saida"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={movimentacoes.saidas.outros || ''}
                    onChange={(e) => handleInputChange('saidas', 'outros', e.target.value)}
                  />
                </div>
                
                <Separator />
                <div className="font-semibold text-red-700">
                  Total Saídas: R$ {totalSaidas.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Dia */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  <span className="font-semibold">Saldo do Dia:</span>
                </div>
                <span className={`font-bold text-xl ${saldoDia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {saldoDia.toFixed(2)}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button onClick={handleFecharCaixa} className="w-full">
                  Confirmar Fechamento de Caixa
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default FechamentoCaixa;
