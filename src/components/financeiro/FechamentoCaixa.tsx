
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const FechamentoCaixa: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dataFechamento, setDataFechamento] = useState(new Date().toISOString().split('T')[0]);
  const [fechado, setFechado] = useState(false);
  const [resumoFechamento, setResumoFechamento] = useState<{ totalEntradas: number; totalSaidas: number; saldoFinal: number } | null>(null);
  
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

  // Movimentações automáticas obtidas das contas pagas do dia
  const [entradasDia, setEntradasDia] = useState<{ id: string; descricao: string; valor: number; data_pagamento: string }[]>([]);
  const [saidasDia, setSaidasDia] = useState<{ id: string; descricao: string; valor: number; data_pagamento: string }[]>([]);

  // Buscar contas pagas na data selecionada
  useEffect(() => {
    const fetchMovimentacoesDia = async () => {
      if (!user?.id || !dataFechamento) return;

      try {
        const inicio = new Date(dataFechamento);
        const fim = new Date(dataFechamento);
        fim.setHours(23, 59, 59, 999);

        // Entradas: contas a receber pagas na data
        const { data: contasRecebidas, error: errorReceber } = await supabase
          .from('contas_receber')
          .select('id, descricao, valor, data_pagamento, status, user_id')
          .eq('user_id', user.id)
          .eq('status', 'pago')
          .eq('data_pagamento', dataFechamento);

        if (errorReceber) throw errorReceber;
        setEntradasDia((contasRecebidas || []).map(c => ({ id: c.id, descricao: c.descricao, valor: c.valor, data_pagamento: c.data_pagamento })));

        // Saídas: contas a pagar pagas na data
        const { data: contasPagas, error: errorPagar } = await supabase
          .from('contas_pagar')
          .select('id, descricao, valor, data_pagamento, status, user_id')
          .eq('user_id', user.id)
          .eq('status', 'pago')
          .eq('data_pagamento', dataFechamento);

        if (errorPagar) throw errorPagar;
        setSaidasDia((contasPagas || []).map(c => ({ id: c.id, descricao: c.descricao, valor: c.valor, data_pagamento: c.data_pagamento })));
      } catch (err) {
        console.error('Erro ao buscar movimentações do dia:', err);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar movimentações do dia.' });
      }
    };

    fetchMovimentacoesDia();
  }, [user?.id, dataFechamento]);

  const totalEntradasManuais = useMemo(() => Object.values(movimentacoes.entradas).reduce((sum, valor) => sum + valor, 0), [movimentacoes.entradas]);
  const totalSaidasManuais = useMemo(() => Object.values(movimentacoes.saidas).reduce((sum, valor) => sum + valor, 0), [movimentacoes.saidas]);
  const totalEntradasAutomaticas = useMemo(() => entradasDia.reduce((sum, m) => sum + (m.valor || 0), 0), [entradasDia]);
  const totalSaidasAutomaticas = useMemo(() => saidasDia.reduce((sum, m) => sum + (m.valor || 0), 0), [saidasDia]);
  const totalEntradas = totalEntradasManuais + totalEntradasAutomaticas;
  const totalSaidas = totalSaidasManuais + totalSaidasAutomaticas;
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

  const handleFecharCaixa = async () => {
    if (!user?.id) return;

    try {
      const payload = {
        user_id: user.id,
        data_fechamento: dataFechamento,
        total_entradas: totalEntradas,
        total_saidas: totalSaidas,
        saldo_final: saldoDia,
        valor_inicial: null,
        observacoes: 'Fechamento registrado pela interface',
      };

      const { error } = await supabase.from('fechamento_caixa').insert(payload);
      if (error) throw error;

      toast({
        title: 'Caixa fechado com sucesso',
        description: `Fechamento do dia ${new Date(dataFechamento).toLocaleDateString('pt-BR')} registrado.`,
      });

      setResumoFechamento({ totalEntradas, totalSaidas, saldoFinal: saldoDia });
      setFechado(true);

      // Resetar valores manuais
      setMovimentacoes({
        entradas: { dinheiro: 0, cartao: 0, pix: 0, outros: 0 },
        saidas: { fornecedores: 0, combustivel: 0, almoco: 0, outros: 0 },
      });
    } catch (err) {
      console.error('Erro ao fechar caixa:', err);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível registrar o fechamento.' });
    }
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

          {fechado ? (
            <div className="rounded-md border bg-muted p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold">Fechamento registrado</span>
                </div>
                <span className="text-sm text-muted-foreground">{new Date(dataFechamento).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded bg-background p-3 border">
                  <div className="text-xs text-muted-foreground">Entradas</div>
                  <div className="text-lg font-semibold text-green-700">R$ {(resumoFechamento?.totalEntradas || 0).toFixed(2)}</div>
                </div>
                <div className="rounded bg-background p-3 border">
                  <div className="text-xs text-muted-foreground">Saídas</div>
                  <div className="text-lg font-semibold text-red-700">R$ {(resumoFechamento?.totalSaidas || 0).toFixed(2)}</div>
                </div>
                <div className="rounded bg-background p-3 border">
                  <div className="text-xs text-muted-foreground">Saldo</div>
                  <div className={`text-lg font-semibold ${saldoDia >= 0 ? 'text-green-700' : 'text-red-700'}`}>R$ {(resumoFechamento?.saldoFinal || 0).toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => setFechado(false)}>Novo fechamento</Button>
              </div>
            </div>
          ) : (
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
                {/* Automático: listagem de contas recebidas no dia */}
                {entradasDia.length > 0 && (
                  <div className="space-y-2">
                    <Label>Recebimentos do dia</Label>
                    <div className="space-y-1">
                      {entradasDia.map((m) => (
                        <div key={m.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{m.descricao}</span>
                          <span className="font-medium">R$ {m.valor.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Entradas automáticas (recebimentos): R$ {totalEntradasAutomaticas.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Entradas manuais: R$ {totalEntradasManuais.toFixed(2)}</div>
                  <div className="font-semibold text-green-700">Total Entradas: R$ {totalEntradas.toFixed(2)}</div>
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
                {/* Automático: listagem de contas pagas no dia */}
                {saidasDia.length > 0 && (
                  <div className="space-y-2">
                    <Label>Pagamentos do dia</Label>
                    <div className="space-y-1">
                      {saidasDia.map((m) => (
                        <div key={m.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{m.descricao}</span>
                          <span className="font-medium">R$ {m.valor.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Saídas automáticas (pagamentos): R$ {totalSaidasAutomaticas.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Saídas manuais: R$ {totalSaidasManuais.toFixed(2)}</div>
                  <div className="font-semibold text-red-700">Total Saídas: R$ {totalSaidas.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          )}

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
              
              {!fechado && (
                <div className="mt-4 pt-4 border-t">
                  <Button onClick={handleFecharCaixa} className="w-full">
                    Confirmar Fechamento de Caixa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default FechamentoCaixa;
