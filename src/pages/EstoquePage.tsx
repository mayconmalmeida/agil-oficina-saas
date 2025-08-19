
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  nome: string;
  codigo?: string;
  quantidade_estoque: number;
  estoque_minimo: number;
  preco_custo: number;
  valor: number;
}

interface MovimentacaoEstoque {
  id: string;
  produto_id: string;
  tipo_movimentacao: 'entrada' | 'saida';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_atual: number;
  motivo?: string;
  created_at: string;
  services?: {
    nome: string;
  };
}

const EstoquePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'produtos' | 'movimentacoes'>('produtos');
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    produto_id: '',
    tipo_movimentacao: 'entrada' as 'entrada' | 'saida',
    quantidade: '',
    motivo: ''
  });

  useEffect(() => {
    loadProducts();
    loadMovimentacoes();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('tipo', 'produto')
        .eq('is_active', true)
        .order('nome');

      if (error) throw error;
      setProducts(data || []);
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

  const loadMovimentacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('movimentacao_estoque')
        .select(`
          *,
          services(nome)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Type cast the data to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        tipo_movimentacao: item.tipo_movimentacao as 'entrada' | 'saida'
      }));
      
      setMovimentacoes(typedData);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado."
      });
      return;
    }

    try {
      const produto = products.find(p => p.id === formData.produto_id);
      if (!produto) return;

      const quantidade = parseInt(formData.quantidade);
      const quantidadeAnterior = produto.quantidade_estoque;
      let quantidadeAtual: number;

      if (formData.tipo_movimentacao === 'entrada') {
        quantidadeAtual = quantidadeAnterior + quantidade;
      } else {
        quantidadeAtual = quantidadeAnterior - quantidade;
        if (quantidadeAtual < 0) {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Quantidade insuficiente em estoque."
          });
          return;
        }
      }

      // Inserir movimentação
      const { error: movError } = await supabase
        .from('movimentacao_estoque')
        .insert({
          user_id: user.id,
          produto_id: formData.produto_id,
          tipo_movimentacao: formData.tipo_movimentacao,
          quantidade,
          quantidade_anterior: quantidadeAnterior,
          quantidade_atual: quantidadeAtual,
          motivo: formData.motivo
        });

      if (movError) throw movError;

      // Atualizar estoque do produto
      const { error: updateError } = await supabase
        .from('services')
        .update({ quantidade_estoque: quantidadeAtual })
        .eq('id', formData.produto_id);

      if (updateError) throw updateError;

      toast({
        title: "Movimentação registrada",
        description: "A movimentação de estoque foi registrada com sucesso.",
      });

      setFormData({ produto_id: '', tipo_movimentacao: 'entrada', quantidade: '', motivo: '' });
      setIsDialogOpen(false);
      loadProducts();
      loadMovimentacoes();
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar a movimentação."
      });
    }
  };

  const getEstoqueStatus = (produto: Product) => {
    if (produto.quantidade_estoque <= produto.estoque_minimo) {
      return { status: 'baixo', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    }
    return { status: 'normal', color: 'bg-green-100 text-green-800', icon: null };
  };

  const productsFiltered = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.codigo && product.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const movimentacoesFiltered = movimentacoes.filter(mov =>
    mov.services?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mov.motivo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold">Controle de Estoque</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="produto_id">Produto</Label>
                <Select onValueChange={(value) => setFormData({...formData, produto_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.nome} - Estoque: {product.quantidade_estoque}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipo_movimentacao">Tipo de Movimentação</Label>
                <Select onValueChange={(value: 'entrada' | 'saida') => setFormData({...formData, tipo_movimentacao: value})}>
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
                  placeholder="Ex: Compra, Venda, Ajuste, etc."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <Button
          variant={activeTab === 'produtos' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('produtos')}
        >
          Produtos
        </Button>
        <Button
          variant={activeTab === 'movimentacoes' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('movimentacoes')}
        >
          Movimentações
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeTab === 'produtos' ? 'Produtos em Estoque' : 'Movimentações de Estoque'}</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'produtos' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Est. Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsFiltered.map((product) => {
                  const status = getEstoqueStatus(product);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.nome}</TableCell>
                      <TableCell>{product.codigo || '-'}</TableCell>
                      <TableCell>{product.quantidade_estoque}</TableCell>
                      <TableCell>{product.estoque_minimo}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          {status.status === 'baixo' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {status.status === 'baixo' ? 'Estoque Baixo' : 'Normal'}
                        </Badge>
                      </TableCell>
                      <TableCell>R$ {product.valor.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Ant. / Atual</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentacoesFiltered.map((movimentacao) => (
                  <TableRow key={movimentacao.id}>
                    <TableCell className="font-medium">{movimentacao.services?.nome || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={movimentacao.tipo_movimentacao === 'entrada' ? 'default' : 'destructive'}>
                        {movimentacao.tipo_movimentacao === 'entrada' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {movimentacao.tipo_movimentacao}
                      </Badge>
                    </TableCell>
                    <TableCell>{movimentacao.quantidade}</TableCell>
                    <TableCell>{movimentacao.quantidade_anterior} → {movimentacao.quantidade_atual}</TableCell>
                    <TableCell>{movimentacao.motivo || '-'}</TableCell>
                    <TableCell>
                      {new Date(movimentacao.created_at).toLocaleDateString('pt-BR')} {new Date(movimentacao.created_at).toLocaleTimeString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EstoquePage;
