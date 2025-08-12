
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/utils/supabaseTypes';
import ProductForm from '@/components/products/ProductForm';
import XmlImportDialog from '@/components/products/XmlImportDialog';

interface Product {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  valor: number;
  descricao?: string;
  codigo?: string;
  quantidade_estoque?: number;
  preco_custo?: number;
  is_active: boolean;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('nome');

      if (error) {
        console.error('Erro ao carregar produtos:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar produtos.",
        });
        return;
      }

      // Type conversion to ensure tipo is the correct union type
      const typedProducts: Product[] = (data || []).map(item => ({
        ...item,
        tipo: (item.tipo === 'produto' || item.tipo === 'servico') ? item.tipo : 'produto'
      }));

      setProducts(typedProducts);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao carregar produtos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProducts(filtered);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${product.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', product.id);

      if (error) {
        console.error('Erro ao excluir produto:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao excluir produto.",
        });
        return;
      }

      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso.",
      });

      loadProducts();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao excluir produto.",
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    loadProducts();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Produtos e Serviços</h1>
        <p className="text-gray-600">Gerencie o catálogo de produtos e serviços da sua oficina</p>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar produtos e serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <XmlImportDialog />
          
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-oficina hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto/Serviço
          </Button>
        </div>
      </div>

      {/* Lista de produtos */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente usar termos diferentes na busca.'
                : 'Comece cadastrando seus produtos e serviços ou importe via XML.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Produto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{product.nome}</CardTitle>
                    {product.codigo && (
                      <p className="text-sm text-muted-foreground">Código: {product.codigo}</p>
                    )}
                  </div>
                  <Badge variant={product.tipo === 'produto' ? 'default' : 'secondary'}>
                    {product.tipo === 'produto' ? 'Produto' : 'Serviço'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {product.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {product.descricao}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(product.valor)}
                      </p>
                      {product.preco_custo && product.preco_custo > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Custo: {formatCurrency(product.preco_custo)}
                        </p>
                      )}
                    </div>
                    
                    {product.tipo === 'produto' && (
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Estoque: {product.quantidade_estoque || 0}
                        </p>
                        {(product.quantidade_estoque || 0) <= 5 && (
                          <Badge variant="destructive" className="text-xs">
                            Estoque baixo
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <ProductForm
              productId={selectedProduct?.id}
              onSaveSuccess={handleFormClose}
            />
            <Button 
              variant="outline" 
              onClick={handleFormClose}
              className="mt-4"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
