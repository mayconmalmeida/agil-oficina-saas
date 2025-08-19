
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { MovimentacaoEstoque, AlertaEstoque } from '@/types/colaboradores';
import { Service } from '@/utils/supabaseTypes';
import { Plus, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const EstoquePage: React.FC = () => {
  const [produtos, setProdutos] = useState<Service[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [alertas, setAlertas] = useState<AlertaEstoque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    produto_id: '',
    tipo_movimentacao: 'entrada' as 'entrada' | 'saida' | 'ajuste',
    quantidade: '',
    motivo: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar produtos
      const { data: produtosData, error: produtosError } = await supabase
        .from('services')
        .select('*')
        .eq('tipo', 'produto')
        .order('nome');

      if (produtosError) throw produtosError;
      setProdutos(produtosData || []);

      // Buscar movimentações
      const { data: movimentacoesData, error: movError } = await supabase
        .from('movimentacao_estoque')
        .select(`
          *,
          produto:services(nome, codigo)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (movError) throw movError;
      setMovimentacoes(movimentacoesData || []);

      // Buscar alertas
      const { data: alertasData, error: alertasError } = await supabase
        .from('alertas_estoque')
        .select(`
          *,
          produto:services(nome, codigo, quantidade_estoque, estoque_minimo)
        `)
        .eq('visualizado', false);

      if (alertasError) throw alertasError;
      setAlertas(alertasData || []);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados do estoque",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const produto = produtos.find(p => p.id === formData.produto_id);
      if (!produto) throw new Error('Produto não encontrado');

      const quantidade = parseInt(formData.quantidade);
      const quantidadeAnterior = produto.quantidade_estoque || 0;
      let quantidadeAtual = quantidadeAnterior;

      // Calcular nova quantidade baseada no tipo de movimentação
      switch (formData.tipo_movimentacao) {
        case 'entrada':
          quantidadeAtual = quantidadeAnterior + quantidade;
          break;
        case 'saida':
          if (quantidadeAnterior < quantidade) {
            throw new Error('Quantidade insuficiente em estoque');
          }
          quantidadeAtual = quantidadeAnterior - quantidade;
          break;
        case 'ajuste':
          quantidadeAtual = quantidade;
          break;
      }

      // Atualizar quantidade no produto
      const { error: updateError } = await supabase
        .from('services')
        .update({ quantidade_estoque: quantidadeAtual })
        .eq('id', formData.produto_id);

      if (updateError) throw updateError;

      // Registrar movimentação
      const { error: movError } = await supabase
        .from('movimentacao_estoque')
        .insert([{
          user_id: user.id,
          produto_id: formData.produto_id,
          tipo_movimentacao: formData.tipo_movimentacao,
          quantidade: quantidade,
          quantidade_anterior: quantidadeAnterior,
          quantidade_atual: quantidadeAtual,
          motivo: formData.motivo,
          created_by: user.id
        }]);

      if (movError) throw movError;

      // Verificar se precisa criar alerta de estoque baixo
      if (quantidadeAtual <= (produto.estoque_minimo || 0)) {
        const { error: alertaError } = await supabase
          .from('alertas_estoque')
          .insert([{
            user_id: user.id,
            produto_id: formData.produto_id,
            tipo_alerta: 'estoque_baixo'
          }]);

        if (alertaError) console.warn('Erro ao criar alerta:', alertaError);
      }

      toast({ title: "Movimentação registrada com sucesso!" });
      fetchData();
      resetForm();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar movimentação",
        description: error.message
      });
    }
  };

  const resetForm = () => {
    setFormData({
      produto_id: '',
      tipo_movimentacao: 'entrada',
      quantidade: '',
      motivo: ''
    });
  };

  const marcarAlertaComoVisto = async (alertaId: string) => {
    try {
      const { error } = await supabase
        .from('alertas_estoque')
        .update({ visualizado: true })
        .eq('id', alertaId);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao marcar alerta",
        description: error.message
      });
    }
  };

  const getMovimentacaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'saida': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Package className="w-4 h-4 text-blue-600" />;
    }
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Estoque</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleMovimentacao} className="space-y-4">
              <div>
                <Label htmlFor="produto_id">Produto</Label>
                <Select 
                  value={formData.produto_id} 
                  onValueChange={(value) => setFormData({...formData, produto_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome} - Estoque: {produto.quantidade_estoque || 0}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipo_movimentacao">Tipo de Movimentação</Label>
                <Select 
                  value={formData.tipo_movimentacao} 
                  onValueChange={(value: 'entrada' | 'saida' | 'ajuste') => 
                    setFormData({...formData, tipo_movimentacao: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                    <SelectItem value="ajuste">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                  required
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="motivo">Motivo</Label>
                <Textarea
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                  placeholder="Descreva o motivo da movimentação..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Registrar</Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas de Estoque */}
      {alertas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Alertas de Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertas.map((alerta) => (
                <div 
                  key={alerta.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div>
                    <span className="font-medium">{alerta.produto?.nome}</span>
                    <p className="text-sm text-gray-600">
                      Estoque atual: {alerta.produto?.quantidade_estoque} | 
                      Mínimo: {alerta.produto?.estoque_minimo}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => marcarAlertaComoVisto(alerta.id)}
                  >
                    Marcar como visto
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo do Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Produtos com Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {produtos.filter(p => (p.quantidade_estoque || 0) <= (p.estoque_minimo || 0)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valor Total em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {produtos.reduce((total, p) => total + ((p.quantidade_estoque || 0) * p.valor), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Estoque Mínimo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell>{produto.nome}</TableCell>
                  <TableCell>{produto.codigo || '-'}</TableCell>
                  <TableCell>{produto.quantidade_estoque || 0}</TableCell>
                  <TableCell>{produto.estoque_minimo || 0}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        (produto.quantidade_estoque || 0) <= (produto.estoque_minimo || 0)
                          ? 'destructive' 
                          : 'default'
                      }
                    >
                      {(produto.quantidade_estoque || 0) <= (produto.estoque_minimo || 0) 
                        ? 'Estoque Baixo' 
                        : 'Normal'
                      }
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Movimentações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentacoes.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMovimentacaoIcon(mov.tipo_movimentacao)}
                      <span className="capitalize">{mov.tipo_movimentacao}</span>
                    </div>
                  </TableCell>
                  <TableCell>{mov.produto?.nome}</TableCell>
                  <TableCell>{mov.quantidade}</TableCell>
                  <TableCell>{mov.motivo || '-'}</TableCell>
                  <TableCell>
                    {new Date(mov.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstoquePage;
