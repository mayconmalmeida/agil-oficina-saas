
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import ProductForm from '@/components/products/ProductForm';
import ProductDetailsPanel from '@/components/products/ProductDetailsPanel';
import ProductsPageHeader from '@/components/products/page/ProductsPageHeader';
import ProductsTabsHeader from '@/components/products/page/ProductsTabsHeader';
import ProductsTable from '@/components/products/page/ProductsTable';
import EmptyProductsState from '@/components/products/page/EmptyProductsState';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ServiceWithStock } from '@/utils/serviceTypes';

const ProductsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
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
        .eq('tipo', 'produto')
        .eq('is_active', true)
        .order('nome');

      if (error) throw error;

      // Cast the data to ensure tipo is the correct union type
      const typedProducts = (data || []).map(item => ({
        ...item,
        tipo: item.tipo as 'produto' | 'servico'
      }));
      setProducts(typedProducts);
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
    fetchProducts();
  };

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ProductsPageHeader 
          onNewProduct={handleNewProduct}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-${showDetails ? '2' : '3'}`}>
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <ProductsTabsHeader
                    activeTab={activeTab}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSearchSubmit={handleSearch}
                  />
                  
                  <TabsContent value="lista" className="mt-0">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-48">
                        <div className="text-lg">Carregando produtos...</div>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <EmptyProductsState
                        searchQuery={searchQuery}
                        onNewProduct={handleNewProduct}
                      />
                    ) : (
                      <ProductsTable
                        products={filteredProducts}
                        onProductSelect={handleProductSelect}
                      />
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
    </div>
  );
};

export default ProductsPage;
