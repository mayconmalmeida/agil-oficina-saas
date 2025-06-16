
import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

interface EmptyProductsStateProps {
  searchQuery: string;
  onNewProduct: () => void;
}

const EmptyProductsState: React.FC<EmptyProductsStateProps> = ({
  searchQuery,
  onNewProduct
}) => {
  if (searchQuery) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-500 mb-4">
          Não encontramos produtos que correspondam à sua busca por "{searchQuery}".
        </p>
        <Button onClick={onNewProduct} className="inline-flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar novo produto
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Nenhum produto cadastrado
      </h3>
      <p className="text-gray-500 mb-4">
        Comece cadastrando seu primeiro produto ou peça de reposição.
      </p>
      <Button onClick={onNewProduct} className="inline-flex items-center">
        <Plus className="h-4 w-4 mr-2" />
        Cadastrar primeiro produto
      </Button>
    </div>
  );
};

export default EmptyProductsState;
