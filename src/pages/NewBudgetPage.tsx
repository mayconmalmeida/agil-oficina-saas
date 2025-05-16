
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BudgetForm from '@/components/budget/BudgetForm';
import BudgetPageHeader from '@/components/budget/BudgetPageHeader';
import { useBudgetForm } from '@/hooks/useBudgetForm';
import Loading from '@/components/ui/loading';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const NewBudgetPage: React.FC = () => {
  const { isLoading, handleSubmit, skipStep, userId } = useBudgetForm();
  const [searchParams] = useSearchParams();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loadingClient, setLoadingClient] = useState(false);
  
  const clientId = searchParams.get('clienteId');
  const clienteNome = searchParams.get('clienteNome');
  const veiculo = searchParams.get('veiculo');
  
  // Pre-populate form if client ID is provided
  useEffect(() => {
    const fetchClientInfo = async () => {
      if (!clientId) {
        // If we already have client name and vehicle, we can use that directly
        if (clienteNome && veiculo) {
          setInitialValues({
            cliente: clienteNome,
            veiculo: veiculo
          });
          return;
        }
        
        // No client ID and no direct values
        return;
      }
      
      setLoadingClient(true);
      
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();
          
        if (error) {
          console.error('Error fetching client:', error);
          return;
        }
        
        if (!data) {
          console.log('No client found with ID:', clientId);
          return;
        }
        
        // Set initial values for the form
        setInitialValues({
          cliente: data.nome,
          veiculo: veiculo || `${data.marca || ''} ${data.modelo || ''} ${data.placa ? `(${data.placa})` : ''}`.trim()
        });
        
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoadingClient(false);
      }
    };
    
    fetchClientInfo();
  }, [clientId, clienteNome, veiculo]);
  
  if (userId === undefined) {
    return <Loading fullscreen text="Verificando credenciais..." />;
  }
  
  if (loadingClient) {
    return <Loading fullscreen text="Carregando dados do cliente..." />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <BudgetPageHeader 
          title="Novo Orçamento" 
          subtitle="Registre um orçamento para seu cliente" 
        />
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Dados do Orçamento</CardTitle>
            <CardDescription>
              Informe os detalhes do serviço a ser realizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetForm 
              onSubmit={handleSubmit}
              onSkip={skipStep}
              isLoading={isLoading}
              initialValues={initialValues}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewBudgetPage;
