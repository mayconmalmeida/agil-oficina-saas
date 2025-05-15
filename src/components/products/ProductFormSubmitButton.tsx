
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface ProductFormSubmitButtonProps {
  isLoading: boolean;
  isEditing?: boolean;
}

const ProductFormSubmitButton: React.FC<ProductFormSubmitButtonProps> = ({
  isLoading,
  isEditing = false
}) => {
  return (
    <Button 
      type="submit" 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEditing ? 'Salvando alterações...' : 'Adicionando produto...'}
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {isEditing ? 'Salvar alterações' : 'Adicionar produto'}
        </>
      )}
    </Button>
  );
};

export default ProductFormSubmitButton;
