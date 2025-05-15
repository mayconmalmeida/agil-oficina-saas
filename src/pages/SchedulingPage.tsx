
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { safeRpc } from '@/utils/supabaseTypes';
import SchedulingHeader from '@/components/scheduling/SchedulingHeader';
import SchedulingForm, { SchedulingFormValues } from '@/components/scheduling/SchedulingForm';
import Loading from '@/components/ui/loading';

const SchedulingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch clients and services
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Ensure agendamentos table exists
        await safeRpc('create_agendamentos_table', {});
        
        // Fetch clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .order('nome', { ascending: true });
        
        if (clientsError) {
          throw new Error(`Erro ao buscar clientes: ${clientsError.message}`);
        }
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .order('nome', { ascending: true });
          
        if (servicesError) {
          throw new Error(`Erro ao buscar serviços: ${servicesError.message}`);
        }
        
        setClients(clientsData || []);
        setServices(servicesData || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao carregar os dados",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Handle form submission
  const handleSubmit = async (data: SchedulingFormValues) => {
    setIsSubmitting(true);
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      
      // Use the safeRpc function to call the create_agendamento RPC
      const { error: insertError } = await safeRpc('create_agendamento', {
        p_user_id: userId,
        p_data: format(data.data, 'yyyy-MM-dd'),
        p_horario: data.horario,
        p_cliente_id: data.cliente_id,
        p_veiculo_id: data.veiculo_id, 
        p_servico_id: data.servico_id,
        p_observacoes: data.observacoes || '',
        p_status: 'agendado'
      });
      
      if (insertError) throw insertError;
      
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
      });
      
      // Navigate back to scheduling list
      navigate('/agendamentos');
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar agendamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar o agendamento",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <Loading text="Carregando formulário de agendamento..." />;
  }
  
  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <SchedulingHeader />
      <SchedulingForm 
        onSubmit={handleSubmit} 
        isLoading={isSubmitting} 
        clients={clients} 
        services={services} 
      />
    </div>
  );
};

export default SchedulingPage;
