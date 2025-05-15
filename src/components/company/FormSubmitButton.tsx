
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface FormSubmitButtonProps {
  isLoading: boolean;
}

const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({ isLoading }) => {
  return (
    <div className="flex justify-end">
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> 
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> 
            Salvar Alterações
          </>
        )}
      </Button>
    </div>
  );
};

export default FormSubmitButton;
