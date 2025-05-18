
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Componentes refatorados
import ClientHeader from './details/ClientHeader';
import ClientContactInfo from './details/ClientContactInfo';
import ClientVehicleInfo from './details/ClientVehicleInfo';
import ClientBudgetsList from './details/ClientBudgetsList';

interface ClientDetailsPanelProps {
  clientId: string;
  onClose: () => void;
}

interface ClientBudget {
  id: string;
  created_at: string;
  valor_total: number;
  status: string;
  descricao: string;
}

const ClientDetailsPanel: React.FC<ClientDetailsPanelProps> = ({ clientId, onClose }) => {
  const [client, setClient] = useState<any>(null);
  const [budgets, setBudgets] = useState<ClientBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchClientDetails = async () => {
      setIsLoading(true);
      try {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();
        
        if (clientError) {
          console.error('Erro ao buscar cliente:', clientError);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar os detalhes do cliente.",
          });
          return;
        }
        
        setClient(clientData);
        
        // Buscar orçamentos do cliente
        const { data: budgetsData, error: budgetsError } = await supabase
          .from('orcamentos')
          .select('*')
          .eq('cliente', clientData.nome)
          .order('created_at', { ascending: false });
        
        if (budgetsError) {
          console.error('Erro ao buscar orçamentos:', budgetsError);
        } else {
          setBudgets(budgetsData || []);
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId, toast]);
  
  const handleCreateBudget = () => {
    if (client) {
      navigate(`/orcamentos/novo?clienteId=${client.id}&clienteNome=${encodeURIComponent(client.nome)}`);
    }
  };
  
  const handleCreateBudgetWithVehicle = () => {
    if (client) {
      navigate(`/orcamentos/novo?clienteId=${client.id}&clienteNome=${encodeURIComponent(client.nome)}&veiculo=${encodeURIComponent(client.marca + ' ' + client.modelo + ' ' + (client.placa ? `(${client.placa})` : ''))}`);
    }
  };
  
  const handleViewBudget = (budgetId: string) => {
    navigate(`/orcamentos/${budgetId}`);
  };
  
  if (!client) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Detalhes do Cliente</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <p>Carregando detalhes...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Detalhes do Cliente</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <ClientHeader nome={client.nome} created_at={client.created_at} />
          
          <Separator />
          
          <ClientContactInfo telefone={client.telefone} email={client.email} />
          
          {(client.marca || client.modelo || client.placa) && (
            <ClientVehicleInfo 
              marca={client.marca}
              modelo={client.modelo}
              ano={client.ano}
              placa={client.placa}
              onCreateBudget={handleCreateBudgetWithVehicle}
            />
          )}
          
          <ClientBudgetsList 
            budgets={budgets} 
            onViewBudget={handleViewBudget} 
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        <Button onClick={handleCreateBudget}>Novo Orçamento</Button>
      </CardFooter>
    </Card>
  );
};

export default ClientDetailsPanel;
