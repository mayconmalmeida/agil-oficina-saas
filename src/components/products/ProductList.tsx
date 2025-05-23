import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Plus, Minus, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Service, mapToServiceType } from '@/utils/supabaseTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductListProps {
  onSelectProduct: (productId: string) => void;
  searchQuery?: string;
  filter?: string;
  showInventoryControls?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ 
  onSelectProduct, 
  searchQuery = '',
  filter = 'todos',
  showInventoryControls = false
}) => {
  const [products, setProducts] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryCount, setInventoryCount] = useState<Record<string, number>>({});
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('nome', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        console.log('Products fetched:', data);
        // Use the mapping utility to ensure proper type conversion
        setProducts(mapToServiceType(data || []));
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar produtos",
          description: error.message || "Não foi possível carregar a lista de produtos.",
        });
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [toast]);
  
  // Filter products based on search query and filter
  const filteredProducts = products.filter(product => {
    // First apply search query filter
    const matchesSearch = !searchQuery || 
      product.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    if (!matchesSearch) return false;
    
    // Then apply category filter
    switch (filter) {
      case 'todos':
        return true;
      case 'pecas':
        return product.tipo === 'produto';
      case 'servicos':
        return product.tipo === 'servico';
      case 'baixo-estoque':
        // Placeholder for future implementation
        return false;
      case 'esgotados':
        // Placeholder for future implementation
        return false;
      default:
        return true;
    }
  });
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const handleAdjustInventory = async (productId: string, adjustment: number) => {
    // Placeholder for inventory adjustment functionality
    console.log(`Adjusting inventory for ${productId} by ${adjustment}`);
    
    setInventoryCount(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + adjustment
    }));
    
    toast({
      title: "Estoque atualizado",
      description: adjustment > 0 ? "Item adicionado ao estoque." : "Item removido do estoque.",
    });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Nenhum produto encontrado.
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.nome}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    product.tipo === 'servico' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }>
                    {product.tipo === 'servico' ? 'Serviço' : 'Produto'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(product.valor)}</TableCell>
                <TableCell className="text-right">
                  {showInventoryControls && product.tipo === 'produto' && (
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAdjustInventory(product.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">
                        {inventoryCount[product.id] || 0}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAdjustInventory(product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectProduct(product.id)}
                    className={showInventoryControls ? "ml-2" : ""}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductList;
