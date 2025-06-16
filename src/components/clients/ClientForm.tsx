
import React from 'react';
import { useClientForm } from '@/hooks/useClientForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import PersonalInfoSection from './form-sections/PersonalInfoSection';
import VehicleInfoSection from './form-sections/VehicleInfoSection';
import FormActions from './form-sections/FormActions';
import { CheckCircle } from 'lucide-react';

interface ClientFormProps {
  onSave: () => void;
  initialData?: any;
  isEditing?: boolean;
  clientId?: string;
}

const ClientForm: React.FC<ClientFormProps> = ({
  onSave,
  initialData = {},
  isEditing = false,
  clientId
}) => {
  console.log('ClientForm renderizado:', { isEditing, clientId, initialData });

  const {
    form,
    activeTab,
    setActiveTab,
    isLoading,
    saveSuccess,
    setSaveSuccess,
    handleNextTab,
    handlePrevTab,
    onSubmit
  } = useClientForm({
    onSave,
    initialData,
    isEditing,
    clientId
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit triggered');
    
    const values = form.getValues();
    console.log('Valores do formulário:', values);
    
    await onSubmit(values);
  };

  const handleSaveClick = async () => {
    console.log('Save button clicked');
    const values = form.getValues();
    console.log('Valores para salvar:', values);
    
    await onSubmit(values);
  };

  // Mostrar feedback de sucesso
  if (saveSuccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-green-700">
              {isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente adicionado com sucesso!'}
            </h3>
            <p className="text-gray-600">
              {isEditing ? 'As alterações foram salvas.' : 'O cliente foi cadastrado no sistema.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cliente">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="veiculo">Veículo</TabsTrigger>
              </TabsList>

              <TabsContent value="cliente" className="space-y-4">
                <PersonalInfoSection form={form} />
              </TabsContent>

              <TabsContent value="veiculo" className="space-y-4">
                <VehicleInfoSection form={form} />
              </TabsContent>
            </Tabs>

            <FormActions
              activeTab={activeTab}
              isLoading={isLoading}
              isEditing={isEditing}
              onNextTab={handleNextTab}
              onPrevTab={handlePrevTab}
              onSubmit={handleSaveClick}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ClientForm;
