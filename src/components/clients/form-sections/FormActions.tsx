
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

interface FormActionsProps {
  isLoading: boolean;
  saveSuccess: boolean;
  onPrev?: () => void;
  isFirstTab: boolean;
  isEditing?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  isLoading,
  saveSuccess,
  onPrev,
  isFirstTab,
  isEditing = false
}) => {
  return (
    <div className="flex flex-col space-y-4 pt-4">
      <Button 
        type="submit" 
        className={`w-full transition-colors ${saveSuccess 
          ? "bg-green-500 hover:bg-green-600" 
          : "bg-oficina hover:bg-blue-700"}`}
        disabled={isLoading || saveSuccess}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            {isEditing ? 'Salvando...' : 'Adicionando...'}
          </>
        ) : saveSuccess ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            {isEditing ? 'Cliente atualizado!' : 'Cliente adicionado!'}
          </>
        ) : (
          <>
            {isEditing ? 'Salvar Alterações' : 'Salvar Cliente'}
          </>
        )}
      </Button>
      
      {!isFirstTab && onPrev && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrev} 
          className="w-full"
          disabled={isLoading || saveSuccess}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Dados Pessoais
        </Button>
      )}
      
      {isFirstTab && onPrev && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrev} 
          className="w-full"
          disabled={isLoading || saveSuccess}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Continuar para Dados do Veículo
        </Button>
      )}
    </div>
  );
};

export default FormActions;
