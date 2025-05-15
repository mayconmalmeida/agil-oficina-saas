
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Edit, Trash2, Package, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatUtils';

interface ProductDetailsPanelProps {
  productId: string;
  onClose: () => void;
}

interface ProductDetails {
  id: string;
  nome: string;
  codigo?: string;
  tipo: 'produto' | 'servico';
  preco_custo: number;
  preco_venda: number;
  quantidade: number;
  estoque_minimo: number;
  descricao?: string;
  fornecedor?: string;
  created_at: string;
  updated_at: string;
}

const ProductDetailsPanel: React.FC<ProductDetailsPanelProps> = ({ productId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would be an API call to fetch the product details
        // For now we'll simulate it with mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockProduct: ProductDetails = {
          id: productId,
          nome: "Óleo 5W30 Sintético",
          codigo: "OL-5W30-1L",
          tipo: "produto",
          preco_custo: 29.90,
          preco_venda: 49.90,
          quantidade: 15,
          estoque_minimo: 5,
          descricao: "Óleo sintético para motor de alta performance",
          fornecedor: "Auto Peças Brasil",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setProduct(mockProduct);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [productId]);
  
  if (isLoading) {
    return (
      <Card className="h-full animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (!product) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Detalhes do Produto</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Produto não encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{product.nome}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-md">
          <Package className="h-16 w-16 text-oficina" />
        </div>
        
        <div>
          <h3 className="text-sm text-gray-500 mb-1">Código/Referência</h3>
          <p className="font-medium">{product.codigo || 'Não informado'}</p>
        </div>
        
        <div>
          <h3 className="text-sm text-gray-500 mb-1">Tipo</h3>
          <p className="font-medium capitalize">{product.tipo === 'produto' ? 'Produto/Peça' : 'Serviço'}</p>
        </div>
        
        <div>
          <h3 className="text-sm text-gray-500 mb-1">Preço de Custo</h3>
          <p className="font-medium">{formatCurrency(product.preco_custo)}</p>
        </div>
        
        <div>
          <h3 className="text-sm text-gray-500 mb-1">Preço de Venda</h3>
          <p className="font-medium text-lg text-oficina">{formatCurrency(product.preco_venda)}</p>
        </div>
        
        {product.tipo === 'produto' && (
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Estoque</h3>
            <div className="flex gap-1 items-center">
              <span className={`h-2.5 w-2.5 rounded-full ${product.quantidade <= product.estoque_minimo 
                ? 'bg-red-500' 
                : product.quantidade <= product.estoque_minimo * 2 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'}`}>
              </span>
              <p className="font-medium">{product.quantidade} unidades</p>
              <span className="text-xs text-gray-500 ml-1">
                (Min: {product.estoque_minimo})
              </span>
            </div>
          </div>
        )}
        
        {product.descricao && (
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Descrição</h3>
            <p className="text-sm">{product.descricao}</p>
          </div>
        )}
        
        {product.fornecedor && (
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Fornecedor</h3>
            <p className="font-medium">{product.fornecedor}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2 pt-4 border-t">
        <Button variant="outline" className="w-full flex items-center" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar Produto
        </Button>
        <Button variant="outline" className="w-full flex items-center text-red-600 hover:text-red-700 hover:bg-red-50" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir Produto
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductDetailsPanel;
