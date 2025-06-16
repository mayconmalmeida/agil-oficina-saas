
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProductsPageHeaderProps {
  onNewProduct: () => void;
}

const ProductsPageHeader: React.FC<ProductsPageHeaderProps> = ({
  onNewProduct
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Gerenciar Produtos e Peças</h1>
      <div className="flex gap-3">
        <Button onClick={onNewProduct}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>
    </div>
  );
};

export default ProductsPageHeader;
