
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { X, Edit, Package, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import ProductForm from './ProductForm';
import { Service } from '@/utils/supabaseTypes';

interface ProductDetailsPanelProps {
  productId: string;
  onClose: () => void;
}

const ProductDetailsPanel: React.FC<ProductDetailsPanelProps> = ({ productId, onClose }) => {
  const [product, setProduct] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', productId)
          .single();
        
        if (error) {
          console.error('Error fetching product details:', error);
          throw error;
        }
        
        console.log('Product data fetched successfully:', data);
        setProduct(data);
      } catch (error: any) {
        console.error('Failed to fetch product details:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar produto",
          description: error.message || "Não foi possível carregar os dados do produto.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (productId) {
      fetchProduct();
    }
  }, [productId, toast]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveSuccess = () => {
    setIsEditing(false);
    // Refresh product data
    const fetchUpdatedProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', productId)
          .single();
        
        if (error) throw error;
        setProduct(data);
        
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso."
        });
      } catch (error: any) {
        console.error('Error refreshing product:', error);
      }
    };
    
    fetchUpdatedProduct();
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  if (isEditing) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <CardTitle className="text-lg">Editar Produto</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ProductForm 
            productId={productId}
            onSaveSuccess={handleSaveSuccess}
          />
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <Skeleton className="h-6 w-40" />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!product) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <CardTitle className="text-lg">Produto não encontrado</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Não foi possível encontrar os detalhes deste produto.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle className="text-lg">{product.nome}</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-1" /> Editar
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Badge variant={product.tipo === 'produto' ? 'default' : 'secondary'}>
            {product.tipo === 'produto' ? (
              <><Package className="h-3 w-3 mr-1" /> Produto</>
            ) : (
              <><Wrench className="h-3 w-3 mr-1" /> Serviço</>
            )}
          </Badge>
          <span className="font-semibold text-lg">{formatCurrency(product.valor)}</span>
        </div>

        {product.codigo && (
          <div>
            <h4 className="text-sm font-medium mb-1">Código</h4>
            <p className="text-sm text-muted-foreground">{product.codigo}</p>
          </div>
        )}
        
        {product.descricao && (
          <div>
            <h4 className="text-sm font-medium mb-1">Descrição</h4>
            <p className="text-sm text-muted-foreground">{product.descricao}</p>
          </div>
        )}

        {product.tipo === 'produto' && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium mb-1">Estoque Atual</h4>
              <p className="text-sm">{product.quantidade_estoque || 0} unidades</p>
            </div>
            {product.preco_custo && (
              <div>
                <h4 className="text-sm font-medium mb-1">Preço de Custo</h4>
                <p className="text-sm">{formatCurrency(product.preco_custo)}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium mb-2">Detalhes adicionais</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Criado em:</span>
              <p>{new Date(product.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <p>{product.is_active ? 'Ativo' : 'Inativo'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDetailsPanel;
