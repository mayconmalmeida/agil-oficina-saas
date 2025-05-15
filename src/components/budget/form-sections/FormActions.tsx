
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  isLoading: boolean;
  onSkip: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ isLoading, onSkip }) => {
  return (
    <>
      <Button 
        type="submit" 
        className="w-full bg-oficina hover:bg-blue-700"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Criando...
          </>
        ) : (
          'Criar Orçamento e Finalizar'
        )}
      </Button>
      
      <div className="text-center mt-4">
        <Button 
          variant="link" 
          onClick={onSkip}
          type="button"
        >
          Pular esta etapa por enquanto
        </Button>
      </div>
    </>
  );
};

export default FormActions;
