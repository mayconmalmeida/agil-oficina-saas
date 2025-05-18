
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

interface FormActionsProps {
  isLoading: boolean;
  saveSuccess: boolean;
  onPrev: () => void;
  isFirstTab: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  isLoading, 
  saveSuccess, 
  onPrev,
  isFirstTab
}) => {
  return (
    <div className="flex justify-between pt-4">
      {!isFirstTab && (
        <Button 
          type="button" 
          variant="outline"
          onClick={onPrev}
          disabled={saveSuccess}
        >
          Voltar: Dados do Cliente
        </Button>
      )}
      
      <div className={isFirstTab ? 'ml-auto' : ''}>
        {isFirstTab ? (
          <Button 
            type="button" 
            onClick={onPrev}
            disabled={saveSuccess}
          >
            Próximo: Dados do Veículo
          </Button>
        ) : (
          <Button 
            type="submit" 
            className={`transition-colors ${saveSuccess 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-oficina hover:bg-blue-700"}`}
            disabled={isLoading || saveSuccess}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Adicionando...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Cliente adicionado!
              </>
            ) : (
              'Adicionar Cliente'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FormActions;
