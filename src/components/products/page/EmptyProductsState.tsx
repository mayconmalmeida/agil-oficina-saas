
import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Plus, Upload } from 'lucide-react';

interface EmptyProductsStateProps {
  searchQuery: string;
  onNewProduct: () => void;
  onImportModal: () => void;
}

const EmptyProductsState: React.FC<EmptyProductsStateProps> = ({
  searchQuery,
  onNewProduct,
  onImportModal
}) => {
  return (
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
          <Button onClick={onNewProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Primeiro Produto
          </Button>
          <Button variant="outline" onClick={onImportModal}>
            <Upload className="mr-2 h-4 w-4" />
            Importar XML
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyProductsState;
