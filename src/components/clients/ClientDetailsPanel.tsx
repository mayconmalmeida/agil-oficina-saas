
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Edit, FileText, Car, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

interface ClientDetailsPanelProps {
  clientId: string;
  onClose: () => void;
  onClientUpdated?: () => void;
}

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  documento?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  veiculos?: Vehicle[];
  historico?: HistoryItem[];
}

interface Vehicle {
  placa?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  cor?: string;
}

interface HistoryItem {
  id: string;
  tipo: string;
  data: string;
  valor: number;
  descricao: string;
  status: string;
}

// Schema for client editing form
const clientEditSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  documento: z.string().optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
  bairro: z.string().optional().or(z.literal("")),
  cidade: z.string().optional().or(z.literal("")),
  estado: z.string().optional().or(z.literal("")),
  cep: z.string().optional().or(z.literal(""))
});

type ClientEditFormValues = z.infer<typeof clientEditSchema>;

const ClientDetailsPanel: React.FC<ClientDetailsPanelProps> = ({ clientId, onClose, onClientUpdated }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<ClientEditFormValues>({
    resolver: zodResolver(clientEditSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      email: "",
      documento: "",
      endereco: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: ""
    }
  });
  
  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();
        
        if (error) {
          console.error('Erro ao buscar cliente:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar cliente",
            description: "Não foi possível carregar os detalhes do cliente.",
          });
          return;
        }
        
        // Fetch budget history
        const { data: orcamentosData, error: orcamentosError } = await supabase
          .from('orcamentos')
          .select('*')
          .eq('cliente', data.nome)
          .order('created_at', { ascending: false });
          
        if (orcamentosError) {
          console.error('Erro ao buscar orçamentos:', orcamentosError);
        }
        
        // Transform the client data
        const clientData: Client = {
          ...data,
          veiculos: [{
            placa: data.placa || "",
            marca: data.marca || "",
            modelo: data.modelo || "",
            ano: data.ano || "",
            cor: ""
          }],
          historico: orcamentosData ? orcamentosData.map(orc => ({
            id: orc.id,
            tipo: 'orçamento',
            data: orc.created_at,
            valor: orc.valor_total,
            descricao: orc.descricao,
            status: orc.status || 'pendente'
          })) : []
        };
        
        setClient(clientData);
        
        // Set form values
        form.reset({
          nome: data.nome || "",
          telefone: data.telefone || "",
          email: data.email || "",
          documento: data.documento || "",
          endereco: data.endereco || "",
          bairro: data.bairro || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
          cep: data.cep || ""
        });
        
      } catch (error) {
        console.error('Erro inesperado:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao carregar os detalhes do cliente.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClient();
  }, [clientId, toast, form]);
  
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
  
  // Handle edit client
  const handleEditClient = async (data: ClientEditFormValues) => {
    if (!client) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          nome: data.nome,
          telefone: data.telefone,
          email: data.email,
          documento: data.documento,
          endereco: data.endereco,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep
        })
        .eq('id', clientId);
      
      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar cliente",
          description: error.message,
        });
        return;
      }
      
      toast({
        title: "Cliente atualizado",
        description: "Dados do cliente atualizados com sucesso.",
      });
      
      // Refresh client data
      setClient({
        ...client,
        ...data
      });
      
      // Close dialog
      setShowEditDialog(false);
      
      // Trigger refresh in parent component if provided
      if (onClientUpdated) {
        onClientUpdated();
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o cliente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle new budget
  const handleNewBudget = () => {
    if (!client) return;
    navigate(`/orcamentos/novo?clienteId=${clientId}&clienteNome=${encodeURIComponent(client.nome)}`);
  };
  
  // Handle create budget for vehicle
  const handleVehicleBudget = (vehicle: Vehicle) => {
    if (!client || !vehicle.placa) return;
    navigate(`/orcamentos/novo?clienteId=${clientId}&clienteNome=${encodeURIComponent(client.nome)}&veiculo=${encodeURIComponent(`${vehicle.marca || ''} ${vehicle.modelo || ''} (${vehicle.placa})`)}`);
  };
  
  // Handle view budget details
  const handleViewBudgetDetails = (budgetId: string) => {
    navigate(`/orcamentos/${budgetId}`);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (!client) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cliente não encontrado</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p>Não foi possível encontrar os dados do cliente solicitado.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detalhes do Cliente</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold">{client.nome}</h2>
            {client.documento && (
              <p className="text-sm text-muted-foreground">{client.documento}</p>
            )}
            
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contato</h3>
                <p className="text-sm">{client.telefone}</p>
                {client.email && <p className="text-sm">{client.email}</p>}
              </div>
              
              {client.endereco && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Endereço</h3>
                  <p className="text-sm">{client.endereco}</p>
                  {client.bairro && client.cidade && (
                    <p className="text-sm">{client.bairro}, {client.cidade} {client.estado ? `- ${client.estado}` : ''}</p>
                  )}
                  {client.cep && <p className="text-sm">{client.cep}</p>}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="h-3 w-3" /> Editar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={handleNewBudget}
              >
                <FileText className="h-3 w-3" /> Novo Orçamento
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="veiculos">
            <TabsList className="w-full">
              <TabsTrigger value="veiculos" className="flex-1">
                <Car className="h-4 w-4 mr-2" /> Veículos
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex-1">
                <Calendar className="h-4 w-4 mr-2" /> Histórico
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="veiculos" className="mt-4">
              {client.veiculos && client.veiculos.length > 0 ? (
                client.veiculos.map((veiculo, index) => (
                  <div key={index} className="mb-3 p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        {veiculo.placa && (
                          <Badge variant="outline" className="mb-1">{veiculo.placa}</Badge>
                        )}
                        {veiculo.marca && veiculo.modelo && (
                          <h4 className="font-medium">{veiculo.marca} {veiculo.modelo}</h4>
                        )}
                        {veiculo.ano && (
                          <p className="text-sm text-muted-foreground">
                            {veiculo.ano} {veiculo.cor ? `• ${veiculo.cor}` : ''}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleVehicleBudget(veiculo)}
                      >
                        <FileText className="h-4 w-4 mr-1" /> Orçar
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">Nenhum veículo cadastrado</p>
              )}
            </TabsContent>
            
            <TabsContent value="historico" className="mt-4">
              {client.historico && client.historico.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {client.historico.map((item) => (
                    <AccordionItem value={item.id} key={item.id}>
                      <AccordionTrigger className="py-2">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center">
                            <Badge variant="outline" className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <span className="ml-2">{formatDate(item.data)}</span>
                          </div>
                          <span>{formatCurrency(item.valor)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="py-2">
                          <p className="text-sm font-medium">{item.descricao}</p>
                          <div className="flex justify-end mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewBudgetDetails(item.id)}
                            >
                              Ver detalhes
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center py-4 text-muted-foreground">Nenhum histórico disponível</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Edit Client Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditClient)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento (CPF/CNPJ)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientDetailsPanel;
