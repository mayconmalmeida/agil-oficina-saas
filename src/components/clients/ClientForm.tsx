
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import ClientInfoFields from './form-sections/ClientInfoFields';
import ClientContactFields from './form-sections/ClientContactFields';
import ClientVehicleFields from './form-sections/ClientVehicleFields';
import { useClientFormBasic } from '@/hooks/useClientFormBasic';

export interface ClientFormProps {
  onSubmit: (values: any) => Promise<void>;
  onSkip: () => void;
  isLoading: boolean;
  saveSuccess: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ 
  onSubmit, 
  onSkip, 
  isLoading, 
  saveSuccess 
}) => {
  const { form, handlePhoneFormat } = useClientFormBasic();
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ClientInfoFields 
          form={form} 
          saveSuccess={saveSuccess} 
          handlePhoneFormat={handlePhoneFormat} 
        />
        
        <ClientContactFields 
          form={form} 
          saveSuccess={saveSuccess} 
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
        
        {!saveSuccess && (
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
