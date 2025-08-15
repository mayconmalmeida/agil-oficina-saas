
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SchedulingForm from '@/components/scheduling/SchedulingForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useOficinaFilters, getOficinaFilter } from '@/hooks/useOficinaFilters';
import Loading from '@/components/ui/loading';

const NewSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const { oficina_id, user_id, isReady } = useOficinaFilters();

  useEffect(() => {
    if (isReady) {
      fetchInitialData();
    }
  }, [isReady]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      
      const filter = getOficinaFilter(oficina_id, user_id);
      if (!filter) {
        throw new Error('Filtros de oficina não disponíveis');
      }

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('oficina_id', oficina_id)
        .eq('is_active', true)
        .order('nome');

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
      } else {
        setClients(clientsData || []);
      }

      // Fetch services (only tipo = 'servico')
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user_id)
        .eq('tipo', 'servico')
        .eq('is_active', true)
        .order('nome');

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      } else {
        setServices(servicesData || []);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar clientes e serviços.",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (data: any) => {
    if (!isReady) return;
    
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const filter = getOficinaFilter(oficina_id, user_id);
      if (!filter) {
        throw new Error('Filtros de oficina não disponíveis');
      }

      // Prepare agendamento data
      const agendamentoData = {
        user_id: user.id,
        oficina_id: oficina_id,
        data_agendamento: data.data,
        horario: data.horario,
        cliente_id: data.cliente_id,
        servico_id: data.servico_id,
        observacoes: data.observacoes || '',
        status: 'agendado'
      };

      console.log('Dados do agendamento:', agendamentoData);

      const { error } = await supabase
        .from('agendamentos')
        .insert([agendamentoData]);

      if (error) throw error;

      toast({
        title: "Agendamento criado",
        description: "Agendamento foi criado com sucesso.",
      });

      navigate('/dashboard/agendamentos');
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar agendamento",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return <Loading text="Carregando dados..." fullscreen />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Novo Agendamento</h1>
          <p className="text-gray-600 mt-2">Agende um novo serviço para seu cliente</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/agendamentos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Agendamento</CardTitle>
          <CardDescription>
            Preencha os dados para criar um novo agendamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchedulingForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            clients={clients}
            services={services}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSchedulePage;
