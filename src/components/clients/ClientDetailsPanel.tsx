
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Edit, FileText, Car, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ClientDetailsPanelProps {
  clientId: string;
  onClose: () => void;
}

// Mock data - replace with actual client fetch
const mockClient = {
  id: "1",
  nome: "João Silva",
  telefone: "(11) 98765-4321",
  email: "joao.silva@email.com",
  documento: "123.456.789-00",
  endereco: "Rua das Flores, 123",
  bairro: "Centro",
  cidade: "São Paulo",
  estado: "SP",
  cep: "01234-567",
  veiculos: [
    { placa: "ABC1234", marca: "Toyota", modelo: "Corolla", ano: 2020, cor: "Prata" },
    { placa: "XYZ5678", marca: "Honda", modelo: "Civic", ano: 2019, cor: "Preto" }
  ],
  historico: [
    { 
      id: "1", 
      tipo: "orçamento", 
      data: "2023-03-15", 
      valor: 850.00, 
      descricao: "Troca de óleo e filtros",
      status: "aprovado"
    },
    { 
      id: "2", 
      tipo: "serviço", 
      data: "2023-03-18", 
      valor: 850.00, 
      descricao: "Troca de óleo e filtros",
      status: "concluído"
    },
    { 
      id: "3", 
      tipo: "orçamento", 
      data: "2023-05-10", 
      valor: 1250.00, 
      descricao: "Revisão completa",
      status: "pendente"
    }
  ]
};

const ClientDetailsPanel: React.FC<ClientDetailsPanelProps> = ({ clientId, onClose }) => {
  // In a real app, fetch client details based on clientId
  const client = mockClient;
  
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
          <p className="text-sm text-muted-foreground">{client.documento}</p>
          
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Contato</h3>
              <p className="text-sm">{client.telefone}</p>
              <p className="text-sm">{client.email}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Endereço</h3>
              <p className="text-sm">{client.endereco}</p>
              <p className="text-sm">{client.bairro}, {client.cidade} - {client.estado}</p>
              <p className="text-sm">{client.cep}</p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Edit className="h-3 w-3" /> Editar
            </Button>
            <Button size="sm" variant="outline" className="flex items-center gap-1">
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
            {client.veiculos.map((veiculo, index) => (
              <div key={index} className="mb-3 p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="mb-1">{veiculo.placa}</Badge>
                    <h4 className="font-medium">{veiculo.marca} {veiculo.modelo}</h4>
                    <p className="text-sm text-muted-foreground">
                      {veiculo.ano} • {veiculo.cor}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-1" /> Orçar
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="historico" className="mt-4">
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
                        <Button variant="outline" size="sm">Ver detalhes</Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ClientDetailsPanel;
