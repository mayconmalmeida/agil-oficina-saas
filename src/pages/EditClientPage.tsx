import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Car, ArrowLeft, Plus } from 'lucide-react';
import ClientForm from '@/components/clients/ClientForm';
import VehicleManagement from '@/components/clients/VehicleManagement';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ClientData {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  documento?: string;
  tipo?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  bairro?: string;
  numero?: string;
  // Dados do veículo principal
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  cor?: string;
  kilometragem?: string;
}

const EditClientPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cliente');

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    if (!id || !user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setClientData(data);
    } catch (error: any) {
      console.error('Erro ao carregar cliente:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados do cliente."
      });
      navigate('/dashboard/clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    toast({
      title: "Cliente atualizado",
      description: "Os dados do cliente foram atualizados com sucesso."
    });
    navigate('/dashboard/clientes');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Cliente não encontrado.</p>
          <Button onClick={() => navigate('/dashboard/clientes')}>
            Voltar aos Clientes
          </Button>
        </div>
      </div>
    );
  }

  // Transformar os dados para o formato esperado pelo ClientForm
  const initialData = {
    nome: clientData.nome,
    tipo: clientData.tipo as 'pf' | 'pj' || 'pf',
    documento: clientData.documento || '',
    telefone: clientData.telefone,
    email: clientData.email || '',
    cep: clientData.cep || '',
    endereco: clientData.endereco || '',
    numero: clientData.numero || '',
    bairro: clientData.bairro || '',
    cidade: clientData.cidade || '',
    estado: clientData.estado || '',
    veiculo: {
      marca: clientData.marca || '',
      modelo: clientData.modelo || '',
      ano: clientData.ano || '',
      placa: clientData.placa || '',
      cor: clientData.cor || '',
      kilometragem: clientData.kilometragem || ''
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/dashboard/clientes')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Editar Cliente</h1>
            <p className="text-muted-foreground">{clientData.nome}</p>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cliente" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Dados do Cliente
          </TabsTrigger>
          <TabsTrigger value="veiculos" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Veículos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cliente" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Edite as informações básicas do cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientForm
                onSave={handleSave}
                initialData={initialData}
                isEditing={true}
                clientId={id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="veiculos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Veículos do Cliente
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Veículo
                </Button>
              </CardTitle>
              <CardDescription>
                Gerencie todos os veículos associados a este cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleManagement clientId={id!} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditClientPage;