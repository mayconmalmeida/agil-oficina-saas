
import React from 'react';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClientForm, ClientFormValues, clientFormSchema } from '@/hooks/useClientForm';
import PersonalInfoSection from './form-sections/PersonalInfoSection';
import AddressSection from './form-sections/AddressSection';
import VehicleInfoSection from './form-sections/VehicleInfoSection';
import FormActions from './form-sections/FormActions';

export type { ClientFormValues };
export { clientFormSchema };

interface EnhancedClientFormProps {
  onSave: () => void;
  isLoading?: boolean;
  saveSuccess?: boolean;
  initialData?: Partial<ClientFormValues>;
}

const EnhancedClientForm: React.FC<EnhancedClientFormProps> = ({ 
  onSave, 
  isLoading: externalIsLoading, 
  saveSuccess: externalSaveSuccess,
  initialData = {}
}) => {
  const {
    form,
    activeTab,
    setActiveTab,
    isLoading: internalIsLoading,
    saveSuccess: internalSaveSuccess,
    handleNextTab,
    handlePrevTab,
    onSubmit
  } = useClientForm({ 
    onSave,
    initialData
  });
  
  // Use external state if provided, otherwise use internal state
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
  const saveSuccess = externalSaveSuccess !== undefined ? externalSaveSuccess : internalSaveSuccess;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="overflow-visible">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="cliente" className="flex-1">Dados do Cliente</TabsTrigger>
            <TabsTrigger value="veiculo" className="flex-1">Dados do Veículo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cliente" className="overflow-visible">
            <div className="space-y-4">
              <PersonalInfoSection form={form} saveSuccess={saveSuccess} />
              <AddressSection form={form} saveSuccess={saveSuccess} />
              <FormActions 
                isLoading={isLoading} 
                saveSuccess={saveSuccess} 
                onPrev={handleNextTab}
                isFirstTab={true} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="veiculo" className="overflow-visible">
            <div className="space-y-4">
              <VehicleInfoSection form={form} saveSuccess={saveSuccess} />
              <FormActions 
                isLoading={isLoading} 
                saveSuccess={saveSuccess} 
                onPrev={handlePrevTab}
                isFirstTab={false}
              />
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default EnhancedClientForm;
