
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, TrendingDown, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Produto {
  id: string;
  nome: string;
  codigo?: string;
  quantidade_estoque: number;
  estoque_minimo: number;
  preco_custo: number;
  valor: number;
}

const EstoquePage: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    produto_id: '',
    tipo_movimentacao: '',
    quantidade: '',
    motivo: ''
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('tipo', 'produto')
        .eq('is_active', true);

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os produtos."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const produto = produtos.find(p => p.id === formData.produto_id);
      if (!produto) return;

      const quantidade = parseInt(formData.quantidade);
      const novaQuantidade = formData.tipo_movimentacao === 'entrada' 
        ? produto.quantidade_estoque + quantidade
        : produto.quantidade_estoque - quantidade;

      // Atualizar estoque do produto
      const { error: updateError } = await supabase
        .from('services')
        .update({ quantidade_estoque: novaQuantidade })
        .eq('id', formData.produto_id);

      if (updateError) throw updateError;

      // Registrar movimentação
      const { error: movError } = await supabase
        .from('movimentacao_estoque')
        .insert({
          produto_id: formData.produto_id,
          tipo_movimentacao: formData.tipo_movimentacao,
          quantidade: quantidade,
          quantidade_anterior: produto.quantidade_estoque,
          quantidade_atual: novaQuantidade,
          motivo: formData.motivo
        });

      if (movError) throw movError;

      toast({
        title: "Sucesso",
        description: "Movimentação registrada com sucesso!"
      });

      setFormData({ produto_id: '', tipo_movimentacao: '', quantidade: '', motivo: '' });
      setIsDialogOpen(false);
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar a movimentação."
      });
    }
  };

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const produtosEstoqueBaixo = produtos.filter(p => p.quantidade_estoque <= p.estoque_minimo);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Package className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Controle de Estoque</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Movimentação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleMovimentacao} className="space-y-4">
              <div>
                <Label htmlFor="produto_id">Produto</Label>
                <Select onValueChange={(value) => setFormData({...formData, produto_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome} (Estoque: {produto.quantidade_estoque})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipo_movimentacao">Tipo de Movimentação</Label>
                <Select onValueChange={(value) => setFormData({...formData, tipo_movimentacao: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="motivo">Motivo</Label>
                <Input
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                  placeholder="Descreva o motivo da movimentação"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {produtosEstoqueBaixo.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <TrendingDown className="mr-2 h-5 w-5" />
              Alerta: Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {produtosEstoqueBaixo.map((produto) => (
                <div key={produto.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="font-medium">{produto.nome}</p>
                  <p className="text-sm text-gray-600">
                    Estoque atual: <span className="text-red-600 font-medium">{produto.quantidade_estoque}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Estoque mínimo: {produto.estoque_minimo}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Produtos em Estoque</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Estoque Mínimo</TableHead>
                <TableHead>Preço Custo</TableHead>
                <TableHead>Preço Venda</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosFiltrados.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell>{produto.codigo || '-'}</TableCell>
                  <TableCell className="font-medium">{produto.nome}</TableCell>
                  <TableCell>{produto.quantidade_estoque}</TableCell>
                  <TableCell>{produto.estoque_minimo}</TableCell>
                  <TableCell>R$ {produto.preco_custo?.toFixed(2) || '0,00'}</TableCell>
                  <TableCell>R$ {produto.valor.toFixed(2)}</TableCell>
                  <TableCell>
                    {produto.quantidade_estoque <= produto.estoque_minimo ? (
                      <Badge variant="destructive">Estoque Baixo</Badge>
                    ) : produto.quantidade_estoque <= produto.estoque_minimo * 2 ? (
                      <Badge variant="secondary">Atenção</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Normal</Badge>
                    )}
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
