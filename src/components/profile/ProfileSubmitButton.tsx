
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

interface ProfileSubmitButtonProps {
  isLoading: boolean;
  saveSuccess: boolean;
}

const ProfileSubmitButton: React.FC<ProfileSubmitButtonProps> = ({ 
  isLoading, 
  saveSuccess 
}) => {
  return (
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
          Salvando...
        </>
      ) : saveSuccess ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Salvo com sucesso!
        </>
      ) : (
        'Salvar e Continuar'
      )}
    </Button>
  );
};

export default ProfileSubmitButton;
