
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Archive, Package, AlertTriangle } from 'lucide-react';
import ProductList from '@/components/products/ProductList';
import ProductForm from '@/components/products/ProductForm';
import ProductDetailsPanel from '@/components/products/ProductDetailsPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProductsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('todos');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
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
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Produtos e Peças</h1>
          <Button onClick={handleNewProduct}>
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
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
                      <TabsTrigger value="estoque" className="flex items-center">
                        <Archive className="mr-2 h-4 w-4" /> 
                        Estoque
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
                        
                        <Select value={filter} onValueChange={setFilter}>
                          <SelectTrigger className="md:w-[180px]">
                            <SelectValue placeholder="Filtrar por" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="pecas">Peças</SelectItem>
                            <SelectItem value="servicos">Serviços</SelectItem>
                            <SelectItem value="baixo-estoque">Baixo Estoque</SelectItem>
                            <SelectItem value="esgotados">Esgotados</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  <TabsContent value="lista" className="mt-0">
                    <ProductList 
                      onSelectProduct={handleProductSelect} 
                      searchQuery={searchQuery} 
                      filter={filter} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="novo" className="mt-0">
                    <ProductForm />
                  </TabsContent>
                  
                  <TabsContent value="estoque" className="mt-0">
                    <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded-md flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-800">Alerta de Estoque</h3>
                        <p className="text-sm text-yellow-700">
                          5 produtos estão com estoque baixo e 2 produtos estão esgotados.
                        </p>
                      </div>
                    </div>
                    <ProductList 
                      onSelectProduct={handleProductSelect} 
                      searchQuery="" 
                      filter="baixo-estoque"
                      showInventoryControls
                    />
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
