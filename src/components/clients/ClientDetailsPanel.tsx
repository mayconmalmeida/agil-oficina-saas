
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Edit, Car } from 'lucide-react';
import ClientHeader from './details/ClientHeader';
import ClientContactInfo from './details/ClientContactInfo';
import ClientVehicleInfo from './details/ClientVehicleInfo';
import ClientBudgetsList from './details/ClientBudgetsList';
import { Client } from '@/utils/supabaseTypes';

interface ClientDetailsPanelProps {
  clientId: string;
  onClose: () => void;
  onEdit?: () => void;
  onCreateBudget?: (clientId: string) => void;
}

const ClientDetailsPanel: React.FC<ClientDetailsPanelProps> = ({ 
  clientId, 
  onClose,
  onEdit,
  onCreateBudget
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchClientDetails = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();
          
        if (error) throw error;
        
        // Ensure tipo property is set to default 'pf' if missing
        const clientData = {
          ...(data as any),
          tipo: (data as any).tipo || 'pf'
        };
        
        setClient(clientData as Client);
      } catch (error: any) {
        console.error('Error fetching client details:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar cliente",
          description: "Não foi possível carregar os dados do cliente.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId, toast]);

  const handleCreateBudget = () => {
    if (onCreateBudget && client) {
      onCreateBudget(client.id);
    }
  };
  
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle className="text-xl">Detalhes do Cliente</CardTitle>
        <div className="flex space-x-2">
          {onEdit && (
            <Button variant="outline" size="icon" onClick={onEdit} title="Editar cliente">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : client ? (
          <>
            <ClientHeader 
              nome={client.nome} 
              documento={client.documento} 
              created_at={client.created_at} 
            />
            <ClientContactInfo 
              telefone={client.telefone}
              email={client.email}
              endereco={client.endereco}
              cidade={client.cidade}
              estado={client.estado}
              cep={client.cep}
            />
            <ClientVehicleInfo 
              veiculo={client.veiculo}
              marca={client.marca}
              modelo={client.modelo}
              ano={client.ano}
              placa={client.placa}
              cor={client.cor}
              kilometragem={client.kilometragem}
              onCreateBudget={handleCreateBudget}
            />
            <ClientBudgetsList 
              clientId={client.id} 
              onViewBudget={(budgetId) => console.log('View budget:', budgetId)}
            />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Cliente não encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientDetailsPanel;
