
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SchedulingForm from '@/components/scheduling/SchedulingForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { safeRpc } from '@/utils/supabaseTypes';
import Loading from '@/components/ui/loading';

const NewAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('is_active', true)
        .order('nome');

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
      } else {
        setClients(clientsData || []);
      }

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
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
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para criar agendamentos.",
        });
        navigate('/login');
        return;
      }

      const { error } = await safeRpc('create_agendamento', {
        p_user_id: session.user.id,
        p_data: data.data.toISOString().split('T')[0],
        p_horario: data.horario,
        p_cliente_id: data.cliente_id,
        p_veiculo_id: data.veiculo_id,
        p_servico_id: data.servico_id,
        p_observacoes: data.observacoes || '',
        p_status: 'agendado'
      });

      if (error) {
        console.error('Error creating appointment:', error);
        toast({
          variant: "destructive",
          title: "Erro ao criar agendamento",
          description: "Não foi possível criar o agendamento.",
        });
        return;
      }

      toast({
        title: "Agendamento criado!",
        description: "O agendamento foi criado com sucesso.",
      });

      navigate('/agendamentos');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return <Loading text="Carregando dados..." fullscreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Novo Agendamento</h1>
            <p className="text-gray-600 mt-2">Agende um novo serviço para seu cliente</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/agendamentos')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Agendamento</CardTitle>
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
    </div>
  );
};

export default NewAppointmentPage;
