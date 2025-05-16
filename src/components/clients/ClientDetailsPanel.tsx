
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { User, Car, Phone, Mail, Edit, X, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'concluído': return 'bg-blue-100 text-blue-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
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
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium">{client.nome}</h3>
              <p className="text-sm text-gray-500">Cliente desde {formatDate(client.created_at)}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Informações de Contato</h3>
            
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{client.telefone}</span>
            </div>
            
            {client.email && (
              <div className="flex items-center gap-2 text-sm mt-1">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{client.email}</span>
              </div>
            )}
          </div>
          
          {(client.marca || client.modelo || client.placa) && (
            <>
              <Separator />
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Veículo</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCreateBudgetWithVehicle}
                    className="h-7 text-xs"
                  >
                    Orçar
                  </Button>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <Car className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p>{client.marca} {client.modelo} {client.ano && `(${client.ano})`}</p>
                    {client.placa && <p className="text-gray-500">Placa: {client.placa}</p>}
                  </div>
                </div>
              </div>
            </>
          )}
          
          <Tabs defaultValue="budgets">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
              <TabsTrigger value="notes">Observações</TabsTrigger>
            </TabsList>
            <TabsContent value="budgets" className="mt-4">
              {budgets.length > 0 ? (
                <div className="space-y-3">
                  {budgets.slice(0, 3).map((budget) => (
                    <div key={budget.id} className="border rounded-md p-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{formatDate(budget.created_at)}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{budget.descricao}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge className={getStatusColor(budget.status)}>{budget.status}</Badge>
                          <p className="text-sm font-medium mt-1">{formatCurrency(budget.valor_total)}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-2 h-7 text-xs"
                        onClick={() => handleViewBudget(budget.id)}
                      >
                        Ver detalhes <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                  
                  {budgets.length > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                    >
                      Ver todos ({budgets.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Nenhum orçamento encontrado</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Sem observações</p>
              </div>
            </TabsContent>
          </Tabs>
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
