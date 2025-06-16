
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  activeTab: string;
  isLoading: boolean;
  isEditing?: boolean;
  saveSuccess?: boolean;
  onNextTab: () => void;
  onPrevTab: () => void;
  onSubmit: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  activeTab,
  isLoading,
  isEditing = false,
  saveSuccess = false,
  onNextTab,
  onPrevTab,
  onSubmit
}) => {
  console.log('FormActions renderizado:', { activeTab, isLoading, isEditing, saveSuccess });

  if (activeTab === 'cliente') {
    return (
      <div className="flex justify-end">
        <Button 
          type="button" 
          onClick={onNextTab}
          className="bg-oficina hover:bg-blue-700"
          disabled={isLoading || saveSuccess}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : (
            'Próximo: Veículo'
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onPrevTab}
        disabled={isLoading || saveSuccess}
      >
        Voltar
      </Button>
      <Button 
        type="button"
        onClick={onSubmit}
        className="bg-oficina hover:bg-blue-700"
        disabled={isLoading || saveSuccess}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          isEditing ? 'Salvar Alterações' : 'Salvar Cliente'
        )}
      </Button>
    </div>
  );
};

export default FormActions;
