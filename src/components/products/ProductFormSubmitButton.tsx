
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ProductFormSubmitButtonProps {
  isLoading: boolean;
}

const ProductFormSubmitButton: React.FC<ProductFormSubmitButtonProps> = ({ isLoading }) => {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
          Salvando...
        </>
      ) : (
        'Adicionar Produto/Serviço'
      )}
    </Button>
  );
};

export default ProductFormSubmitButton;
