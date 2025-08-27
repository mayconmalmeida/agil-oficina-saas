import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  nome: string;
  codigo?: string;
  tipo: string;
  valor: number;
  preco_custo: number;
  quantidade_estoque: number;
  estoque_minimo: number;
  descricao?: string;
  is_active: boolean;
}

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<Product>({
    id: '',
    nome: '',
    codigo: '',
    tipo: 'produto',
    valor: 0,
    preco_custo: 0,
    quantidade_estoque: 0,
    estoque_minimo: 0,
    descricao: '',
    is_active: true
  });

  useEffect(() => {
    if (id && id !== 'novo') {
      fetchProduct();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar produto",
        description: error.message,
      });
      navigate('/produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const numericValue = parseInt(numbers, 10);
    if (numericValue < 100) {
      return `0,${numbers.padStart(2, '0')}`;
    }
    const reais = Math.floor(numericValue / 100);
    const centavos = numericValue % 100;
    const reaisFormatted = reais.toLocaleString('pt-BR');
    return `${reaisFormatted},${centavos.toString().padStart(2, '0')}`;
  };

  const parseCurrencyToNumber = (currencyString: string) => {
    const numbers = currencyString.replace(/\D/g, '');
    if (!numbers) return 0;
    return parseInt(numbers, 10) / 100;
  };

  const handleSave = async () => {
    if (!product.nome.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "O nome do produto é obrigatório.",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (id === 'novo') {
        const { error } = await supabase
          .from('services')
          .insert({
            ...product,
            user_id: user?.id,
            tipo: 'produto'
          });

        if (error) throw error;

        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('services')
          .update(product)
          .eq('id', id)
          .eq('user_id', user?.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso.",
        });
      }

      navigate('/produtos');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar produto",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/produtos')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">
          {id === 'novo' ? 'Novo Produto' : 'Editar Produto'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Produto *</Label>
              <Input
                id="nome"
                value={product.nome}
                onChange={(e) => setProduct({...product, nome: e.target.value})}
                placeholder="Nome do produto"
              />
            </div>
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={product.codigo || ''}
                onChange={(e) => setProduct({...product, codigo: e.target.value})}
                placeholder="Código do produto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco_custo">Preço de Custo (R$)</Label>
              <Input
                id="preco_custo"
                value={formatCurrency((product.preco_custo * 100).toString())}
                onChange={(e) => setProduct({...product, preco_custo: parseCurrencyToNumber(e.target.value)})}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="valor">Preço de Venda (R$)</Label>
              <Input
                id="valor"
                value={formatCurrency((product.valor * 100).toString())}
                onChange={(e) => setProduct({...product, valor: parseCurrencyToNumber(e.target.value)})}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantidade_estoque">Quantidade em Estoque</Label>
              <Input
                id="quantidade_estoque"
                type="number"
                value={product.quantidade_estoque}
                onChange={(e) => setProduct({...product, quantidade_estoque: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
              <Input
                id="estoque_minimo"
                type="number"
                value={product.estoque_minimo}
                onChange={(e) => setProduct({...product, estoque_minimo: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={product.descricao || ''}
              onChange={(e) => setProduct({...product, descricao: e.target.value})}
              placeholder="Descrição do produto"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={product.is_active}
              onCheckedChange={(checked) => setProduct({...product, is_active: checked})}
            />
            <Label htmlFor="is_active">Produto ativo</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/produtos')}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductEditPage;