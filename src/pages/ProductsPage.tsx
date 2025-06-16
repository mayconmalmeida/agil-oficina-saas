
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Package, Eye, Upload } from 'lucide-react';
import ProductList from '@/components/products/ProductList';
import ProductForm from '@/components/products/ProductForm';
import ProductDetailsPanel from '@/components/products/ProductDetailsPanel';
import ImportXmlModal from '@/components/products/ImportXmlModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ServiceWithStock } from '@/utils/serviceTypes';

const ProductsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('todos');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [products, setProducts] = useState<ServiceWithStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .eq('tipo', 'produto') // Filtrar apenas produtos
        .eq('is_active', true)
        .order('nome');

      if (error) throw error;

      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality is handled by filteredProducts
  };
  
  const handleNewProduct = () => {
    setActiveTab('novo');
    setSelectedProductId(null);
    setShowDetails(false);
  };
  
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    setShowDetails(true);
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedProductId(null);
  };

  const handleImportSuccess = () => {
    fetchProducts(); // Recarregar lista de produtos
  };

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Produtos e Peças</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar Nota (XML)
            </Button>
            <Button onClick={handleNewProduct}>
              <Plus className="mr-2 h-4 w-4" /> Novo Produto
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-${showDetails ? '2' : '3'}`}>
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <TabsList>
                      <TabsTrigger value="lista" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" /> 
                        Lista de Produtos
                      </TabsTrigger>
                      <TabsTrigger value="novo" className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" /> 
                        Novo Produto
                      </TabsTrigger>
                    </TabsList>
                    
                    {activeTab === 'lista' && (
                      <div className="flex flex-col md:flex-row gap-2 w-full md:max-w-lg">
                        <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1">
                          <Input
                            type="text"
                            placeholder="Buscar produtos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                          />
                          <Button type="submit" size="icon">
                            <Search className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                  
                  <TabsContent value="lista" className="mt-0">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-48">
                        <div className="text-lg">Carregando produtos...</div>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium">
                          {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                        </h3>
                        <p className="text-gray-500 mt-2">
                          {searchQuery
                            ? `Nenhum resultado para "${searchQuery}"`
                            : 'Cadastre um produto ou importe uma nota fiscal'
                          }
                        </p>
                        {!searchQuery && (
                          <div className="flex justify-center gap-3 mt-4">
                            <Button onClick={handleNewProduct}>
                              <Plus className="mr-2 h-4 w-4" />
                              Criar Primeiro Produto
                            </Button>
                            <Button variant="outline" onClick={() => setShowImportModal(true)}>
                              <Upload className="mr-2 h-4 w-4" />
                              Importar XML
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="text-right">Estoque</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.nome}</TableCell>
                              <TableCell>{product.codigo || '-'}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {product.descricao || '-'}
                              </TableCell>
                              <TableCell className="text-right">{product.quantidade_estoque || 0}</TableCell>
                              <TableCell className="text-right">{formatCurrency(product.valor)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleProductSelect(product.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="novo" className="mt-0">
                    <ProductForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {showDetails && (
            <div className="lg:col-span-1">
              <ProductDetailsPanel 
                productId={selectedProductId!} 
                onClose={handleCloseDetails}
              />
            </div>
          )}
        </div>
      </div>

      <ImportXmlModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default ProductsPage;
