
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import ClientInfoFields from './form-sections/ClientInfoFields';
import ClientContactFields from './form-sections/ClientContactFields';
import ClientVehicleFields from './form-sections/ClientVehicleFields';
import { useClientFormBasic } from '@/hooks/useClientFormBasic';

import { useSanitizedForm } from '@/hooks/useSanitizedForm';
import { sanitizePhone, sanitizeEmail, sanitizeName } from '@/utils/formUtils';

export interface ClientFormProps {
  onSubmit?: (values: any) => Promise<void>;
  onSkip?: () => void;
  onSuccess?: () => void;
  isLoading?: boolean;
  saveSuccess?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ 
  onSubmit, 
  onSkip, 
  onSuccess,
  isLoading = false, 
  saveSuccess = false 
}) => {
  const { form } = useClientFormBasic();

  // Mapear campos para suas respectivas funções de sanitização
  const sanitizeMap = {
    telefone: sanitizePhone,
    email: sanitizeEmail,
    nome: sanitizeName,
  };

  // Uso do hook middleware, que irá sanitizar os campos antes do submit
  const sanitizedHandleSubmit = useSanitizedForm(form, sanitizeMap);

  const handleFormSubmit = async (values: any) => {
    if (onSubmit) {
      await onSubmit(values);
    }
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={sanitizedHandleSubmit(handleFormSubmit)} className="space-y-4">
        <ClientInfoFields 
          form={form} 
          saveSuccess={saveSuccess} 
          // handlePhoneFormat prop removido: sanitização agora via hook/utilitário
        />
        
        <ClientContactFields 
          form={form} 
        />
        
        <div className="border-t pt-3 mt-2">
          <h3 className="text-md font-medium mb-3">Dados do Veículo</h3>
          
          <ClientVehicleFields 
            form={form} 
            saveSuccess={saveSuccess} 
          />
        </div>
        
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
              Adicionando...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Cliente adicionado!
            </>
          ) : (
            'Adicionar Cliente e Continuar'
          )}
        </Button>
        
        {!saveSuccess && onSkip && (
          <div className="text-center mt-4">
            <Button 
              variant="link" 
              onClick={onSkip}
              type="button"
            >
              Pular esta etapa por enquanto
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default ClientForm;
