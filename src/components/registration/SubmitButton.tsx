
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface SubmitButtonProps {
  isLoading: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading }) => {
  return (
    <Button
      type="submit"
      className="w-full"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Finalizar Cadastro
        </>
      )}
    </Button>
  );
};

export default SubmitButton;
